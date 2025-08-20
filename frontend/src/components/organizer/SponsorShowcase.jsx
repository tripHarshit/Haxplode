import React, { useEffect, useMemo, useState } from 'react';
import { Building2, Trash2 } from 'lucide-react';
import { useToast } from '../ui/Toast';
import { hackathonService } from '../../services/hackathonService';
import { sponsorService } from '../../services/sponsorService';

const SponsorShowcase = () => {
  const [sponsors, setSponsors] = useState([]);
  const [events, setEvents] = useState([]);

  const loadSponsors = async () => {
    try {
      const list = await sponsorService.list();
      setSponsors(list);
    } catch (e) {
      error('Failed to load sponsors');
    }
  };

  const loadEvents = async () => {
    try {
      const list = await hackathonService.getMyEvents({ limit: 200 });
      setEvents(Array.isArray(list) ? list : []);
    } catch (e) {
      setEvents([]);
    }
  };

  useEffect(() => { loadSponsors(); loadEvents(); }, []);

  const { success, error } = useToast();

  const SponsorLogo = ({ src, alt, size = 'w-12 h-12' }) => {
    const [errored, setErrored] = useState(false);
    if (!src || errored) {
      return (
        <div className={`${size} rounded-lg bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800 flex items-center justify-center border border-gray-200 dark:border-gray-700`}> 
          <Building2 className="h-6 w-6 text-gray-400" />
        </div>
      );
    }
    return (
      <img
        src={src}
        alt={alt}
        className={`${size} rounded-lg object-cover border border-gray-200 dark:border-gray-700`}
        onError={() => setErrored(true)}
      />
    );
  };

  const handleDeleteSponsor = async (id) => {
    try {
      await sponsorService.remove(id);
      await loadSponsors();
      success('Sponsor Removed', 'Sponsor has been removed successfully!');
    } catch {
      error('Failed to remove sponsor');
    }
  };

  const eventNamesBySponsor = useMemo(() => {
    if (!events?.length) return new Map();
    const map = new Map();
    for (const ev of events) {
      const sponsorList = Array.isArray(ev.sponsors) ? ev.sponsors : [];
      sponsorList.forEach((raw) => {
        const key = String(typeof raw === 'string' ? raw : raw?.name || raw).trim().toLowerCase();
        if (!key) return;
        const list = map.get(key) || [];
        list.push(ev.name || ev.title || `Event ${ev.id}`);
        map.set(key, list);
      });
    }
    return map;
  }, [events]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Sponsors</h2>
          <p className="text-gray-600 dark:text-gray-400">All sponsors and their related hackathons</p>
        </div>
      </div>

      <div className="overflow-x-auto bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-900/50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Logo</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Website</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Related Hackathons</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            {sponsors.map((s) => {
              const key = String(s?.name || '').trim().toLowerCase();
              const related = eventNamesBySponsor.get(key) || [];
              return (
                <tr key={s.id} className="hover:bg-gray-50 dark:hover:bg-gray-900/30">
                  <td className="px-4 py-3">
                    <SponsorLogo src={s.logo} alt={s.name} />
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-gray-900 dark:text-gray-100">{s.name}</span>
                  </div>
                  </td>
                  <td className="px-4 py-3">
                    {s.website ? (
                      <a href={s.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 dark:text-blue-400">
                        Visit
                      </a>
                    ) : (
                      <span className="text-gray-400">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">
                    {related.length ? related.join(', ') : '—'}
                  </td>
                  <td className="px-4 py-3 text-right">
                <button
                      onClick={() => handleDeleteSponsor(s.id)}
                  className="p-1.5 rounded-md text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20"
                  title="Delete sponsor"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
export default SponsorShowcase;
