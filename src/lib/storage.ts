import { AppData } from '../types';
import { initialAppData } from '../mockData';

const LOCAL_STORAGE_KEY = 'before_i_forget_app_data';
const AUTH_TOKEN_KEY = 'before_i_forget_auth_token';
const AUTH_EMAIL_KEY = 'before_i_forget_auth_email';

export function getStoredAuthToken(): string | null {
  try {
    return localStorage.getItem(AUTH_TOKEN_KEY);
  } catch {
    return null;
  }
}

export function setStoredAuth(token: string | null, email: string | null) {
  try {
    if (token) {
      localStorage.setItem(AUTH_TOKEN_KEY, token);
      if (email) localStorage.setItem(AUTH_EMAIL_KEY, email);
    } else {
      localStorage.removeItem(AUTH_TOKEN_KEY);
      localStorage.removeItem(AUTH_EMAIL_KEY);
    }
  } catch (e) {
    console.error('Storage auth error:', e);
  }
}

export function getStoredAuthEmail(): string | null {
  try {
    return localStorage.getItem(AUTH_EMAIL_KEY);
  } catch {
    return null;
  }
}

export function loadLocalAppData(): AppData {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      // Merge with default keys to ensure safe structure
      return {
        contacts: parsed.contacts || initialAppData.contacts,
        messages: parsed.messages || initialAppData.messages,
        journals: parsed.journals || initialAppData.journals,
        personalSpace: parsed.personalSpace || initialAppData.personalSpace,
        profile: { ...initialAppData.profile, ...(parsed.profile || {}) },
      };
    }
  } catch (e) {
    console.error('Error loading local data, falling back:', e);
  }
  return initialAppData;
}

export function saveLocalAppData(data: AppData) {
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(data));
  } catch (e) {
    console.error('Error saving local data:', e);
  }
}

// Background sync to server if token exists
export async function syncToServer(data: AppData): Promise<boolean> {
  const token = getStoredAuthToken();
  if (!token) return false;

  try {
    const res = await fetch('/api/user/sync', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ data }),
    });
    return res.ok;
  } catch (err) {
    console.error('Sync to server error:', err);
    return false;
  }
}

// Fetch from server on login
export async function syncFromServer(): Promise<AppData | null> {
  const token = getStoredAuthToken();
  if (!token) return null;

  try {
    const res = await fetch('/api/user/sync', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    if (res.ok) {
      const json = await res.json();
      if (json.data) {
        saveLocalAppData(json.data);
        return json.data;
      }
    }
  } catch (err) {
    console.error('Sync from server error:', err);
  }
  return null;
}
