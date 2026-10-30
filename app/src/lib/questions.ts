import { neon } from '@/lib/neon';

export type Answer = { id: string; body: string; created_at: string; author: { username: string } | null };
export type Question = Answer & { answers: Answer[] };

export async function fetchQuestions(placeId: string): Promise<Question[]> {
  const { data, error } = await neon
    .from('questions')
    .select('id, body, created_at, author:profiles(username), answers(id, body, created_at, author:profiles(username))')
    .eq('place_id', placeId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return ((data ?? []) as unknown as Question[]).map((question) => ({
    ...question,
    answers: [...question.answers].sort((a, b) => a.created_at.localeCompare(b.created_at)),
  }));
}

export async function askQuestion(placeId: string, body: string): Promise<void> {
  const { error } = await neon.from('questions').insert({ place_id: placeId, body: body.trim() });
  if (error) throw error;
}

export async function answerQuestion(questionId: string, body: string): Promise<void> {
  const { error } = await neon.from('answers').insert({ question_id: questionId, body: body.trim() });
  if (error) throw error;
}
