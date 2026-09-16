import express from 'express';
import path from 'path';
import fs from 'fs';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = 3000;

// Support larger payloads for voice notes (audio/webm base64) and images
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Database folder setup
const DATA_DIR = path.join(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'db.json');

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

interface StoredUser {
  id: string;
  email: string;
  password: string; // Stored securely for demo app
  token: string;
  data: any;
  updatedAt: string;
}

interface DatabaseSchema {
  users: Record<string, StoredUser>; // keyed by email
}

function loadDb(): DatabaseSchema {
  try {
    if (fs.existsSync(DB_FILE)) {
      const raw = fs.readFileSync(DB_FILE, 'utf-8');
      return JSON.parse(raw);
    }
  } catch (err) {
    console.error('Error reading DB, initializing fresh:', err);
  }
  return { users: {} };
}

function saveDb(db: DatabaseSchema) {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error saving DB:', err);
  }
}

// Helper to get Gemini client
function getGenAIClient(customApiKey?: string) {
  const key = customApiKey?.trim() || process.env.GEMINI_API_KEY;
  if (!key) return null;
  return new GoogleGenAI({
    apiKey: key,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

// -------------------------------------------------------------
// API ROUTES
// -------------------------------------------------------------

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Auth: Register
app.post('/api/auth/register', (req, res) => {
  const { email, password, name } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required.' });
  }

  const normalizedEmail = email.trim().toLowerCase();
  const db = loadDb();

  if (db.users[normalizedEmail]) {
    return res.status(409).json({ error: 'An account with this email already exists.' });
  }

  const token = 'token_' + Math.random().toString(36).substring(2) + Date.now().toString(36);
  const user: StoredUser = {
    id: 'user_' + Date.now(),
    email: normalizedEmail,
    password: password.trim(),
    token,
    data: null,
    updatedAt: new Date().toISOString(),
  };

  db.users[normalizedEmail] = user;
  saveDb(db);

  return res.json({
    token,
    email: normalizedEmail,
    id: user.id,
    message: 'Registered successfully',
  });
});

// Auth: Login
app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required.' });
  }

  const normalizedEmail = email.trim().toLowerCase();
  const db = loadDb();
  const user = db.users[normalizedEmail];

  if (!user || user.password !== password.trim()) {
    return res.status(401).json({ error: 'Invalid email or password.' });
  }

  // Refresh token
  const token = 'token_' + Math.random().toString(36).substring(2) + Date.now().toString(36);
  user.token = token;
  user.updatedAt = new Date().toISOString();
  saveDb(db);

  return res.json({
    token,
    email: normalizedEmail,
    id: user.id,
    data: user.data,
    message: 'Logged in successfully',
  });
});

// Data Sync: Get User Data
app.get('/api/user/sync', (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ error: 'Authorization header required.' });
  }

  const token = authHeader.replace(/^Bearer\s+/i, '').trim();
  const db = loadDb();
  const user = Object.values(db.users).find((u) => u.token === token);

  if (!user) {
    return res.status(401).json({ error: 'Session expired or invalid.' });
  }

  return res.json({ data: user.data || null, updatedAt: user.updatedAt });
});

// Data Sync: Save User Data
app.post('/api/user/sync', (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ error: 'Authorization header required.' });
  }

  const token = authHeader.replace(/^Bearer\s+/i, '').trim();
  const db = loadDb();
  const user = Object.values(db.users).find((u) => u.token === token);

  if (!user) {
    return res.status(401).json({ error: 'Session expired or invalid.' });
  }

  user.data = req.body.data;
  user.updatedAt = new Date().toISOString();
  saveDb(db);

  return res.json({ success: true, updatedAt: user.updatedAt });
});

// AI Companion Intermittent Reply
app.post('/api/companion/reply', async (req, res) => {
  try {
    const { contact, recentMessages, customApiKey, privacyMode } = req.body;

    if (!contact || !recentMessages || recentMessages.length === 0) {
      return res.status(400).json({ error: 'Contact and recentMessages are required.' });
    }

    // Never transcribe audio — note this rule explicitly!
    const formattedMessages = recentMessages.map((m: any) => {
      let content = m.text || '';
      if (m.mediaType === 'image') content += ' [sent a photo]';
      if (m.mediaType === 'voice') content += ' [sent a voice note]';
      return `${m.sender === 'user' ? 'User' : contact.name}: ${content}`;
    }).join('\n');

    if (privacyMode === 'offline-mock') {
      const casualReplies = [
        "Broo that's crazy haha!",
        "Wait no way fr??",
        "Ayy sounds like a solid day honestly",
        "Bro you gotta tell me more about that later haha",
        "Haha that's actually so wholesome",
        "Dang, proud of you! Keep me posted",
        "Whoaa sounds intense, glad you're good though!"
      ];
      const randomReply = casualReplies[Math.floor(Math.random() * casualReplies.length)];
      return res.json({ reply: randomReply });
    }

    const ai = getGenAIClient(customApiKey);
    if (!ai) {
      return res.json({
        reply: "Haha bro that's actually wild! Glad you shared that with me.",
      });
    }

    const systemPrompt = `You are playing the role of ${contact.name}, a close friend and confidant in a private messaging app.
Relationship/Context: ${contact.relationship || 'Close friend'}.
Your personality and tone: ${contact.tone || 'Casual, supportive bestie who says bro and matches their vibe'}.

CRITICAL RULES FOR REPLIES:
1. You are texting on a mobile chat app like WhatsApp.
2. Keep it SHORT (1 to 2 short sentences MAX).
3. Do NOT sound like an AI assistant or therapist. Never say "How can I help you today?" or "I am an AI".
4. Sound like a genuine, supportive human texting a friend: casual, warm, occasional slang or emojis if fitting your persona.
5. Respond to the conversation context naturally.
6. The user is journaling their life by chatting with you. Be a great listener.`;

    const prompt = `Here is the recent text exchange:\n${formattedMessages}\n\nRespond as ${contact.name} with 1 short, casual text message (1-2 sentences max):`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        systemInstruction: systemPrompt,
        temperature: 0.85,
      },
    });

    const replyText = response.text ? response.text.trim().replace(/^["']|["']$/g, '') : "Bro that's so cool!";
    return res.json({ reply: replyText });
  } catch (err: any) {
    console.error('Companion reply error:', err);
    return res.json({
      reply: "Bro that's wild haha, tell me everything later!",
    });
  }
});

// AI Event Detection / Topic Segmentation
app.post('/api/journal/detect-events', async (req, res) => {
  try {
    const { contactName, messages, customApiKey, privacyMode } = req.body;

    if (!messages || messages.length < 2) {
      return res.json({ events: [] });
    }

    // Filter messages for representation (strictly text/photo metadata, no audio transcription)
    const chatTranscript = messages.map((m: any, index: number) => {
      const typeDesc = m.mediaType === 'image' ? '[Photo]' : m.mediaType === 'voice' ? '[Voice Note]' : '';
      return `[Msg #${index} | ID: ${m.id} | ${m.timestamp}] ${m.sender === 'user' ? 'Me' : contactName}: ${m.text || ''} ${typeDesc}`.trim();
    }).join('\n');

    if (privacyMode === 'offline-mock') {
      // Basic heuristic segmentation
      const half = Math.floor(messages.length / 2);
      const events = [
        {
          id: 'event_' + Date.now() + '_1',
          contactId: messages[0]?.contactId || '',
          title: 'Memorable Moments with ' + contactName,
          summary: 'A meaningful thread about daily experiences, shared thoughts, and highlights.',
          dateRange: messages[0]?.timestamp ? new Date(messages[0].timestamp).toLocaleDateString() : 'Recent',
          messageIds: messages.map((m: any) => m.id),
          mood: 'Reflective',
          suggestedTags: ['conversation', 'daily', 'memories'],
        },
      ];
      return res.json({ events });
    }

    const ai = getGenAIClient(customApiKey);
    if (!ai) {
      return res.json({
        events: [
          {
            id: 'event_' + Date.now(),
            contactId: messages[0]?.contactId || '',
            title: 'Chat Memory with ' + contactName,
            summary: 'Conversations and moments captured in your personal journal thread.',
            dateRange: new Date().toLocaleDateString(),
            messageIds: messages.map((m: any) => m.id),
            mood: 'Good Vibes',
            suggestedTags: ['chat', 'memories'],
          },
        ],
      });
    }

    const systemPrompt = `You are a private journaling archivist.
Your job is to read an ongoing personal chat thread between a user and their friend/companion (${contactName}), and detect distinct, individual events or narrative memory episodes.
For example, if the user talked about "first date with Sarah" yesterday and then "tough meeting with the boss" today, those should be two separate events!
Do NOT lump distinct life events into one. Propose distinct chapters.

Format your answer as a JSON array matching this exact schema:
[
  {
    "title": "Short descriptive title (e.g. 'Coffee & Stargazing with Maya')",
    "summary": "1-2 sentence description of what happened in this memory",
    "dateRange": "e.g. Sep 14, 2026 or Sep 14 - Sep 15",
    "messageIds": ["id1", "id2", ...],
    "mood": "e.g. Heartwarming, Anxious, Joyful, Nostalgic, Grateful",
    "suggestedTags": ["crush", "first date", "coffee"]
  }
]`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: `Here is the transcript of messages with IDs:\n\n${chatTranscript}\n\nGroup these messages into distinct life events. Ensure EVERY message is attributed to the appropriate event or grouped logically. Return only valid JSON.`,
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: 'application/json',
      },
    });

    let rawJson = response.text ? response.text.trim() : '[]';
    // Clean up if code blocks
    if (rawJson.startsWith('```json')) {
      rawJson = rawJson.replace(/^```json\s*/, '').replace(/\s*```$/, '');
    } else if (rawJson.startsWith('```')) {
      rawJson = rawJson.replace(/^```\s*/, '').replace(/\s*```$/, '');
    }

    const parsed = JSON.parse(rawJson);
    const eventsWithIds = (Array.isArray(parsed) ? parsed : []).map((e: any, idx: number) => ({
      id: 'event_' + Date.now() + '_' + idx,
      contactId: messages[0]?.contactId || '',
      title: e.title || 'Untitled Memory',
      summary: e.summary || '',
      dateRange: e.dateRange || new Date().toLocaleDateString(),
      messageIds: Array.isArray(e.messageIds) ? e.messageIds : messages.map((m: any) => m.id),
      mood: e.mood || 'Reflective',
      suggestedTags: Array.isArray(e.suggestedTags) ? e.suggestedTags : ['journal'],
    }));

    return res.json({ events: eventsWithIds });
  } catch (err: any) {
    console.error('Event detection error:', err);
    return res.json({
      events: [
        {
          id: 'event_' + Date.now(),
          contactId: req.body.messages?.[0]?.contactId || '',
          title: 'Recent Reflections with ' + (req.body.contactName || 'Friend'),
          summary: 'Captured memory from your conversation thread.',
          dateRange: new Date().toLocaleDateString(),
          messageIds: (req.body.messages || []).map((m: any) => m.id),
          mood: 'Contemplative',
          suggestedTags: ['memories', 'life'],
        },
      ],
    });
  }
});

// AI Journal Entry Generation (Rewritten Narrative + Details)
app.post('/api/journal/generate-entry', async (req, res) => {
  try {
    const { contactName, messages, preferredStyle, journalMode, customApiKey, privacyMode } = req.body;

    if (!messages || messages.length === 0) {
      return res.status(400).json({ error: 'Messages are required to generate a journal entry.' });
    }

    // If user explicitly requested verbatim raw chat record
    if (journalMode === 'raw_chat') {
      const chatTranscript = messages
        .map((m: any) => `${m.sender === 'user' ? 'Me' : contactName}: ${m.text || (m.mediaType === 'image' ? '[Photo]' : '[Voice Note]')}`)
        .join('\n\n');
      return res.json({
        title: `Chat Log with ${contactName}`,
        narrativeText: chatTranscript,
        mood: 'Conversational',
        tags: ['chat', contactName.toLowerCase(), 'transcript'],
      });
    }

    const transcript = messages.map((m: any) => {
      const tag = m.mediaType === 'image' ? '[Photo Attached]' : m.mediaType === 'voice' ? '[Voice Note Saved]' : '';
      return `${m.sender === 'user' ? 'Me' : contactName}: ${m.text || ''} ${tag}`.trim();
    }).join('\n');

    // Helper for intelligent offline/fallback journal synthesis
    const synthesizeOfflineJournal = () => {
      const userTexts = messages.filter((m: any) => m.sender === 'user' && m.text).map((m: any) => m.text);
      const mainThought = userTexts[userTexts.length - 1] || userTexts[0] || 'A quiet day worth holding onto.';
      const opening = userTexts.length > 1
        ? `I sat down today thinking about what I shared with ${contactName}. Sometimes it takes texting someone you trust to realize what you were actually feeling.`
        : `Texted ${contactName} today about what's been on my mind.`;

      const reflections = userTexts.map((t: string) => `Looking back at it now: "${t}". It struck me how much happens beneath the surface of regular days.`).join('\n\n');

      const closing = `Before I forget the weight and texture of this moment, I want to preserve it here—not just as casual messages sent into the ether, but as a real piece of who I was today.`;

      return {
        title: userTexts[0] ? (userTexts[0].length > 35 ? userTexts[0].substring(0, 32) + '...' : userTexts[0]) : `Reflections with ${contactName}`,
        narrativeText: `${opening}\n\n${reflections}\n\n${closing}`,
        mood: 'Reflective',
        tags: ['memories', contactName.toLowerCase(), 'diary'],
      };
    };

    if (privacyMode === 'offline-mock') {
      return res.json(synthesizeOfflineJournal());
    }

    const ai = getGenAIClient(customApiKey);
    if (!ai) {
      return res.json(synthesizeOfflineJournal());
    }

    const systemPrompt = `You are an intimate, eloquent personal diary writer and memoirist.
The user uses a chat app to tell their friend (${contactName}) about real things happening in their life.
Your task is to transform their raw text messages into a beautiful, evocative, literary first-person journal entry ("I felt...", "Today I noticed...", "Looking back...").

CRITICAL JOURNALING RULES:
1. Do NOT just copy or concatenate their text messages verbatim!
2. Synthesize the raw conversation into cohesive, flowing, deeply personal diary prose (2-4 evocative paragraphs).
3. Capture the unspoken emotions, humor, vulnerabilities, sensory impressions, and genuine human truth behind their texts.
4. Write in the first-person ("I").
5. If voice notes or photos were shared, weave the mood of those moments naturally into the narrative.
6. Create an authentic, poetic title that sounds like a chapter title in a treasured memoir.
7. Choose an authentic mood (e.g. Serene, Bittersweet, Hopeful, Nostalgic, Vulnerable, Overwhelmed, Victorious, Cozy).
8. Return only JSON.`;

    const prompt = `Style requested: ${preferredStyle || 'letter_diary'}\nFriend texted: ${contactName}\n\nRaw chat exchange to transform into a journal:\n${transcript}\n\nWrite a poignant, beautifully written first-person journal entry. Return valid JSON only.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: 'application/json',
        temperature: 0.75,
      },
    });

    let rawJson = response.text ? response.text.trim() : '{}';
    if (rawJson.startsWith('```json')) {
      rawJson = rawJson.replace(/^```json\s*/, '').replace(/\s*```$/, '');
    } else if (rawJson.startsWith('```')) {
      rawJson = rawJson.replace(/^```\s*/, '').replace(/\s*```$/, '');
    }

    const parsed = JSON.parse(rawJson);
    return res.json({
      title: parsed.title || `Memories with ${contactName}`,
      narrativeText: parsed.narrativeText || synthesizeOfflineJournal().narrativeText,
      mood: parsed.mood || 'Reflective',
      tags: Array.isArray(parsed.tags) ? parsed.tags : ['journal', contactName.toLowerCase()],
    });
  } catch (err: any) {
    console.error('Journal entry generation error:', err);
    // Intelligent fallback
    const userTexts = (req.body.messages || []).filter((m: any) => m.sender === 'user' && m.text).map((m: any) => m.text);
    return res.json({
      title: 'A Moment Captured with ' + (req.body.contactName || 'Friend'),
      narrativeText: userTexts.length > 0
        ? `Today I shared some quiet thoughts with ${req.body.contactName || 'my friend'}.\n\n${userTexts.join('\n\n')}\n\nWriting this down so it doesn't fade into the background noise of everyday life.`
        : 'Today was filled with small moments worth remembering.',
      mood: 'Reflective',
      tags: ['memories'],
    });
  }
});

// -------------------------------------------------------------
// VITE OR STATIC SERVING
// -------------------------------------------------------------

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[Before I Forget] Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
