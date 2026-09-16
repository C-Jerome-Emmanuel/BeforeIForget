import { AppData, Contact, Message, JournalEntry, PersonalSpaceItem, UserProfile } from './types';

// Curated authentic sample messages for Claude conversation (e.g. First date memory)
const sampleMessages: Message[] = [
  {
    id: 'msg_1',
    contactId: 'contact_claude',
    sender: 'user',
    text: "Bro I need to tell you about tonight before I forget any of it haha",
    mediaType: 'text',
    timestamp: '2026-09-15T20:14:00Z',
    status: 'read',
  },
  {
    id: 'msg_2',
    contactId: 'contact_claude',
    sender: 'user',
    text: "So Maya and I met at the botanical garden around 5:30. The golden hour light was actually insane.",
    mediaType: 'text',
    timestamp: '2026-09-15T20:15:30Z',
    status: 'read',
  },
  {
    id: 'msg_3',
    contactId: 'contact_claude',
    sender: 'user',
    text: "Here's the path we walked down by the glass conservatory:",
    mediaType: 'image',
    mediaUrl: 'https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?auto=format&fit=crop&w=800&q=80',
    timestamp: '2026-09-15T20:16:15Z',
    status: 'read',
  },
  {
    id: 'msg_4',
    contactId: 'contact_claude',
    sender: 'user',
    text: "I was super nervous for the first 10 minutes, but then we started talking about old vinyl records and indie games, and it was like we knew each other forever.",
    mediaType: 'text',
    timestamp: '2026-09-15T20:18:00Z',
    status: 'read',
  },
  {
    id: 'msg_5',
    contactId: 'contact_claude',
    sender: 'user',
    text: "She pointed out this tiny blooming bonsai tree that smelled like jasmine tea. We stopped for like 15 minutes just looking at it.",
    mediaType: 'text',
    timestamp: '2026-09-15T20:19:20Z',
    status: 'read',
  },
  {
    id: 'msg_6',
    contactId: 'contact_claude',
    sender: 'companion',
    text: "Broo that's so cool!! Sounds like the vibe was immaculate. Did you guys get food after??",
    mediaType: 'text',
    timestamp: '2026-09-15T20:20:00Z',
    status: 'read',
    reactions: ['❤️'],
  },
  {
    id: 'msg_7',
    contactId: 'contact_claude',
    sender: 'user',
    text: "YES! We went to this hole-in-the-wall noodle place on 4th Street. The steam on our glasses was hilarious.",
    mediaType: 'text',
    quotedMessageId: 'msg_6',
    timestamp: '2026-09-15T20:22:45Z',
    status: 'read',
  },
  {
    id: 'msg_8',
    contactId: 'contact_claude',
    sender: 'user',
    text: "And when we parted at the station, she gave me a warm hug and said 'Let's not wait a whole week to do this again'. Bro my heart melted.",
    mediaType: 'text',
    timestamp: '2026-09-15T20:24:10Z',
    status: 'read',
    reactions: ['🥹'],
  },
  {
    id: 'msg_9',
    contactId: 'contact_claude',
    sender: 'companion',
    text: "LETS GOOO! Proud of you man. You definitely need to lock that in your journal before you forget!",
    mediaType: 'text',
    timestamp: '2026-09-15T20:25:00Z',
    status: 'read',
    reactions: ['🔥'],
  },
  // Second event: Sunday morning run
  {
    id: 'msg_10',
    contactId: 'contact_claude',
    sender: 'user',
    text: "Morning! Woke up at 6:30 today for that lake run we talked about.",
    mediaType: 'text',
    timestamp: '2026-09-16T07:10:00Z',
    status: 'read',
  },
  {
    id: 'msg_11',
    contactId: 'contact_claude',
    sender: 'user',
    text: "Air was crisp, 55 degrees, light mist over the water. Managed 5 kilometers without stopping once.",
    mediaType: 'text',
    timestamp: '2026-09-16T07:35:00Z',
    status: 'read',
  },
  {
    id: 'msg_12',
    contactId: 'contact_claude',
    sender: 'user',
    text: "Grabbed an iced oat latte on the walk home. Feeling at total peace today.",
    mediaType: 'text',
    timestamp: '2026-09-16T07:42:00Z',
    status: 'read',
  },
];

const sampleContacts: Contact[] = [
  {
    id: 'contact_claude',
    name: 'Claude',
    avatar: '☕',
    relationship: 'Dating & Close Confidant',
    tone: 'Casual, supportive bestie who says bro and matches your hype',
    about: 'Always listening. Tell me everything before you forget.',
    lastActive: 'online',
    messageCountSinceReply: 3,
    unreadCount: 0,
  },
  {
    id: 'contact_jeff',
    name: 'Jeff',
    avatar: '🏃‍♂️',
    relationship: 'Fitness & Adventure Club',
    tone: 'Motivated, chill, active workout buddy',
    about: 'Running, lifting, exploring the outdoors.',
    lastActive: 'yesterday',
    messageCountSinceReply: 0,
    unreadCount: 0,
  },
  {
    id: 'contact_maya',
    name: 'Family & Roots',
    avatar: '🌿',
    relationship: 'Family & Reflections',
    tone: 'Warm, grounding, empathetic, family-oriented',
    about: 'Moments with parents, siblings, home memories.',
    lastActive: '3 days ago',
    messageCountSinceReply: 0,
    unreadCount: 0,
  },
];

const sampleJournals: JournalEntry[] = [
  {
    id: 'journal_1',
    contactId: 'contact_claude',
    contactName: 'Claude',
    title: 'The Golden Hour at the Botanical Garden',
    date: 'September 15, 2026',
    tags: ['crush', 'first date', 'botanical garden', 'magic'],
    style: 'scrapbook',
    mood: 'Heartwarming',
    location: 'City Conservatory & 4th Street',
    coverImage: 'https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?auto=format&fit=crop&w=800&q=80',
    narrativeText: `We met at 5:30 just as the harsh afternoon light melted into honey and bronze against the conservatory glass. For the first ten minutes my stomach was in knots, terrified I would say something clumsy. But then she pointed out a tiny bonsai tree nestled in moss that smelled faintly like sweet jasmine tea, and everything softened.

We ended up walking for hours, losing track of time between vintage records, childhood fears, and funny high school memories. Later at the ramen shop, our glasses fogged up from the steam and we couldn't stop laughing.

When she hugged me goodbye at the train platform, she smiled and whispered: 'Let's not wait a whole week to do this again.' I rode the train back with my headphones off, just wanting to remember the exact sound of her laugh before the night faded.`,
    messageIds: ['msg_1', 'msg_2', 'msg_3', 'msg_4', 'msg_5', 'msg_6', 'msg_7', 'msg_8', 'msg_9'],
    rawMessages: sampleMessages.slice(0, 9),
    createdAt: '2026-09-15T21:00:00Z',
    updatedAt: '2026-09-15T21:00:00Z',
  },
  {
    id: 'journal_2',
    contactId: 'contact_claude',
    contactName: 'Claude',
    title: '5K Lake Run & Crisp Morning Air',
    date: 'September 16, 2026',
    tags: ['fitness', 'morning', 'lake', 'clarity'],
    style: 'letter_diary',
    mood: 'Peaceful',
    location: 'Emerald Lake Trail',
    coverImage: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80',
    narrativeText: `Dear Self,

Today felt like reclaiming my own rhythm. The alarm buzzed at 6:30 and for once I didn't reach for the snooze button. The air off the lake was sharp and 55 degrees, with a light veil of mist hovering over the quiet water.

Running used to feel like punishment; today it felt like prayer. Five full kilometers without pausing. Just the steady thud of shoes against the gravel trail and the quiet realization that my body is stronger than the doubts in my head.

Walking back with an iced oat latte in hand, I watched the morning light filter through the pine branches. I want to keep this feeling close for the busier days ahead.`,
    messageIds: ['msg_10', 'msg_11', 'msg_12'],
    rawMessages: sampleMessages.slice(9, 12),
    createdAt: '2026-09-16T08:00:00Z',
    updatedAt: '2026-09-16T08:00:00Z',
  },
];

const samplePersonalSpace: PersonalSpaceItem[] = [
  {
    id: 'ps_1',
    type: 'thought',
    title: 'The Art of Not Rushing Memories',
    content: 'We spend so much time worrying about the next milestone that we forget to breathe in the middle of the good thing currently happening.',
    tags: ['mindfulness', 'presence'],
    createdAt: '2026-09-14T09:00:00Z',
  },
  {
    id: 'ps_2',
    type: 'quote',
    content: 'Live in each season as it passes; breathe the air, drink the drink, taste the fruit, and resign yourself to the influence of the earth.',
    authorOrRef: 'Henry David Thoreau',
    tags: ['inspiration', 'nature'],
    createdAt: '2026-09-12T14:20:00Z',
  },
  {
    id: 'ps_3',
    type: 'verse',
    title: 'A verse for quiet peace',
    content: 'Peace I leave with you; my peace I give to you. Not as the world gives do I give to you. Let not your hearts be troubled, neither let them be afraid.',
    authorOrRef: 'John 14:27',
    tags: ['scripture', 'comfort', 'peace'],
    createdAt: '2026-09-10T08:15:00Z',
  },
  {
    id: 'ps_4',
    type: 'letter',
    title: 'To Me on New Year’s Eve',
    content: 'Did you make time for the people who matter? Did you stop overthinking every single conversation? Remember the evening at the botanical garden and how simple happiness really is.',
    unlockDate: '2026-12-31T23:59:59Z',
    isLocked: true,
    tags: ['future self', 'milestone'],
    createdAt: '2026-09-15T22:30:00Z',
  },
  {
    id: 'ps_5',
    type: 'note',
    title: 'Things that made me smile this week',
    content: '1. The barista remembering my name\n2. The smell of rain on warm asphalt\n3. Maya laughing so hard she snorted\n4. Finishing that stubborn work project before the weekend',
    tags: ['gratitude', 'lists'],
    createdAt: '2026-09-16T07:45:00Z',
  },
];

const defaultProfile: UserProfile = {
  email: 'c.jerome.emmanuel@gmail.com',
  name: 'Jerome',
  avatar: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" fill="%23008069"><circle cx="50" cy="50" r="50" fill="%23e6f4ea"/><circle cx="50" cy="40" r="20" fill="%23008069"/><path d="M20,85 C20,68 35,62 50,62 C65,62 80,68 80,85 Z" fill="%23008069"/></svg>',
  statusText: 'Writing life down before I forget ✨',
  aiPrivacyMode: 'built-in',
  disguiseModeEnabled: false,
  themePreference: 'light',
  appLockPin: '1234',
  appLockEnabled: true,
};

export function getFreshEmptyAppData(profile: UserProfile): AppData {
  return {
    contacts: [],
    messages: {},
    journals: [],
    personalSpace: [],
    profile,
  };
}

export const initialAppData: AppData = {
  contacts: sampleContacts,
  messages: {
    contact_claude: sampleMessages,
    contact_jeff: [],
    contact_maya: [],
  },
  journals: sampleJournals,
  personalSpace: samplePersonalSpace,
  profile: defaultProfile,
};
