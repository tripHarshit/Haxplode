import React from 'react';
import { 
  CalendarIcon, 
  MapPinIcon, 
  UsersIcon,
  EyeIcon,
  ChatBubbleLeftRightIcon,
  DocumentTextIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import { format } from 'date-fns';

const EnhancedEventCard = ({ event, onViewParticipants, onSendMessage, onViewSubmissions }) => {
  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'upcoming': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-gray-100 text-gray-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      case 'draft': return 'bg-yellow-100 text-yellow-800';
      case 'full': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'active': return 'Active';
      case 'upcoming': return 'Upcoming';
      case 'completed': return 'Completed';
      case 'cancelled': return 'Cancelled';
      case 'draft': return 'Draft';
      case 'full': return 'Full';
      default: return status;
    }
  };

  const getProgressColor = (current, max) => {
    if (!max || max <= 0) return 'bg-green-500';
    const percentage = (current / max) * 100;
    if (percentage >= 90) return 'bg-red-500';
    if (percentage >= 75) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const getProgressWidth = (current, max) => {
    if (!max || max <= 0) return 0;
    return Math.min((current / max) * 100, 100);
  };

  return (
    <div className="bg-white rounded-lg shadow-md border border-gray-200 hover:shadow-lg transition-shadow duration-200">
      {/* Header with Status Badge */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-start justify-between mb-3">
          <h3 className="text-xl font-semibold text-gray-900 line-clamp-2">{event.title || event.name}</h3>
          <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(event.status)}`}>
            {getStatusText(event.status)}
          </span>
        </div>
        
        <p className="text-gray-600 text-sm line-clamp-2 mb-4">{event.description}</p>
        
        {/* Event Details */}
        <div className="grid grid-cols-2 gap-4 text-sm text-gray-500">
          <div className="flex items-center space-x-2">
            <CalendarIcon className="h-4 w-4" />
            <span>
              {(() => {
                const start = event.startDate || event?.timeline?.startDate;
                const end = event.endDate || event?.timeline?.endDate;
                try {
                  return `${format(new Date(start), 'MMM dd')} - ${format(new Date(end), 'MMM dd, yyyy')}`;
                } catch {
                  return 'Dates TBA';
                }
              })()}
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <MapPinIcon className="h-4 w-4" />
            <span>{event.isOnline ? 'Online' : event.location}</span>
          </div>
        </div>
      </div>

      {/* Participant Progress */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center space-x-2">
            <UsersIcon className="h-4 w-4 text-gray-500" />
            <span className="text-sm font-medium text-gray-700">Participants</span>
          </div>
          <span className="text-sm text-gray-600">
            {event.currentParticipants}/{event.maxParticipants}
          </span>
        </div>
        
        {/* Progress Bar */}
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className={`h-2 rounded-full transition-all duration-300 ${getProgressColor(event.currentParticipants, event.maxParticipants)}`}
            style={{ width: `${getProgressWidth(event.currentParticipants, event.maxParticipants)}%` }}
          ></div>
        </div>
        
        {/* Progress Text */}
        <div className="flex justify-between text-xs text-gray-500 mt-1">
          <span>{Math.round((event.currentParticipants / event.maxParticipants) * 100)}% filled</span>
          {event.currentParticipants >= event.maxParticipants && (
            <span className="text-red-600 font-medium">Event Full!</span>
          )}
        </div>
      </div>

      {/* Event Statistics */}
      <div className="p-6 border-b border-gray-200">
        <h4 className="text-sm font-medium text-gray-700 mb-3">Event Statistics</h4>
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">
              {Math.ceil(event.currentParticipants / 3)}
            </div>
            <div className="text-xs text-gray-500">Teams Formed</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">
              {Math.floor(event.currentParticipants * 0.3)}
            </div>
            <div className="text-xs text-gray-500">Submissions</div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="p-6">
        <h4 className="text-sm font-medium text-gray-700 mb-3">Quick Actions</h4>
        <div className="grid grid-cols-3 gap-2">
          <button
            onClick={() => onViewParticipants(event.id)}
            className="flex flex-col items-center p-3 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors duration-200"
            title="View Participants"
          >
            <UsersIcon className="h-5 w-5 mb-1" />
            <span className="text-xs">Participants</span>
          </button>
          
          <button
            onClick={() => onSendMessage(event.id)}
            className="flex flex-col items-center p-3 text-gray-600 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors duration-200"
            title="Send Message"
          >
            <ChatBubbleLeftRightIcon className="h-5 w-5 mb-1" />
            <span className="text-xs">Message</span>
          </button>
          
          <button
            onClick={() => onViewSubmissions(event.id)}
            className="flex flex-col items-center p-3 text-gray-600 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors duration-200"
            title="View Submissions"
          >
            <DocumentTextIcon className="h-5 w-5 mb-1" />
            <span className="text-xs">Submissions</span>
          </button>
        </div>
      </div>

      {/* Footer */}
      <div className="px-6 py-4 bg-gray-50 rounded-b-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="text-sm font-medium text-gray-700">Prize Pool:</span>
            <span className="text-sm text-green-600 font-semibold">{Array.isArray(event.prizes) ? event.prizes.join(', ') : (event.prize || '')}</span>
          </div>
          
          {event.currentParticipants >= event.maxParticipants * 0.9 && (
            <div className="flex items-center space-x-1 text-orange-600">
              <ExclamationTriangleIcon className="h-4 w-4" />
              <span className="text-xs font-medium">Filling Fast</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EnhancedEventCard;
