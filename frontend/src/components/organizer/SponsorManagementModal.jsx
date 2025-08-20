import React, { useEffect, useMemo, useState } from 'react';

const SponsorManagementModal = ({ isOpen, event, onClose, onSave }) => {
  const initialSponsors = useMemo(() => {
    if (!event) return [];
    if (Array.isArray(event.sponsors)) return event.sponsors;
    return [];
  }, [event]);

  const [sponsors, setSponsors] = useState(initialSponsors);
  const [newSponsor, setNewSponsor] = useState('');
  const [newWebsite, setNewWebsite] = useState('');
  const [saving, setSaving] = useState(false);

  // Reset local state whenever the targeted event changes or the modal re-opens
  useEffect(() => {
    setSponsors(initialSponsors);
    setNewSponsor('');
    setNewWebsite('');
  }, [initialSponsors, event?.id, isOpen]);

  if (!isOpen || !event) return null;

  const handleAdd = () => {
    const name = newSponsor.trim();
    const website = newWebsite.trim();
    if (!name) return;
    if (sponsors.some((s) => (typeof s === 'string' ? s.toLowerCase() : String(s?.name || '').toLowerCase()) === name.toLowerCase())) {
      setNewSponsor('');
      setNewWebsite('');
      return;
    }
    setSponsors((prev) => [...prev, { name, website }]);
    setNewSponsor('');
    setNewWebsite('');
  };

  const handleRemove = (idx) => {
    setSponsors((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      await onSave?.(event.id, sponsors);
      onClose?.();
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg w-full max-w-lg">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Manage Sponsors</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">✕</button>
        </div>

        <div className="px-6 py-5 space-y-4">
          <div>
            <div className="text-sm text-gray-600 dark:text-gray-300 mb-2">Add sponsors for <span className="font-medium">{event.title || event.name}</span>. These will be visible to participants on the hackathon page.</div>
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-2">
              <input
                type="text"
                value={newSponsor}
                onChange={(e) => setNewSponsor(e.target.value)}
                placeholder="Sponsor name (e.g., Acme Corp)"
                className="sm:col-span-5 min-w-0 rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2 text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <input
                type="url"
                value={newWebsite}
                onChange={(e) => setNewWebsite(e.target.value)}
                placeholder="Website URL (optional)"
                className="sm:col-span-5 min-w-0 rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2 text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <div className="sm:col-span-2">
                <button onClick={handleAdd} className="w-full px-3 py-2 rounded-md bg-blue-600 text-white text-sm hover:bg-blue-700">Add</button>
              </div>
            </div>
          </div>

          <div>
            <div className="text-sm font-medium text-gray-800 dark:text-gray-200 mb-2">Current Sponsors</div>
            {sponsors.length === 0 ? (
              <div className="text-sm text-gray-500">No sponsors yet.</div>
            ) : (
              <ul className="space-y-2 max-h-64 overflow-y-auto">
                {sponsors.map((s, idx) => {
                  const name = typeof s === 'string' ? s : (s?.name || String(s));
                  const website = typeof s === 'object' ? (s.website || '') : '';
                  return (
                    <li key={`${String(name)}-${idx}`} className="flex items-center justify-between bg-gray-50 dark:bg-gray-900 rounded-md px-3 py-2">
                      <div className="min-w-0">
                        <div className="text-sm text-gray-800 dark:text-gray-200 truncate">{name}</div>
                        {website && <div className="text-xs text-gray-500 truncate">{website}</div>}
                      </div>
                      <button onClick={() => handleRemove(idx)} className="text-red-600 hover:text-red-700 text-sm">Remove</button>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </div>

        <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 flex items-center justify-end space-x-3">
          <button onClick={onClose} className="px-4 py-2 rounded-md border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-50">Cancel</button>
          <button onClick={handleSave} disabled={saving} className={`px-4 py-2 rounded-md text-white ${saving ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'}`}>{saving ? 'Saving...' : 'Save'}</button>
        </div>
      </div>
    </div>
  );
};

export default SponsorManagementModal;


