import React, { useState } from 'react';
import { 
  MapPinIcon, 
  CalendarIcon, 
  UsersIcon, 
  TrophyIcon, 
  GlobeAltIcon, 
  ComputerDesktopIcon 
} from '@heroicons/react/24/outline';
import { format, formatDistanceToNow } from 'date-fns';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';

const EventCard = ({ event, viewMode, statusBadge, onClick, onEventUpdate, onRequestRegister, onRequestSubmit }) => {
  const { user } = useAuth();
  const { showSuccess, showError } = useNotifications();
  const [isRegistering, setIsRegistering] = useState(false);
  
  const parseValidDate = (value) => {
    if (!value) return null;
    const parsed = new Date(value);
    return isNaN(parsed.getTime()) ? null : parsed;
  };

  const isRegistrationOpen = () => {
    if (event.isRegistered) return false;
    const normalizedStatus = String(event.status || '').toLowerCase();
    if (['completed', 'cancelled', 'registration closed', 'closed', 'full'].includes(normalizedStatus)) return false;
    if (event.maxParticipants && event.currentParticipants >= event.maxParticipants) return false;
    const deadline = parseValidDate(event.registrationDeadline);
    // If there is no valid deadline, assume registration is open
    if (!deadline) return true;
    return deadline > new Date();
  };

  // Events view should not show avatars

  const handleRegister = async (e) => {
    e.stopPropagation();
    if (!user) {
      showError('Please log in to register for events');
      return;
    }
    if (onRequestRegister) {
      onRequestRegister(event);
      return;
    }
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
        className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6 hover:shadow-md transition-all duration-200 cursor-pointer transform hover:scale-[1.02]"
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
                <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">{event.title}</h3>
                <p className="text-slate-600 dark:text-slate-300 mb-3 line-clamp-2">{event.description}</p>
                
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
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300">
                  {event.category}
                </span>
              </div>
            </div>
            {/* Teammate avatars removed per requirement */}
            
            <div className="flex items-center justify-between pt-3 border-t border-gray-100 dark:border-slate-700">
              <span className="text-sm text-slate-500 dark:text-slate-400">
                {(() => {
                  const deadline = parseValidDate(event.registrationDeadline);
                  return deadline
                    ? `Registration closes ${formatDistanceToNow(deadline, { addSuffix: true })}`
                    : 'Registration deadline TBA';
                })()}
              </span>
              
              {event.isRegistered ? (
                <button 
                  className="bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  onClick={(e) => { e.stopPropagation(); if (window.navigationTester) { window.navigationTester.logButtonClick('Submit Project', 'events_grid'); } if (onRequestSubmit) onRequestSubmit(event); }}
                >
                  Submit Project
                </button>
              ) : (
                isRegistrationOpen() && (
                  <button 
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    onClick={handleRegister}
                    disabled={isRegistering}
                  >
                    {isRegistering ? 'Registering...' : 'Register Now'}
                  </button>
                )
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
      className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6 hover:shadow-md transition-all duration-200 cursor-pointer transform hover:scale-[1.02]"
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
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2 line-clamp-2">{event.title}</h3>
            <p className="text-sm text-slate-600 dark:text-slate-300 line-clamp-3">{event.description}</p>
          </div>
          <div className="flex flex-col items-end space-y-2 ml-4">
            {statusBadge}
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300">
              {event.category}
            </span>
          </div>
        </div>

        {/* Event Details */}
        <div className="space-y-3">
          <div className="flex items-center space-x-2 text-sm text-slate-600 dark:text-slate-300">
            {getLocationIcon()}
            <span className="truncate">{getLocationText()}</span>
          </div>
          
          <div className="flex items-center space-x-2 text-sm text-slate-600 dark:text-slate-300">
            <CalendarIcon className="h-4 w-4" />
            <span>{format(new Date(event.startDate), 'MMM dd, yyyy')}</span>
          </div>
          
          <div className="flex items-center space-x-2 text-sm text-slate-600 dark:text-slate-300">
            <UsersIcon className="h-4 w-4" />
            <span>{event.currentParticipants}/{event.maxParticipants} participants</span>
          </div>
          
          <div className="flex items-center space-x-2 text-sm text-slate-600 dark:text-slate-300">
            <TrophyIcon className="h-4 w-4" />
            <span className="font-medium text-green-600 dark:text-green-400">{event.prize}</span>
          </div>
          {/* Teammate avatars removed per requirement */}
        </div>

        {/* Footer */}
        <div className="pt-4 border-t border-gray-100 dark:border-slate-700">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500 dark:text-slate-400">
              {(() => {
                const deadline = parseValidDate(event.registrationDeadline);
                return deadline
                  ? `Closes ${formatDistanceToNow(deadline, { addSuffix: true })}`
                  : 'Registration deadline TBA';
              })()}
            </span>
            
            {event.isRegistered ? (
              <button 
                className="bg-orange-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-orange-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={(e) => { e.stopPropagation(); if (window.navigationTester) { window.navigationTester.logButtonClick('Submit Project', 'events_grid'); } if (onRequestSubmit) onRequestSubmit(event); }}
              >
                Submit Project
              </button>
            ) : (
              isRegistrationOpen() && (
                <button 
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  onClick={handleRegister}
                  disabled={isRegistering}
                >
                  {isRegistering ? 'Registering...' : 'Register'}
                </button>
              )
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventCard;
