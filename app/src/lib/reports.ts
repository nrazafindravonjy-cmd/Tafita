import { callApi } from '@/lib/api';
import { neon } from '@/lib/neon';

export type ReportTarget = 'review' | 'photo';
export type ReportReason = 'inappropriate' | 'false' | 'spam' | 'rights';
export const REPORT_REASONS: ReportReason[] = ['inappropriate', 'false', 'spam', 'rights'];

export type OpenReport = {
  id: string;
  target_type: ReportTarget;
  target_id: string;
  reason: ReportReason;
  created_at: string;
  // Missing when the content was already deleted.
  review?: { body: string | null; rating: number; author: string | null };
  photo?: { storage_key: string };
};

export async function reportContent(target: ReportTarget, targetId: string, reason: ReportReason): Promise<void> {
  const { error } = await neon.from('reports').insert({ target_type: target, target_id: targetId, reason });
  // A repeated report of the same content counts as already done.
  if (error && error.code !== '23505') throw error;
}

export async function fetchOpenReports(): Promise<OpenReport[]> {
  const { data, error } = await neon
    .from('reports')
    .select('id, target_type, target_id, reason, created_at')
    .eq('status', 'open')
    .order('created_at');
  if (error) throw error;
  const reports = (data ?? []) as OpenReport[];

  const reviewIds = reports.filter((r) => r.target_type === 'review').map((r) => r.target_id);
  const photoIds = reports.filter((r) => r.target_type === 'photo').map((r) => r.target_id);
  const [reviews, photos] = await Promise.all([
    reviewIds.length
      ? neon.from('reviews').select('id, body, rating, author:profiles(username)').in('id', reviewIds)
      : Promise.resolve({ data: [] }),
    photoIds.length
      ? neon.from('place_photos').select('id, storage_key').in('id', photoIds)
      : Promise.resolve({ data: [] }),
  ]);
  const reviewById = new Map(
    ((reviews.data ?? []) as unknown as { id: string; body: string | null; rating: number; author: { username: string } | null }[]).map(
      (r) => [r.id, { body: r.body, rating: r.rating, author: r.author?.username ?? null }],
    ),
  );
  const photoById = new Map(((photos.data ?? []) as { id: string; storage_key: string }[]).map((p) => [p.id, p]));
  return reports.map((report) => ({
    ...report,
    review: reviewById.get(report.target_id),
    photo: photoById.get(report.target_id),
  }));
}

export async function resolveReport(reportId: string): Promise<void> {
  const { error } = await neon.from('reports').update({ status: 'resolved' }).eq('id', reportId);
  if (error) throw error;
}

// Removes the reported content and closes every open report about it.
export async function removeReportedContent(report: OpenReport): Promise<void> {
  if (report.target_type === 'review') {
    const { error } = await neon.from('reviews').delete().eq('id', report.target_id);
    if (error) throw error;
  } else {
    if (report.photo) await callApi('/api/delete-photos', { keys: [report.photo.storage_key] });
    const { error } = await neon.from('place_photos').delete().eq('id', report.target_id);
    if (error) throw error;
  }
  const { error } = await neon
    .from('reports')
    .update({ status: 'resolved' })
    .eq('target_type', report.target_type)
    .eq('target_id', report.target_id);
  if (error) throw error;
}
