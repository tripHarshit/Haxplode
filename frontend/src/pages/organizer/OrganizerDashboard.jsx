import React, { useEffect, useMemo, useState } from 'react';
import { 
  CalendarIcon, 
  UsersIcon, 
  BellIcon,
  ChartBarIcon,
  PlusIcon,
  TrashIcon
} from '@heroicons/react/24/outline';
import { Crown } from 'lucide-react';
// Remove mock usage; load real data
import ParticipantsList from '../../components/organizer/ParticipantsList';
import { teamService } from '../../services/teamService';
import ParticipantDetailsModal from '../../components/organizer/ParticipantDetailsModal';
import AnnouncementsList from '../../components/organizer/AnnouncementsList';
import EnhancedEventCard from '../../components/organizer/EnhancedEventCard';
import AnalyticsCharts from '../../components/organizer/AnalyticsCharts';
import SponsorShowcase from '../../components/organizer/SponsorShowcase';
import EventCreationWizard from '../../components/organizer/EventCreationWizard';
import { hackathonService } from '../../services/hackathonService';
import { announcementService } from '../../services/announcementService';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';
import JudgeAssignmentModal from '../../components/organizer/JudgeAssignmentModal';
import QnA from '../../components/participant/QnA';

const OrganizerDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [showEventModal, setShowEventModal] = useState(false);
  const [events, setEvents] = useState([]);
  const [isLoadingEvents, setIsLoadingEvents] = useState(true);
  const { user, updateProfile } = useAuth();
  const { showSuccess, showError } = useNotifications();
  const [participants, setParticipants] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [selectedParticipant, setSelectedParticipant] = useState(null);
  const [showParticipantModal, setShowParticipantModal] = useState(false);
  const [selectedEventId, setSelectedEventId] = useState(null);
  const [eventStatsMap, setEventStatsMap] = useState({});
  const [isLoadingStats, setIsLoadingStats] = useState(false);
  const [profile, setProfile] = useState({
    name: user?.name || '',
    email: user?.email || '',
    bio: user?.bio || '',
    organization: user?.organization || '',
    linkedinProfile: user?.linkedinProfile || ''
  });
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [showJudgeModal, setShowJudgeModal] = useState(false);
  const [judgeModalEventId, setJudgeModalEventId] = useState(null);
  const [deletingEventId, setDeletingEventId] = useState(null);
  const [showQnaModal, setShowQnaModal] = useState(false);
  const [qnaEventId, setQnaEventId] = useState(null);

  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setIsLoadingEvents(true);
        const rawEvents = await hackathonService.getMyEvents();
        const mappedEvents = rawEvents.map(event => ({
          id: event.id,
          title: event.name,
          description: event.description,
          category: event.theme,
          startDate: event?.timeline?.startDate || event.startDate,
          endDate: event?.timeline?.endDate || event.endDate,
          registrationDeadline: event?.timeline?.registrationDeadline,
          maxParticipants: (event.maxTeams || 0) * (event.maxTeamSize || 0),
          currentParticipants: 0,
          prize: Array.isArray(event.prizes) ? event.prizes.join(', ') : (event.prize || ''),
          location: event.location,
          isOnline: !!event.isVirtual,
          status: event.status ? String(event.status).toLowerCase() : 'draft',
          rules: typeof event.rules === 'string' ? event.rules.split('\n') : (event.rules || []),
          timeline: event.timeline || [],
          isRegistered: false,
        }));
        setEvents(mappedEvents);
        // Select first event by default and load its announcements
        if (mappedEvents.length > 0) {
          const firstId = mappedEvents[0].id;
          setSelectedEventId(firstId);
          await loadAnnouncements(firstId);
          await loadStatsForEvents(mappedEvents);
        }
      } catch (error) {
        console.error('Failed to fetch events:', error);
      } finally {
        setIsLoadingEvents(false);
      }
    };

    fetchEvents();
  }, []);

  // Read ?tab= from URL to deep-link into specific dashboard tab
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const tab = params.get('tab');
    if (tab && ['overview','events','announcements','sponsors'].includes(tab)) {
      setActiveTab(tab);
    }
  }, []);

  // Sync local profile state with user changes
  useEffect(() => {
    setProfile({
      name: user?.name || '',
      email: user?.email || '',
      bio: user?.bio || '',
      organization: user?.organization || '',
      linkedinProfile: user?.linkedinProfile || ''
    });
  }, [user]);

  const buildRegistrationTrend = (participants) => {
    // Group by day from registrationDate, normalize to YYYY-MM-DD
    const counts = new Map();
    for (const p of participants || []) {
      const d = p.registrationDate ? new Date(p.registrationDate) : null;
      if (!d || Number.isNaN(d.getTime())) continue;
      const key = d.toISOString().slice(0, 10);
      counts.set(key, (counts.get(key) || 0) + 1);
    }
    // Sort by date asc
    const entries = Array.from(counts.entries()).sort((a, b) => a[0].localeCompare(b[0]));
    return entries.map(([date, count]) => ({ date, count }));
  };

  const loadStatsForEvents = async (evts = events) => {
    if (!Array.isArray(evts) || evts.length === 0) return;
    setIsLoadingStats(true);
    try {
      const results = await Promise.all(evts.map(async (ev) => {
        try {
          const [statsResp, participantsResp] = await Promise.all([
            hackathonService.getHackathonStats(ev.id),
            hackathonService.getHackathonParticipants(ev.id),
          ]);
          const stats = statsResp?.participants !== undefined ? statsResp : statsResp?.data || {};
          const participants = participantsResp?.participants || participantsResp?.data?.participants || [];
          const registrationTrend = buildRegistrationTrend(participants);
          return { ev, stats, registrationTrend };
        } catch (e) {
          console.error('Stats load failed for event', ev.id, e);
          return { ev, stats: { participants: 0, teams: 0, submissions: 0, averageScore: 0, totalReviews: 0 }, registrationTrend: [] };
        }
      }));

      // Update events with _stats
      setEvents(prev => prev.map(p => {
        const found = results.find(r => r.ev.id === p.id);
        if (!found) return p;
        const participantsCount = Number(found.stats?.participants) || 0;
        return { ...p, _stats: found.stats, currentParticipants: participantsCount };
      }));

      // Build map for AnalyticsCharts
      const map = {};
      for (const r of results) {
        const title = r.ev.title || `Event ${r.ev.id}`;
        map[title] = {
          totalParticipants: r.stats.participants || 0,
          maxParticipants: r.ev.maxParticipants || 0,
          teamsFormed: r.stats.teams || 0,
          submissionsReceived: r.stats.submissions || 0,
          registrationTrend: r.registrationTrend,
        };
      }
      setEventStatsMap(map);
    } finally {
      setIsLoadingStats(false);
    }
  };

  const loadAnnouncements = async (eventId) => {
    try {
      const resp = await announcementService.getEventAnnouncements(eventId, { limit: 50 });
      const list = resp?.data?.announcements || [];
      const mapped = list.map(a => ({
        id: a._id,
        title: a.title,
        content: a.message,
        targetAudience: Array.isArray(a.targetAudience) ? a.targetAudience[0] || 'All' : (a.targetAudience || 'All'),
        isUrgent: String(a.type).toLowerCase() === 'urgent' || String(a.priority).toLowerCase() === 'critical',
        isImportant: String(a.priority).toLowerCase() === 'high' || String(a.priority).toLowerCase() === 'critical',
        date: a.createdAt,
        createdBy: 'You',
      }));
      setAnnouncements(mapped);
    } catch (e) {
      console.error('Failed to load announcements:', e);
      setAnnouncements([]);
    }
  };

  const handleCreateEvent = () => {
    // Log navigation test
    if (window.navigationTester) {
      window.navigationTester.logButtonClick('Create New Event', 'organizer_dashboard');
      window.navigationTester.logModalInteraction('Event Creation Modal', 'open');
    }
    setShowEventModal(true);
  };

  const handleEventCreated = (newEvent) => {
    // Map backend event shape to UI card shape expected by EnhancedEventCard
    const mapped = {
      id: newEvent.id,
      title: newEvent.name,
      description: newEvent.description,
      category: newEvent.theme,
      startDate: newEvent?.timeline?.startDate || newEvent.startDate || null,
      endDate: newEvent?.timeline?.endDate || newEvent.endDate || null,
      registrationDeadline: newEvent?.timeline?.registrationDeadline || null,
      maxParticipants: (newEvent.maxTeams || 0) * (newEvent.maxTeamSize || 0),
      currentParticipants: 0,
      prize: Array.isArray(newEvent.prizes) ? newEvent.prizes.join(', ') : (newEvent.prize || ''),
      location: newEvent.location,
      isOnline: !!newEvent.isVirtual,
      status: newEvent.status ? String(newEvent.status).toLowerCase() : 'draft',
      rules: typeof newEvent.rules === 'string' ? newEvent.rules.split('\n') : (newEvent.rules || []),
      timeline: newEvent.timeline || [],
      isRegistered: false
    };
    setEvents(prev => [...prev, mapped]);
    setShowEventModal(false);
  };

  const handleDeleteEvent = async (event) => {
    console.log('Delete event called with:', event);
    
    if (window.confirm(`Are you sure you want to delete "${event.title || event.name}"? This action cannot be undone.\n\n⚠️  WARNING: All participants, teams, submissions, and related data will be automatically removed.`)) {
      try {
        setDeletingEventId(event.id);
        
        console.log('Attempting to delete event with ID:', event.id);
        
        // Log navigation test
        if (window.navigationTester) {
          window.navigationTester.logButtonClick('Delete Event', 'organizer_dashboard');
        }
        
        // Call backend to delete the event
        const result = await hackathonService.deleteHackathon(event.id);
        console.log('Delete result:', result);
        
        // Remove from local state
        setEvents(prev => prev.filter(e => e.id !== event.id));
        
        // Show success message
        showSuccess('Event deleted successfully. All participants, teams, and related data have been automatically removed.');
      } catch (error) {
        console.error('Failed to delete event:', error);
        console.error('Error details:', {
          message: error.message,
          response: error.response?.data,
          status: error.response?.status
        });
        
        // Show error message
        showError(error.message || 'Failed to delete event');
      } finally {
        setDeletingEventId(null);
      }
    }
  };

  const handleViewParticipantDetails = (participant) => {
    setSelectedParticipant(participant);
    setShowParticipantModal(true);
  };

  const handleCreateAnnouncement = async (announcementData) => {
    if (!selectedEventId) return;
    try {
      const payload = {
        eventId: selectedEventId,
        title: announcementData.title,
        message: announcementData.content,
        type: announcementData.isUrgent ? 'Urgent' : 'General',
        priority: announcementData.isUrgent ? 'Critical' : (announcementData.isImportant ? 'High' : 'Medium'),
        isPinned: !!announcementData.isImportant,
        isPublic: true,
        targetAudience: [announcementData.targetAudience || 'All'],
      };
      await announcementService.createAnnouncement(payload);
      await loadAnnouncements(selectedEventId);
    } catch (e) {
      console.error('Create announcement failed:', e);
    }
  };

  const handleEditAnnouncement = async (announcementId, updatedData) => {
    try {
      await announcementService.updateAnnouncement(announcementId, {
        title: updatedData.title,
        message: updatedData.content,
        isPinned: !!updatedData.isImportant,
      });
      if (selectedEventId) await loadAnnouncements(selectedEventId);
    } catch (e) {
      console.error('Update announcement failed:', e);
    }
  };

  const handleDeleteAnnouncement = async (announcementId) => {
    try {
      await announcementService.deleteAnnouncement(announcementId);
      if (selectedEventId) await loadAnnouncements(selectedEventId);
    } catch (e) {
      console.error('Delete announcement failed:', e);
    }
  };

  const handleViewParticipants = async (eventId) => {
    setActiveTab('participants');
    setSelectedEventId(eventId);
    try {
      const [participantsResp, teamsResp] = await Promise.all([
        hackathonService.getHackathonParticipants(eventId),
        teamService.getTeamsByEvent(eventId, { limit: 1000 }),
      ]);
      const raw = participantsResp?.participants || [];
      const teams = teamsResp?.data?.teams || teamsResp?.teams || [];
      const teamByUserId = new Map();
      teams.forEach((t) => {
        (t.members || []).forEach((m) => {
          if (m?.userId) teamByUserId.set(m.userId, t);
          if (m?.user?.id) teamByUserId.set(m.user.id, t);
        });
      });
      const mapped = raw.map((u) => {
        const team = teamByUserId.get(u.id);
        return {
          id: u.id,
          name: u.fullName || u.name || 'Unknown',
          email: u.email,
          registrationDate: u.registrationDate || new Date().toISOString(),
          teamStatus: team ? 'In Team' : 'No Team',
          teamName: team?.teamName || team?.name || null,
          teamMembers: (team?.members || []).map(m => ({ id: m.user?.id || m.userId, fullName: m.user?.fullName || m.fullName || 'Member' })),
          hackathonTitle: events.find(e => e.id === eventId)?.title || '',
          skills: [],
          submissions: 0,
        };
      });
      setParticipants(mapped);
    } catch (e) {
      console.error('Failed to load participants:', e);
      setParticipants([]);
    }
  };

  const handleSendMessage = (eventId) => {
    setQnaEventId(eventId);
    setShowQnaModal(true);
  };

  const handleViewSubmissions = (eventId) => {
    // TODO: Implement submissions view
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
      case 'upcoming': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300';
      case 'completed': return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
    }
  };

  const handleProfileSave = async () => {
    setIsSavingProfile(true);
    try {
      await updateProfile({
        name: profile.name,
        bio: profile.bio,
        organization: profile.organization,
        linkedinProfile: profile.linkedinProfile,
      });
      window.alert('Profile updated');
    } catch (e) {
      console.error('Failed to save profile', e);
      window.alert('Failed to save profile');
    } finally {
      setIsSavingProfile(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 shadow-sm border-b dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Organizer Dashboard</h1>
              <p className="text-gray-600 dark:text-gray-400">Manage your hackathons and events</p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex">
        {/* Sidebar Navigation */}
        <div className="w-64 bg-white dark:bg-gray-800 shadow-sm min-h-screen">
          <nav className="mt-8">
            <div className="px-4 space-y-2">
              {[
                { id: 'overview', label: 'Overview', icon: ChartBarIcon },
                { id: 'events', label: 'Events', icon: CalendarIcon },
                { id: 'announcements', label: 'Announcements', icon: BellIcon },
                { id: 'sponsors', label: 'Sponsors', icon: Crown }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => handleTabChange(tab.id)}
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-colors ${
                    activeTab === tab.id
                      ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-700 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-400'
                      : 'text-gray-600 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-700'
                  }`}
                >
                  <tab.icon className="h-5 w-5" />
                  <span className="font-medium">{tab.label}</span>
                </button>
              ))}
            </div>
          </nav>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-8">
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Dashboard Overview</h2>
              
              {/* Stats Cards (aggregated live) */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <CalendarIcon className="h-8 w-8 text-blue-600" />
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">Total Events</dt>
                        <dd className="text-lg font-medium text-gray-900 dark:text-gray-100">{events.length}</dd>
                      </dl>
                    </div>
                  </div>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <UsersIcon className="h-8 w-8 text-green-600" />
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">Total Participants</dt>
                        <dd className="text-lg font-medium text-gray-900 dark:text-gray-100">
                          {events.reduce((sum, event) => sum + event.currentParticipants, 0)}
                        </dd>
                      </dl>
                    </div>
                  </div>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <ChartBarIcon className="h-8 w-8 text-purple-600" />
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">Active Submissions</dt>
                        <dd className="text-lg font-medium text-gray-900 dark:text-gray-100">
                          {events.reduce((sum, ev) => sum + (ev._stats?.submissions || 0), 0)}
                        </dd>
                      </dl>
                    </div>
                  </div>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <BellIcon className="h-8 w-8 text-orange-600" />
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">Pending Reviews</dt>
                        <dd className="text-lg font-medium text-gray-900 dark:text-gray-100">
                          {events.reduce((sum, ev) => sum + (ev._stats?.totalReviews || 0), 0)}
                        </dd>
                      </dl>
                    </div>
                  </div>
                </div>
              </div>

              {/* Per-event Live Stats Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                {events.map((ev) => (
                  <div key={ev.id} className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{ev.title}</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">{ev.category} • {ev.isOnline ? 'Online' : (ev.location || 'Onsite')}</p>
                      </div>
                      <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(ev.status)}`}>{ev.status}</span>
                    </div>
                    <div className="grid grid-cols-2 gap-4 mt-4">
                      <div>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Participants</p>
                        <p className="text-xl font-semibold text-gray-900 dark:text-gray-100">{ev._stats?.participants ?? '—'}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Teams</p>
                        <p className="text-xl font-semibold text-gray-900 dark:text-gray-100">{ev._stats?.teams ?? '—'}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Submissions</p>
                        <p className="text-xl font-semibold text-gray-900 dark:text-gray-100">{ev._stats?.submissions ?? '—'}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Avg. Score</p>
                        <p className="text-xl font-semibold text-gray-900 dark:text-gray-100">{ev._stats?.averageScore ?? '—'}</p>
                      </div>
                    </div>
                    <div className="mt-4 flex items-center justify-between text-sm">
                      <button
                        onClick={() => loadStatsForEvents([ev])}
                        className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                      >Refresh stats</button>
                      <span className="text-gray-500 dark:text-gray-400">Max: {ev.maxParticipants || 0}</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Analytics Charts with real data */}
              <div className="mt-8">
                {isLoadingStats ? (
                  <div className="text-gray-500 dark:text-gray-400">Loading charts...</div>
                ) : (
                  <AnalyticsCharts eventStats={eventStatsMap} />
                )}
              </div>
            </div>
          )}

          {activeTab === 'events' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Events Management</h2>
                <button
                  onClick={handleCreateEvent}
                  className="inline-flex items-center space-x-2 rounded-md bg-blue-600 hover:bg-blue-700 text-white px-4 py-2"
                >
                  <PlusIcon className="h-5 w-5" />
                  <span>Create Hackathon</span>
                </button>
              </div>
              
              
              {/* Events Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {isLoadingEvents && (
                  <div className="text-gray-500">Loading your events...</div>
                )}
                {!isLoadingEvents && events.length === 0 && (
                  <div className="text-gray-500">No events created yet.</div>
                )}
                {!isLoadingEvents && events.map((event) => (
                  <EnhancedEventCard
                    key={event.id}
                    event={event}
                    onViewParticipants={handleViewParticipants}
                    onSendMessage={handleSendMessage}
                    onViewSubmissions={handleViewSubmissions}
                    onEdit={(ev) => {
                      setShowEventModal(true);
                      // Pre-fill wizard by setting defaults via window event (simple approach), or adjust wizard to accept initial values
                      // For simplicity, emit a custom event the wizard can read
                      try {
                        const prefill = {
                          name: ev.title,
                          theme: ev.category,
                          description: ev.description,
                          location: ev.location,
                          isVirtual: ev.isOnline,
                          startDate: ev?.timeline?.startDate || ev.startDate,
                          endDate: ev?.timeline?.endDate || ev.endDate,
                          registrationDeadline: ev?.timeline?.registrationDeadline,
                          maxTeams: Math.max(1, Math.ceil((ev.maxParticipants || 0) / (ev.maxTeamSize || 4))),
                          maxTeamSize: ev.maxTeamSize || 4,
                          rules: Array.isArray(ev.rules) ? ev.rules : (typeof ev.rules === 'string' ? ev.rules.split('\n') : []),
                          prizes: Array.isArray(ev.prizes) ? ev.prizes.map(p => ({ category: p, amount: '', description: '' })) : [],
                          rounds: ev.rounds || [],
                          _id: ev.id,
                        };
                        window.dispatchEvent(new CustomEvent('prefillEventWizard', { detail: prefill }));
                      } catch {}
                    }}
                    onAddJudge={(ev) => {
                      setJudgeModalEventId(ev.id);
                      setShowJudgeModal(true);
                    }}
                    onDelete={handleDeleteEvent}
                    isDeleting={deletingEventId === event.id}
                  />
                ))}
              </div>
            </div>
          )}

          {activeTab === 'participants' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Participant Management</h2>
              <ParticipantsList 
                participants={participants}
                onViewDetails={handleViewParticipantDetails}
                asCards
              />
            </div>
          )}

          {activeTab === 'announcements' && (
            <div className="space-y-6">
              <AnnouncementsList
                announcements={announcements}
                onCreateNew={handleCreateAnnouncement}
                onEdit={handleEditAnnouncement}
                onDelete={handleDeleteAnnouncement}
              />
            </div>
          )}

          {activeTab === 'sponsors' && (
            <div className="space-y-6">
              <SponsorShowcase />
            </div>
          )}
          {/* No right-side content for Profile tab as requested */}
        </div>
      </div>



      {/* Event Creation Wizard */}
      <EventCreationWizard
        isOpen={showEventModal}
        onClose={() => setShowEventModal(false)}
        onEventCreated={handleEventCreated}
      />

      {/* Participant Details Modal */}
      <ParticipantDetailsModal
        participant={selectedParticipant}
        isOpen={showParticipantModal}
        onClose={() => {
          setShowParticipantModal(false);
          setSelectedParticipant(null);
        }}
      />

      <JudgeAssignmentModal
        isOpen={showJudgeModal}
        eventId={judgeModalEventId}
        onClose={() => {
          setShowJudgeModal(false);
          setJudgeModalEventId(null);
        }}
      />

      {/* QnA Modal for organizers */}
      {showQnaModal && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Event Q&A</h3>
              <button className="text-gray-500 hover:text-gray-700" onClick={() => setShowQnaModal(false)}>✕</button>
            </div>
            {qnaEventId ? (
              <QnA eventId={qnaEventId} />
            ) : (
              <div className="text-sm text-gray-500">Select an event</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default OrganizerDashboard;
