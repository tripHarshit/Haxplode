import React, { useEffect, useState, useCallback } from 'react';
import EventsGrid from '../../components/participant/EventsGrid';
import { hackathonService } from '../../services/hackathonService';

const mapHackathons = (rawEvents = []) => {
  return rawEvents.map(ev => ({
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
  }));
};

const HackathonList = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const response = await hackathonService.getHackathons();
      const rawEvents = response?.events || [];
      setEvents(mapHackathons(rawEvents));
    } catch (e) {
      setError(e.message || 'Failed to load hackathons');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-neutral-900">Available Hackathons</h1>
      <p className="text-neutral-600">Browse and join exciting hackathons</p>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-3">{error}</div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      ) : (
        <EventsGrid events={events} onRefresh={load} />
      )}
    </div>
  );
};

export default HackathonList;
