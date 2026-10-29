import type { Language } from '@/i18n';
import { neon } from '@/lib/neon';

export type Profile = {
  id: string;
  username: string;
  preferred_language: Language;
  role: 'member' | 'moderator' | 'admin';
};

export async function fetchProfile(userId: string): Promise<Profile | null> {
  const { data, error } = await neon
    .from('profiles')
    .select('id, username, preferred_language, role')
    .eq('id', userId)
    .maybeSingle();
  if (error) throw error;
  return data as Profile | null;
}

// The id defaults to the signed-in user, which row-level security enforces.
export async function createProfile(username: string, language: Language): Promise<Profile> {
  const { data, error } = await neon
    .from('profiles')
    .insert({ username, preferred_language: language })
    .select('id, username, preferred_language, role')
    .single();
  if (error) throw error;
  return data as Profile;
}

export async function updateLanguage(userId: string, language: Language): Promise<void> {
  const { error } = await neon.from('profiles').update({ preferred_language: language }).eq('id', userId);
  if (error) throw error;
}
