import React, { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { hackathonService } from '../../services/hackathonService';
import EventDetailsModal from '../../components/participant/EventDetailsModal';

const mapHackathon = (ev) => {
  if (!ev) return null;
  return {
    id: ev.id,
    title: ev.name,
    description: ev.description,
    category: ev.theme,
    startDate: ev?.timeline?.startDate || ev.startDate || null,
    endDate: ev?.timeline?.endDate || ev.endDate || null,
    registrationDeadline: ev?.timeline?.registrationDeadline || null,
    maxParticipants: (ev.maxTeams || 0) * (ev.maxTeamSize || 0),
    currentParticipants: 0,
    prize: Array.isArray(ev.prizes) ? ev.prizes.join(', ') : (ev.prize || ''),
    location: ev.location,
    isOnline: !!ev.isVirtual,
    status: ev.status ? String(ev.status).toLowerCase() : 'draft',
    rules: typeof ev.rules === 'string' ? ev.rules.split('\n') : (ev.rules || []),
    timeline: ev.timeline || [],
    sponsors: Array.isArray(ev.sponsors) ? ev.sponsors : [],
    isRegistered: false,
  };
};

const HackathonDetails = () => {
  const { id } = useParams();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [open, setOpen] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError('');
      try {
        const response = await hackathonService.getHackathon(id);
        const raw = response?.event;
        setEvent(mapHackathon(raw));
      } catch (e) {
        setError(e.message || 'Failed to load hackathon');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-neutral-900">Hackathon Details</h1>
      <p className="text-neutral-600">View hackathon information and register</p>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-3">{error}</div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      ) : event ? (
        <EventDetailsModal event={event} isOpen={open} onClose={() => setOpen(false)} />
      ) : (
        <div className="card">Not found</div>
      )}
    </div>
  );
};

export default HackathonDetails;
