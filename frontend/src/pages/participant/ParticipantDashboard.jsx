import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';
import { 
  CalendarIcon, 
  UserGroupIcon, 
  TrophyIcon, 
  ClockIcon,
  PlusIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  BellIcon,
  ChartBarIcon,
  CogIcon
} from '@heroicons/react/24/outline';
import { 
  mockDashboardStats, 
  mockActivities, 
  mockDeadlines,
  mockEvents,
  mockTeams,
  mockSubmissions,
  dataService
} from '../../utils/mockData';
import StatsCard from '../../components/participant/StatsCard';
import ActivityTimeline from '../../components/participant/ActivityTimeline';
import DeadlinesList from '../../components/participant/DeadlinesList';
import QuickActions from '../../components/participant/QuickActions';
import EventsGrid from '../../components/participant/EventsGrid';
import TeamsList from '../../components/participant/TeamsList';
import SubmissionsList from '../../components/participant/SubmissionsList';
import Certificates from '../../components/participant/Certificates';
import { participantService } from '../../services/participantService';

const ParticipantDashboard = () => {
  const { user } = useAuth();
  const { showError } = useNotifications();
  const [activeTab, setActiveTab] = useState('overview');
  const [isLoading, setIsLoading] = useState(false);
  const [dashboardData, setDashboardData] = useState({
    stats: mockDashboardStats,
    activities: mockActivities,
    deadlines: mockDeadlines,
    events: mockEvents,
    teams: mockTeams,
    submissions: mockSubmissions
  });
  const [submissionDefaults, setSubmissionDefaults] = useState(null);

  const tabs = [
    { id: 'overview', name: 'Overview', icon: ChartBarIcon },
    { id: 'events', name: 'Events', icon: CalendarIcon },
    { id: 'teams', name: 'Teams', icon: UserGroupIcon },
    { id: 'submissions', name: 'Submissions', icon: TrophyIcon },
    { id: 'certificates', name: 'Certificates', icon: TrophyIcon },
  ];

  useEffect(() => {
    const fetchDashboardData = async () => {
      setIsLoading(true);
      try {
        const { events: registeredEvents } = await participantService.getRegisteredEvents();
        const { teams: myTeams } = await participantService.getParticipantTeams();
        const mappedEvents = await mapRegisteredHackathonsWithTeams(registeredEvents, myTeams);
        setDashboardData({
          stats: { registeredEvents: registeredEvents.length, activeTeams: myTeams.length, completedSubmissions: 0, upcomingDeadlines: 0 },
          activities: [],
          deadlines: [],
          events: mappedEvents,
          teams: myTeams,
          submissions: []
        });
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const mapRegisteredHackathonsWithTeams = async (rawEvents = [], teams = []) => {
    const eventsById = new Map(rawEvents.map(ev => [ev.id, ev]));
    const teamsByEventId = teams.reduce((acc, team) => {
      const eventId = team?.event?.id || team.eventId;
      if (!eventId) return acc;
      if (!acc[eventId]) acc[eventId] = [];
      acc[eventId].push(team);
      return acc;
    }, {});

    const mapped = Array.from(eventsById.values()).map(ev => ({
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
      isRegistered: true,
      teams: teamsByEventId[ev.id] || [],
    }));

    return mapped;
  };

  const handleRequestSubmit = (event) => {
    // Set default event and a default team if only one available
    const eventId = event?.id;
    const teamId = Array.isArray(event?.teams) && event.teams.length === 1 ? (event.teams[0]?.id) : '';
    setSubmissionDefaults({ eventId, teamId });
    setActiveTab('submissions');
  };

  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
  };

  const handleQuickAction = async (action) => {
    switch (action) {
      case 'browse-events':
        setActiveTab('events');
        break;
      case 'create-team':
        setActiveTab('teams');
        // Could open team creation modal here
        break;
      case 'join-team':
        setActiveTab('teams');
        // Could open team join modal here
        break;
      case 'submit-project':
        setActiveTab('submissions');
        // Could open submission form here
        break;
      case 'view-schedule':
        setActiveTab('overview');
        break;
      case 'manage-submissions':
        setActiveTab('submissions');
        break;
      default:
        showError('Action not implemented yet');
    }
  };

  const refreshDashboardData = async () => {
    try {
      const { events: registeredEvents } = await participantService.getRegisteredEvents();
      const { teams: myTeams } = await participantService.getParticipantTeams();
      const mappedEvents = await mapRegisteredHackathonsWithTeams(registeredEvents, myTeams);
      setDashboardData(prev => ({
        ...prev,
        events: mappedEvents,
      }));
    } catch (e) {
      console.error('Failed to refresh dashboard data:', e);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Participant Dashboard</h1>
            <p className="text-lg text-gray-600 mt-2">Welcome back, {user?.name || 'Participant'}!</p>
          </div>
          <div className="flex items-center space-x-4">
            <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
              <BellIcon className="h-6 w-6" />
            </button>
            <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
              <CogIcon className="h-6 w-6" />
            </button>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="px-6">
          <nav className="flex space-x-8">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => handleTabChange(tab.id)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center space-x-2">
                    <Icon className="h-5 w-6" />
                    <span>{tab.name}</span>
                  </div>
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <div className="space-y-6">
        {activeTab === 'overview' && (
          <div className="space-y-8">
            {/* Welcome Section */}
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 text-white">
              <div className="max-w-3xl">
                <h2 className="text-3xl font-bold mb-4">
                  Ready to build something amazing? 🚀
                </h2>
                <p className="text-xl text-blue-100 mb-6">
                  You're registered for {dashboardData.stats.registeredEvents} events and have {dashboardData.stats.activeTeams} active teams. 
                  Keep up the great work!
                </p>
                <div className="flex flex-wrap gap-4">
                  <button className="bg-white text-blue-600 px-6 py-3 rounded-lg font-semibold hover:bg-blue-50 transition-colors">
                    Browse Events
                  </button>
                  <button className="border-2 border-white text-white px-6 py-3 rounded-lg font-semibold hover:bg-white hover:text-blue-600 transition-colors">
                    Create Team
                  </button>
                </div>
              </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <StatsCard
                title="Registered Events"
                value={dashboardData.stats.registeredEvents}
                icon={CalendarIcon}
                color="blue"
                change="+2 this month"
              />
              <StatsCard
                title="Active Teams"
                value={dashboardData.stats.activeTeams}
                icon={UserGroupIcon}
                color="green"
                change="+1 this month"
              />
              <StatsCard
                title="Submissions"
                value={dashboardData.stats.completedSubmissions}
                icon={TrophyIcon}
                color="purple"
                change="+1 this month"
              />
              <StatsCard
                title="Upcoming Deadlines"
                value={dashboardData.stats.upcomingDeadlines}
                icon={ClockIcon}
                color="orange"
                change="3 due this week"
              />
            </div>

            {/* Quick Actions */}
            <QuickActions onActionClick={handleQuickAction} />

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Recent Activities */}
              <div className="lg:col-span-2">
                <div className="bg-white rounded-xl shadow-sm border p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-semibold text-gray-900">Recent Activities</h3>
                    <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                      View All
                    </button>
                  </div>
                  <ActivityTimeline activities={dashboardData.activities.slice(0, 5)} />
                </div>
              </div>

              {/* Upcoming Deadlines */}
              <div className="lg:col-span-1">
                <div className="bg-white rounded-xl shadow-sm border p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-semibold text-gray-900">Upcoming Deadlines</h3>
                    <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                      View All
                    </button>
                  </div>
                  <DeadlinesList deadlines={dashboardData.deadlines.slice(0, 3)} />
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'events' && (
          <EventsGrid 
            events={dashboardData.events} 
            onRefresh={refreshDashboardData} 
            onRequestSubmit={handleRequestSubmit}
          />
        )}

        {activeTab === 'teams' && (
          <TeamsList teams={dashboardData.teams} />
        )}

        {activeTab === 'submissions' && (
          <SubmissionsList 
            submissions={dashboardData.submissions} 
            defaultEventId={submissionDefaults?.eventId}
            defaultTeamId={submissionDefaults?.teamId}
          />
        )}

        {activeTab === 'certificates' && (
          <Certificates />
        )}
      </div>
    </div>
  );
};

export default ParticipantDashboard;
