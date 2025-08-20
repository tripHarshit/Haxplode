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

const EnhancedEventCard = ({ event, onViewParticipants, onSendMessage, onViewSubmissions, onEdit, onAddJudge, onDelete, isDeleting }) => {
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

  const currentParticipants = typeof event?._stats?.participants === 'number'
    ? event._stats.participants
    : (typeof event?.currentParticipants === 'number' ? event.currentParticipants : 0);
  const maxParticipants = typeof event?.maxParticipants === 'number' ? event.maxParticipants : 0;
  const percentFilled = maxParticipants > 0
    ? Math.round((currentParticipants / maxParticipants) * 100)
    : 0;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-shadow duration-200">
      {/* Header with Status Badge */}
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-start justify-between mb-3">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 line-clamp-2">{event.title || event.name}</h3>
          <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(event.status)}`}>
            {getStatusText(event.status)}
          </span>
        </div>
        
        <p className="text-gray-600 dark:text-gray-300 text-sm line-clamp-2 mb-4">{event.description}</p>
        
        {/* Event Details */}
        <div className="grid grid-cols-2 gap-4 text-sm text-gray-500 dark:text-gray-400">
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
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center space-x-2">
            <UsersIcon className="h-4 w-4 text-gray-500" />
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Participants</span>
          </div>
          <span className="text-sm text-gray-600 dark:text-gray-300">
            {currentParticipants}/{maxParticipants}
          </span>
        </div>
        
        {/* Progress Bar */}
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
          <div
            className={`h-2 rounded-full transition-all duration-300 ${getProgressColor(currentParticipants, maxParticipants)}`}
            style={{ width: `${getProgressWidth(currentParticipants, maxParticipants)}%` }}
          ></div>
        </div>
        
        {/* Progress Text */}
        <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
          <span>{percentFilled}% filled</span>
          {maxParticipants > 0 && currentParticipants >= maxParticipants && (
            <span className="text-red-600 font-medium">Event Full!</span>
          )}
        </div>
      </div>

      {/* Event Statistics */}
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Event Statistics</h4>
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">
              {Math.ceil(event.currentParticipants / 3)}
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400">Teams Formed</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">
              {Math.floor(event.currentParticipants * 0.3)}
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400">Submissions</div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="p-6">
        <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Quick Actions</h4>
        <div className="grid grid-cols-6 gap-2">
          <button
            onClick={() => onViewParticipants(event.id)}
            className="flex flex-col items-center p-3 text-gray-600 dark:text-gray-300 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors duration-200"
            title="View Participants"
          >
            <UsersIcon className="h-5 w-5 mb-1" />
            <span className="text-xs">Participants</span>
          </button>
          
          <button
            onClick={() => onSendMessage(event.id)}
            className="flex flex-col items-center p-3 text-gray-600 dark:text-gray-300 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors duration-200"
            title="Send Message"
          >
            <ChatBubbleLeftRightIcon className="h-5 w-5 mb-1" />
            <span className="text-xs">Message</span>
          </button>
          
          <button
            onClick={() => onViewSubmissions(event.id)}
            className="flex flex-col items-center p-3 text-gray-600 dark:text-gray-300 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors duration-200"
            title="View Submissions"
          >
            <DocumentTextIcon className="h-5 w-5 mb-1" />
            <span className="text-xs">Submissions</span>
          </button>

          <button
            onClick={() => onEdit?.(event)}
            className="flex flex-col items-center p-3 text-gray-600 dark:text-gray-300 hover:text-orange-600 dark:hover:text-orange-400 hover:bg-orange-50 dark:hover:bg-orange-900/20 rounded-lg transition-colors duration-200"
            title="Edit Event"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-5 w-5 mb-1">
              <path d="M5.433 13.917l1.363-.39a2 2 0 00.948-.546l6.364-6.364a1.5 1.5 0 10-2.121-2.121L5.623 10.86a2 2 0 00-.546.948l-.39 1.363a.75.75 0 00.954.954z" />
              <path d="M3.5 5.75A2.25 2.25 0 015.75 3.5h3a.75.75 0 010 1.5h-3a.75.75 0 00-.75.75v8.5c0 .414.336.75.75.75h8.5a.75.75 0 00.75-.75v-3a.75.75 0 011.5 0v3A2.25 2.25 0 0114.25 17h-8.5A2.25 2.25 0 013.5 14.75v-9z" />
            </svg>
            <span className="text-xs">Edit</span>
          </button>

          <button
            onClick={() => onAddJudge?.(event)}
            className="flex flex-col items-center p-3 text-gray-600 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-lg transition-colors duration-200"
            title="Add Judge"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5 mb-1">
              <path d="M12 12a5 5 0 100-10 5 5 0 000 10z" />
              <path d="M15 14H9a6 6 0 00-6 6 1 1 0 001 1h16a1 1 0 001-1 6 6 0 00-6-6z" />
              <path d="M19 8a1 1 0 10-2 0v1h-1a1 1 0 100 2h1v1a1 1 0 102 0v-1h1a1 1 0 100-2h-1V8z" />
            </svg>
            <span className="text-xs">Add Judge</span>
          </button>

          <button
            onClick={() => onDelete?.(event)}
            disabled={isDeleting}
            className={`flex flex-col items-center p-3 rounded-lg transition-colors duration-200 ${
              isDeleting 
                ? 'text-gray-400 dark:text-gray-500 cursor-not-allowed' 
                : 'text-gray-600 dark:text-gray-300 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20'
            }`}
            title={isDeleting ? 'Deleting...' : 'Delete Event'}
          >
            {isDeleting ? (
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-red-600 mb-1"></div>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-5 w-5 mb-1">
                <path fillRule="evenodd" d="M8.75 1A2.75 2.75 0 006 3.75v.443c-.795.077-1.584.149-2.365.2A.75.75 0 014.5 5.5v.75h-.75A2.75 2.75 0 001 9v6.75A2.75 2.75 0 003.75 18.5h12.5A2.75 2.75 0 0021 15.75V9A2.75 2.75 0 0018.25 6.25h-.75V5.5a.75.75 0 00-.885-.75A41.03 41.03 0 0014 4.193V3.75A2.75 2.75 0 0011.25 1h-2.5zM10 4c.84 0 1.673.025 2.5.075V3.75c0-.69-.56-1.25-1.25-1.25h-2.5c-.69 0-1.25.56-1.25 1.25v.325C8.327 4.025 9.16 4 10 4zM4.5 6.5V9A1.25 1.25 0 003.75 10.25h12.5A1.25 1.25 0 0017.25 9V6.5H4.5z" clipRule="evenodd" />
              </svg>
            )}
            <span className="text-xs">{isDeleting ? 'Deleting...' : 'Delete'}</span>
          </button>
        </div>
      </div>

      {/* Footer */}
      <div className="px-6 py-4 bg-gray-50 dark:bg-gray-900 rounded-b-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Prize Pool:</span>
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
