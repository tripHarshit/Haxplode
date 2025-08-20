import React, { useEffect, useMemo, useState } from 'react';
import { XMarkIcon, UsersIcon, CheckBadgeIcon, ClockIcon } from '@heroicons/react/24/outline';
import { teamService } from '../../services/teamService';
import { submissionService } from '../../services/submissionService';
import { judgeService } from '../../services/judgeService';

const OrganizerSubmissionsModal = ({ isOpen, eventId, onClose }) => {
  const [loading, setLoading] = useState(false);
  const [rows, setRows] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!isOpen || !eventId) return;

    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        // Fetch teams, submissions, judges, and results in parallel
        const [teams, submissions, judges, resultsData] = await Promise.all([
          teamService.getTeamsByEvent(eventId, { limit: 1000 }),
          submissionService.getSubmissions({ eventId }),
          judgeService.getJudgesForEvent(eventId),
          judgeService.getEventResults(eventId).catch(() => ({})),
        ]);

        const resultsList = resultsData?.submissions || resultsData?.data?.submissions || [];
        const resultBySubmissionId = new Map(resultsList.map(r => [String(r._id || r.id), r]));
        const judgeById = new Map((judges || []).map(j => [j.id, j]));
        const submissionByTeamId = new Map((submissions || []).map(s => [s.teamId, s]));

        const computedRows = (teams || []).map(team => {
          const submission = submissionByTeamId.get(team.id);
          const result = submission ? resultBySubmissionId.get(String(submission._id || submission.id)) : null;

          // Compute average from either results endpoint or embedded scores
          let averageScore = 0;
          let totalReviews = 0;
          let reviewers = [];
          if (result) {
            averageScore = typeof result.averageScore === 'number' ? result.averageScore : 0;
            totalReviews = result.totalReviews || (result.reviews ? result.reviews.length : 0);
            reviewers = (result.reviews || []).map(r => judgeById.get(r.judgeId)?.user?.fullName || `Judge #${r.judgeId}`);
          } else if (submission && Array.isArray(submission.scores) && submission.scores.length) {
            const sum = submission.scores.reduce((acc, s) => acc + (s.score || 0), 0);
            averageScore = Math.round((sum / submission.scores.length) * 100) / 100;
            totalReviews = submission.scores.length;
            reviewers = submission.scores.map(s => judgeById.get(s.judgeId)?.user?.fullName || `Judge #${s.judgeId}`);
          }

          const members = (team.members || []).map(m => m.user?.fullName || m.fullName || 'Member');
          const status = submission ? (totalReviews > 0 ? 'reviewed' : 'pending') : 'no-submission';

          return {
            teamId: team.id,
            teamName: team.teamName || team.name,
            members,
            averageScore,
            totalReviews,
            reviewers,
            status,
          };
        });

        // Sort by highest score first; teams without submissions go to bottom
        computedRows.sort((a, b) => {
          const aHas = Number.isFinite(a.averageScore) && a.averageScore > 0;
          const bHas = Number.isFinite(b.averageScore) && b.averageScore > 0;
          if (aHas && bHas) return b.averageScore - a.averageScore;
          if (aHas && !bHas) return -1;
          if (!aHas && bHas) return 1;
          return (a.teamName || '').localeCompare(b.teamName || '');
        });

        setRows(computedRows);
      } catch (e) {
        setError(e?.message || 'Failed to load submissions overview');
        setRows([]);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [isOpen, eventId]);

  const reviewedCount = useMemo(() => rows.filter(r => r.status === 'reviewed').length, [rows]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-white dark:bg-gray-900 rounded-xl shadow-xl w-full max-w-6xl mx-4 max-h-[85vh] overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b dark:border-gray-700">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Submissions Overview</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">All teams, their members, scores, and review status</p>
          </div>
          <button className="p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-800" onClick={onClose}>
            <XMarkIcon className="h-5 w-5 text-gray-600 dark:text-gray-300" />
          </button>
        </div>

        <div className="p-4">
          {error && (
            <div className="mb-3 text-sm text-red-600 dark:text-red-400">{error}</div>
          )}

          <div className="flex items-center gap-4 mb-3 text-sm text-gray-700 dark:text-gray-300">
            <span className="inline-flex items-center gap-1"><UsersIcon className="h-4 w-4" /> Teams: {rows.length}</span>
            <span className="inline-flex items-center gap-1"><CheckBadgeIcon className="h-4 w-4" /> Reviewed: {reviewedCount}</span>
            <span className="inline-flex items-center gap-1"><ClockIcon className="h-4 w-4" /> Pending: {rows.filter(r => r.status === 'pending').length}</span>
          </div>

          <div className="overflow-auto rounded-lg border border-gray-200 dark:border-gray-700">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-800">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Team</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Members</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Score</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Reviews</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Reviewed By</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                {loading ? (
                  <tr>
                    <td className="px-4 py-6 text-center text-gray-500 dark:text-gray-400" colSpan={6}>Loading...</td>
                  </tr>
                ) : rows.length === 0 ? (
                  <tr>
                    <td className="px-4 py-6 text-center text-gray-500 dark:text-gray-400" colSpan={6}>No teams found</td>
                  </tr>
                ) : (
                  rows.map((r) => (
                    <tr key={r.teamId} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                      <td className="px-4 py-3 whitespace-nowrap text-gray-900 dark:text-gray-100 font-medium">{r.teamName}</td>
                      <td className="px-4 py-3 text-gray-700 dark:text-gray-300">{r.members.join(', ')}</td>
                      <td className="px-4 py-3 text-gray-900 dark:text-gray-100 font-semibold">{Number.isFinite(r.averageScore) ? r.averageScore.toFixed(2) : '—'}</td>
                      <td className="px-4 py-3 text-gray-700 dark:text-gray-300">{r.totalReviews}</td>
                      <td className="px-4 py-3 text-gray-700 dark:text-gray-300">{r.reviewers.length ? r.reviewers.join(', ') : '—'}</td>
                      <td className="px-4 py-3">
                        {r.status === 'reviewed' && (
                          <span className="inline-flex items-center px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300">Reviewed</span>
                        )}
                        {r.status === 'pending' && (
                          <span className="inline-flex items-center px-2 py-1 text-xs font-medium rounded-full bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300">Pending</span>
                        )}
                        {r.status === 'no-submission' && (
                          <span className="inline-flex items-center px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300">No Submission</span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrganizerSubmissionsModal;


