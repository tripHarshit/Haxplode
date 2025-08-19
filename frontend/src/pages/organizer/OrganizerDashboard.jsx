import React, { useEffect, useState } from 'react';
import { 
  CalendarIcon, 
  UsersIcon, 
  BellIcon,
  ChartBarIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon
} from '@heroicons/react/24/outline';
import { Crown } from 'lucide-react';
import { mockSubmissions } from '../../utils/mockData';
import { mockParticipants, mockAnnouncements, mockEventStats } from '../../utils/organizerMockData';
import ParticipantsList from '../../components/organizer/ParticipantsList';
import ParticipantDetailsModal from '../../components/organizer/ParticipantDetailsModal';
import AnnouncementsList from '../../components/organizer/AnnouncementsList';
import EnhancedEventCard from '../../components/organizer/EnhancedEventCard';
import AnalyticsCharts from '../../components/organizer/AnalyticsCharts';
import SponsorShowcase from '../../components/organizer/SponsorShowcase';
import EventCreationWizard from '../../components/organizer/EventCreationWizard';
import { hackathonService } from '../../services/hackathonService';
import { useAuth } from '../../context/AuthContext';

const OrganizerDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [showEventModal, setShowEventModal] = useState(false);
  const [events, setEvents] = useState([]);
  const [isLoadingEvents, setIsLoadingEvents] = useState(true);
  const { user } = useAuth();
  const [participants, setParticipants] = useState(mockParticipants);
  const [announcements, setAnnouncements] = useState(mockAnnouncements);
  const [selectedParticipant, setSelectedParticipant] = useState(null);
  const [showParticipantModal, setShowParticipantModal] = useState(false);
  const [selectedEventId, setSelectedEventId] = useState(null);

  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };

  useEffect(() => {
    const loadEvents = async () => {
      try {
        console.log('OrganizerDashboard: Loading events for current user...');
        const rawEvents = await hackathonService.getMyEvents();
        console.log('OrganizerDashboard: Raw events from API:', rawEvents);
        const mapped = rawEvents.map(ev => ({
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
          isRegistered: false
        }));
        setEvents(mapped);
        console.log('OrganizerDashboard: Events mapped and set in state');
      } catch (error) {
        console.error('OrganizerDashboard: Failed to load events:', error);
      } finally {
        setIsLoadingEvents(false);
      }
    };
    loadEvents();
  }, []);

  const handleCreateEvent = () => {
    // Log navigation test
    if (window.navigationTester) {
      window.navigationTester.logButtonClick('Create New Event', 'organizer_dashboard');
      window.navigationTester.logModalInteraction('Event Creation Modal', 'open');
    }
    setShowEventModal(true);
  };

  const handleEventCreated = (newEvent) => {
    console.log('New event created:', newEvent);
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

  const handleDeleteEvent = (eventId) => {
    if (window.confirm('Are you sure you want to delete this event?')) {
      // Log navigation test
      if (window.navigationTester) {
        window.navigationTester.logButtonClick('Delete Event', 'organizer_dashboard');
      }
      setEvents(prev => prev.filter(event => event.id !== eventId));
    }
  };

  const handleViewParticipantDetails = (participant) => {
    setSelectedParticipant(participant);
    setShowParticipantModal(true);
  };

  const handleCreateAnnouncement = (announcementData) => {
    const newAnnouncement = {
      ...announcementData,
      id: Date.now()
    };
    setAnnouncements(prev => [...prev, newAnnouncement]);
  };

  const handleEditAnnouncement = (announcementId, updatedData) => {
    setAnnouncements(prev => prev.map(ann => 
      ann.id === announcementId ? { ...ann, ...updatedData } : ann
    ));
  };

  const handleDeleteAnnouncement = (announcementId) => {
    setAnnouncements(prev => prev.filter(ann => ann.id !== announcementId));
  };

  const handleViewParticipants = async (eventId) => {
    setActiveTab('participants');
    setSelectedEventId(eventId);
    try {
      const resp = await hackathonService.getHackathonParticipants(eventId);
      const raw = resp?.participants || [];
      const mapped = raw.map(u => ({
        id: u.id,
        name: u.fullName || u.name || 'Unknown',
        email: u.email,
        registrationDate: u.registrationDate || new Date().toISOString(),
        teamStatus: 'No Team',
        teamName: null,
        hackathonTitle: events.find(e => e.id === eventId)?.title || '',
        skills: [],
        submissions: 0,
      }));
      setParticipants(mapped);
    } catch (e) {
      console.error('Failed to load participants:', e);
      setParticipants([]);
    }
  };

  const handleSendMessage = (eventId) => {
    // TODO: Implement message functionality
    console.log('Send message for event:', eventId);
  };

  const handleViewSubmissions = (eventId) => {
    // TODO: Implement submissions view
    console.log('View submissions for event:', eventId);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'upcoming': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Organizer Dashboard</h1>
              <p className="text-gray-600">Manage your hackathons and events</p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex">
        {/* Sidebar Navigation */}
        <div className="w-64 bg-white shadow-sm min-h-screen">
          <nav className="mt-8">
            <div className="px-4 space-y-2">
              {[
                { id: 'overview', label: 'Overview', icon: ChartBarIcon },
                { id: 'events', label: 'Events', icon: CalendarIcon },
                { id: 'participants', label: 'Participants', icon: UsersIcon },
                { id: 'announcements', label: 'Announcements', icon: BellIcon },
                { id: 'sponsors', label: 'Sponsors', icon: Crown }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => handleTabChange(tab.id)}
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-colors ${
                    activeTab === tab.id
                      ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-700'
                      : 'text-gray-600 hover:bg-gray-50'
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
              <h2 className="text-2xl font-bold text-gray-900">Dashboard Overview</h2>
              
              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white rounded-lg shadow p-6">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <CalendarIcon className="h-8 w-8 text-blue-600" />
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">Total Events</dt>
                        <dd className="text-lg font-medium text-gray-900">{events.length}</dd>
                      </dl>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow p-6">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <UsersIcon className="h-8 w-8 text-green-600" />
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">Total Participants</dt>
                        <dd className="text-lg font-medium text-gray-900">
                          {events.reduce((sum, event) => sum + event.currentParticipants, 0)}
                        </dd>
                      </dl>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow p-6">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <ChartBarIcon className="h-8 w-8 text-purple-600" />
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">Active Submissions</dt>
                        <dd className="text-lg font-medium text-gray-900">
                          {mockSubmissions.filter(sub => sub.status === 'submitted').length}
                        </dd>
                      </dl>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow p-6">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <BellIcon className="h-8 w-8 text-orange-600" />
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">Pending Reviews</dt>
                        <dd className="text-lg font-medium text-gray-900">
                          {mockSubmissions.filter(sub => sub.status === 'submitted').length}
                        </dd>
                      </dl>
                    </div>
                  </div>
                </div>
              </div>

              {/* Analytics Charts */}
              <AnalyticsCharts eventStats={mockEventStats} />
            </div>
          )}

          {activeTab === 'events' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-900">Events Management</h2>
                <button
                  onClick={handleCreateEvent}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center space-x-2"
                >
                  <PlusIcon className="h-4 w-4" />
                  <span>Create New Event</span>
                </button>
              </div>
              
              {/* Events Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {isLoadingEvents && (
                  <div className="text-gray-500">Loading your events...</div>
                )}
                {!isLoadingEvents && events.length === 0 && (
                  <div className="text-gray-500">No events created yet. Click "Create New Event" to add one.</div>
                )}
                {!isLoadingEvents && events.map((event) => (
                  <EnhancedEventCard
                    key={event.id}
                    event={event}
                    onViewParticipants={handleViewParticipants}
                    onSendMessage={handleSendMessage}
                    onViewSubmissions={handleViewSubmissions}
                  />
                ))}
              </div>
            </div>
          )}

          {activeTab === 'participants' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-900">Participant Management</h2>
              <ParticipantsList 
                participants={participants}
                onViewDetails={handleViewParticipantDetails}
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
    </div>
  );
};

export default OrganizerDashboard;
