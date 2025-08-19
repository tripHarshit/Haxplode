import React, { useEffect, useState } from 'react';
import { judgeService } from '../../services/judgeService';

const JudgeAssignmentModal = ({ isOpen, onClose, eventId }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [judges, setJudges] = useState([]);
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('Secondary');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (!isOpen || !eventId) return;
    const run = async () => {
      setIsLoading(true);
      setError('');
      setSuccess('');
      try {
        const list = await judgeService.getJudgesForEvent(eventId);
        setJudges(list);
      } catch (e) {
        console.error('Failed to load judges for event', eventId, e);
        setError('Failed to load judges');
      } finally {
        setIsLoading(false);
      }
    };
    run();
  }, [isOpen, eventId]);

  const handleAssign = async (e) => {
    e?.preventDefault?.();
    if (!email) return setError('Email is required');
    setIsLoading(true);
    setError('');
    setSuccess('');
    try {
      await judgeService.assignJudgeByEmail({ eventId, email, role });
      setSuccess('Judge assigned successfully');
      setEmail('');
      const list = await judgeService.getJudgesForEvent(eventId);
      setJudges(list);
    } catch (err) {
      console.error('Assign judge failed', err);
      const msg = err?.response?.data?.message || err?.message || 'Failed to assign judge';
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="w-full max-w-lg rounded-lg bg-white p-6 shadow-lg dark:bg-gray-800">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Assign Judges</h3>
          <button
            onClick={onClose}
            className="rounded-md px-3 py-1 text-sm text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
          >Close</button>
        </div>

        <div className="mb-4">
          <p className="text-sm text-gray-600 dark:text-gray-300">
            Current judges assigned: <span className="font-semibold">{judges?.length || 0}</span>
          </p>
          <ul className="mt-2 max-h-40 space-y-1 overflow-auto pr-1">
            {(judges || []).map((j) => (
              <li key={`${j.id}-${j.user?.id || j.judge?.user?.id || j.assignedAt}`} className="flex items-center justify-between rounded-md bg-gray-50 px-3 py-2 text-sm dark:bg-gray-700">
                <span className="text-gray-800 dark:text-gray-100">{j.user?.fullName || j.user?.email || j.judge?.user?.fullName || 'Judge'}</span>
                <span className="text-xs text-gray-500 dark:text-gray-300">{j.user?.email || j.judge?.user?.email || ''}</span>
              </li>
            ))}
            {(!judges || judges.length === 0) && (
              <li className="text-sm text-gray-500 dark:text-gray-400">No judges assigned yet.</li>
            )}
          </ul>
        </div>

        <form onSubmit={handleAssign} className="space-y-3">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">Judge Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="judge@example.com"
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500 dark:border-gray-600 dark:bg-gray-900 dark:text-gray-100"
              required
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">Role</label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500 dark:border-gray-600 dark:bg-gray-900 dark:text-gray-100"
            >
              <option value="Primary">Primary</option>
              <option value="Secondary">Secondary</option>
              <option value="Mentor">Mentor</option>
            </select>
          </div>
          {error && <div className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-900/30 dark:text-red-300">{error}</div>}
          {success && <div className="rounded-md bg-green-50 px-3 py-2 text-sm text-green-700 dark:bg-green-900/30 dark:text-green-300">{success}</div>}
          <div className="flex items-center justify-end space-x-2 pt-2">
            <button type="button" onClick={onClose} className="rounded-md px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700">Cancel</button>
            <button
              type="submit"
              disabled={isLoading}
              className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
            >{isLoading ? 'Assigning...' : 'Assign Judge'}</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default JudgeAssignmentModal;


