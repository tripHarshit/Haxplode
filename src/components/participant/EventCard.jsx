import React from 'react';
import { 
  MapPinIcon, 
  CalendarIcon, 
  UsersIcon, 
  TrophyIcon, 
  GlobeAltIcon, 
  ComputerDesktopIcon 
} from '@heroicons/react/24/outline';
import { format, formatDistanceToNow } from 'date-fns';

const EventCard = ({ event, viewMode, statusBadge, onClick }) => {
  const isRegistrationOpen = () => {
    if (event.isRegistered || event.status === 'full') return false;
    return new Date(event.registrationDeadline) > new Date();
  };

  const getLocationIcon = () => {
    return event.isOnline ? (
      <GlobeAltIcon className="h-4 w-4 text-blue-500" />
    ) : (
      <ComputerDesktopIcon className="h-4 w-4 text-green-500" />
    );
  };

  const getLocationText = () => {
    return event.isOnline ? 'Online Event' : event.location;
  };

  if (viewMode === 'list') {
    return (
      <div 
        className="bg-white rounded-xl shadow-sm border p-6 hover:shadow-md transition-all duration-200 cursor-pointer transform hover:scale-[1.02]"
        onClick={() => {
          // Log navigation test
          if (window.navigationTester) {
            window.navigationTester.logButtonClick('Event Card', 'events_grid');
            window.navigationTester.logModalInteraction('Event Details Modal', 'open');
          }
          onClick();
        }}
      >
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{event.title}</h3>
                <p className="text-gray-600 mb-3 line-clamp-2">{event.description}</p>
                
                <div className="flex items-center space-x-6 text-sm text-gray-500">
                  <div className="flex items-center space-x-2">
                    {getLocationIcon()}
                    <span>{getLocationText()}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CalendarIcon className="h-4 w-4" />
                    <span>{format(new Date(event.startDate), 'MMM dd, yyyy')}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <UsersIcon className="h-4 w-4" />
                    <span>{event.currentParticipants}/{event.maxParticipants} participants</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <TrophyIcon className="h-4 w-4" />
                    <span>{event.prize}</span>
                  </div>
                </div>
              </div>
              
              <div className="flex flex-col items-end space-y-3 ml-6">
                {statusBadge}
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  {event.category}
                </span>
              </div>
            </div>
            
            <div className="flex items-center justify-between pt-3 border-t border-gray-100">
              <span className="text-sm text-gray-500">
                Registration closes {formatDistanceToNow(new Date(event.registrationDeadline), { addSuffix: true })}
              </span>
              
              {isRegistrationOpen() && (
                <button 
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                  onClick={(e) => {
                    e.stopPropagation();
                    // Log navigation test
                    if (window.navigationTester) {
                      window.navigationTester.logButtonClick('Register Now', 'event_card');
                    }
                  }}
                >
                  Register Now
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Grid view
  return (
    <div 
      className="bg-white rounded-xl shadow-sm border p-6 hover:shadow-md transition-all duration-200 cursor-pointer transform hover:scale-[1.02]"
      onClick={() => {
        // Log navigation test
        if (window.navigationTester) {
          window.navigationTester.logButtonClick('Event Card', 'events_grid');
          window.navigationTester.logModalInteraction('Event Details Modal', 'open');
        }
        onClick();
      }}
    >
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">{event.title}</h3>
            <p className="text-sm text-gray-600 line-clamp-3">{event.description}</p>
          </div>
          <div className="flex flex-col items-end space-y-2 ml-4">
            {statusBadge}
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
              {event.category}
            </span>
          </div>
        </div>

        {/* Event Details */}
        <div className="space-y-3">
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            {getLocationIcon()}
            <span className="truncate">{getLocationText()}</span>
          </div>
          
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <CalendarIcon className="h-4 w-4" />
            <span>{format(new Date(event.startDate), 'MMM dd, yyyy')}</span>
          </div>
          
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <UsersIcon className="h-4 w-4" />
            <span>{event.currentParticipants}/{event.maxParticipants} participants</span>
          </div>
          
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <TrophyIcon className="h-4 w-4" />
            <span className="font-medium text-green-600">{event.prize}</span>
          </div>
        </div>

        {/* Footer */}
        <div className="pt-4 border-t border-gray-100">
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-500">
              Closes {formatDistanceToNow(new Date(event.registrationDeadline), { addSuffix: true })}
            </span>
            
            {isRegistrationOpen() && (
              <button 
                className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700 transition-colors"
                onClick={(e) => {
                  e.stopPropagation();
                  // Log navigation test
                  if (window.navigationTester) {
                    window.navigationTester.logButtonClick('Register', 'event_card');
                  }
                }}
              >
                Register
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventCard;
