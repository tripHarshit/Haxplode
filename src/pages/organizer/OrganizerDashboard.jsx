import React, { useState } from 'react';
import { 
  CalendarIcon, 
  UsersIcon, 
  BellIcon,
  ChartBarIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon
} from '@heroicons/react/24/outline';
import { mockEvents, mockSubmissions } from '../../utils/mockData';
import { mockParticipants, mockAnnouncements, mockEventStats } from '../../utils/organizerMockData';
import ParticipantsList from '../../components/organizer/ParticipantsList';
import ParticipantDetailsModal from '../../components/organizer/ParticipantDetailsModal';
import AnnouncementsList from '../../components/organizer/AnnouncementsList';
import EnhancedEventCard from '../../components/organizer/EnhancedEventCard';
import AnalyticsCharts from '../../components/organizer/AnalyticsCharts';

const OrganizerDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [showEventModal, setShowEventModal] = useState(false);
  const [events, setEvents] = useState(mockEvents);
  const [participants, setParticipants] = useState(mockParticipants);
  const [announcements, setAnnouncements] = useState(mockAnnouncements);
  const [selectedParticipant, setSelectedParticipant] = useState(null);
  const [showParticipantModal, setShowParticipantModal] = useState(false);

  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };

  const handleCreateEvent = () => {
    // Log navigation test
    if (window.navigationTester) {
      window.navigationTester.logButtonClick('Create New Event', 'organizer_dashboard');
      window.navigationTester.logModalInteraction('Event Creation Modal', 'open');
    }
    setShowEventModal(true);
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

  const handleViewParticipants = (eventId) => {
    setActiveTab('participants');
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
                { id: 'announcements', label: 'Announcements', icon: BellIcon }
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
                {events.map((event) => (
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
        </div>
      </div>

      {/* Event Creation Modal */}
      {showEventModal && (
        <EventCreationModal 
          onClose={() => setShowEventModal(false)}
          onSubmit={(eventData) => {
            const newEvent = {
              ...eventData,
              id: Date.now(),
              status: 'upcoming',
              currentParticipants: 0,
              category: 'Other'
            };
            setEvents(prev => [...prev, newEvent]);
            setShowEventModal(false);
          }}
        />
      )}

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

// Simple Event Creation Modal Component
const EventCreationModal = ({ onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    startDate: '',
    endDate: '',
    maxParticipants: ''
  });
  const [errors, setErrors] = useState({});

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.title.trim()) newErrors.title = 'Event title is required';
    if (!formData.description.trim()) newErrors.description = 'Description is required';
    if (!formData.startDate) newErrors.startDate = 'Start date is required';
    if (!formData.endDate) newErrors.endDate = 'End date is required';
    if (!formData.maxParticipants) newErrors.maxParticipants = 'Max participants is required';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      onSubmit(formData);
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-gray-900">Create New Event</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-2xl"
          >
            ×
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Event Title *
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => handleInputChange('title', e.target.value)}
              className={`w-full px-3 py-2 border rounded-md ${
                errors.title ? 'border-red-500' : 'border-gray-300'
              } focus:outline-none focus:ring-2 focus:ring-blue-500`}
              placeholder="Enter event title"
            />
            {errors.title && <p className="mt-1 text-sm text-red-600">{errors.title}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description *
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              rows={3}
              className={`w-full px-3 py-2 border rounded-md ${
                errors.description ? 'border-red-500' : 'border-gray-300'
              } focus:outline-none focus:ring-2 focus:ring-blue-500`}
              placeholder="Describe your event..."
            />
            {errors.description && <p className="mt-1 text-sm text-red-600">{errors.description}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Start Date *
              </label>
              <input
                type="date"
                value={formData.startDate}
                onChange={(e) => handleInputChange('startDate', e.target.value)}
                className={`w-full px-3 py-2 border rounded-md ${
                  errors.startDate ? 'border-red-500' : 'border-gray-300'
                } focus:outline-none focus:ring-2 focus:ring-blue-500`}
              />
              {errors.startDate && <p className="mt-1 text-sm text-red-600">{errors.startDate}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                End Date *
              </label>
              <input
                type="date"
                value={formData.endDate}
                onChange={(e) => handleInputChange('endDate', e.target.value)}
                className={`w-full px-3 py-2 border rounded-md ${
                  errors.endDate ? 'border-red-500' : 'border-gray-300'
                } focus:outline-none focus:ring-2 focus:ring-blue-500`}
              />
              {errors.endDate && <p className="mt-1 text-sm text-red-600">{errors.endDate}</p>}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Max Participants *
            </label>
            <input
              type="number"
              value={formData.maxParticipants}
              onChange={(e) => handleInputChange('maxParticipants', e.target.value)}
              className={`w-full px-3 py-2 border rounded-md ${
                errors.maxParticipants ? 'border-red-500' : 'border-gray-300'
              } focus:outline-none focus:ring-2 focus:ring-blue-500`}
              placeholder="100"
              min="1"
            />
            {errors.maxParticipants && <p className="mt-1 text-sm text-red-600">{errors.maxParticipants}</p>}
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700"
            >
              Create Event
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default OrganizerDashboard;
