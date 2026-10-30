import { neon } from '@/lib/neon';

export type ContributorStats = { reviews: number; photos: number; places: number; answers: number };

export async function fetchStats(userId: string): Promise<ContributorStats> {
  const { data, error } = await neon
    .from('contributor_stats')
    .select('reviews, photos, places, answers')
    .eq('user_id', userId)
    .maybeSingle();
  if (error) throw error;
  return (data as ContributorStats | null) ?? { reviews: 0, photos: 0, places: 0, answers: 0 };
}

// Points weigh what costs the most effort: a published place counts most.
export function points({ reviews, photos, places, answers }: ContributorStats): number {
  return reviews * 2 + photos + places * 5 + answers;
}

export const LEVELS = [
  { id: 'explorer', min: 0 },
  { id: 'traveller', min: 5 },
  { id: 'guide', min: 20 },
  { id: 'ambassador', min: 60 },
] as const;

export function levelFor(score: number) {
  const index = LEVELS.reduce((found, level, i) => (score >= level.min ? i : found), 0);
  return { current: LEVELS[index], next: LEVELS[index + 1] ?? null };
}

export type Badge = { id: string; earned: boolean };

export function badges(stats: ContributorStats, visited: number): Badge[] {
  return [
    { id: 'firstReview', earned: stats.reviews >= 1 },
    { id: 'photographer', earned: stats.photos >= 5 },
    { id: 'scout', earned: stats.places >= 1 },
    { id: 'helper', earned: stats.answers >= 5 },
    { id: 'traveller10', earned: visited >= 10 },
    { id: 'allIsland', earned: visited >= 30 },
  ];
}
