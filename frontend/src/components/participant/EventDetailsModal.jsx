import React, { useState } from 'react';
import { 
  XMarkIcon, 
  MapPinIcon, 
  CalendarIcon, 
  UsersIcon, 
  TrophyIcon, 
  GlobeAltIcon, 
  ComputerDesktopIcon,
  CheckCircleIcon,
  ClockIcon
} from '@heroicons/react/24/outline';
import { format } from 'date-fns';
import { hackathonService } from '../../services/hackathonService';
import QnA from './QnA';

const EventDetailsModal = ({ event, isOpen, onClose, onRequestRegister }) => {
  const [isRegistering, setIsRegistering] = useState(false);
  const [registrationSuccess, setRegistrationSuccess] = useState(false);

  if (!isOpen || !event) return null;

  const parseSafeDate = (value) => {
    if (!value) return null;
    const d = new Date(value);
    return isNaN(d.getTime()) ? null : d;
  };

  const title = event.title || event.name || 'Hackathon';
  const description = event.description || '';
  const derivedStart = parseSafeDate(event.startDate || event.timeline?.startDate || null);
  const derivedEnd = parseSafeDate(event.endDate || event.timeline?.endDate || null);
  const derivedRegDeadline = parseSafeDate(event.registrationDeadline || event.timeline?.registrationDeadline || null);
  const registrationOn = parseSafeDate(event.registrationDate);
  const rulesArray = Array.isArray(event.rules)
    ? event.rules
    : (typeof event.rules === 'string' ? event.rules.split('\n') : []);

  const handleRegistration = async () => {
    setIsRegistering(true);
    try {
      if (window.navigationTester) {
        window.navigationTester.logButtonClick('Register Now', 'event_details_modal');
        window.navigationTester.logFormSubmission('Event Registration Form', true);
      }
      if (onRequestRegister) onRequestRegister();
    } catch (error) {
      console.error('Registration failed:', error);
      if (window.navigationTester) {
        window.navigationTester.logError(error, 'Event Registration');
      }
    } finally {
      setIsRegistering(false);
    }
  };

  const getLocationIcon = () => {
    return event.isOnline ? (
      <GlobeAltIcon className="h-5 w-5 text-blue-500" />
    ) : (
      <ComputerDesktopIcon className="h-5 w-5 text-green-500" />
    );
  };

  const getLocationText = () => {
    return event.isOnline ? 'Online Event' : event.location;
  };

  const isRegistrationOpen = () => {
    if (event.isRegistered) return false;
    const normalized = String(event.status || '').toLowerCase();
    if (['completed', 'cancelled', 'registration closed', 'closed', 'full'].includes(normalized)) return false;
    const deadline = new Date(event.registrationDeadline);
    return !isNaN(deadline.getTime()) ? deadline > new Date() : true;
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        {/* Background overlay */}
        <div 
          className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
          onClick={() => {
            // Log navigation test
            if (window.navigationTester) {
              window.navigationTester.logModalInteraction('Event Details Modal', 'close_backdrop');
            }
            onClose();
          }}
        ></div>

        {/* Modal panel */}
        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full">
          {/* Header */}
          <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
              <button
                onClick={() => {
                  // Log navigation test
                  if (window.navigationTester) {
                    window.navigationTester.logButtonClick('Close Modal', 'event_details_modal');
                    window.navigationTester.logModalInteraction('Event Details Modal', 'close');
                  }
                  onClose();
                }}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="px-6 py-6 max-h-96 overflow-y-auto">
            <div className="space-y-6">
              {/* Registration Details */}
              {Array.isArray(event.teams) && event.teams.length > 0 && (
                <div className="bg-white border border-gray-200 rounded-lg p-4">
                  <h4 className="text-lg font-medium text-gray-900 mb-3">Registration Details</h4>
                  {(() => {
                    const team = event.teams[0];
                    const members = team?.members || [];
                    const leader = members.find(m => m.role === 'Leader') || members[0];
                    return (
                      <div className="space-y-3">
                        <div className="text-gray-800 font-medium">Team: {team.teamName || team.name}</div>
                        <div className="text-sm text-gray-700">Leader: {leader?.user?.fullName || leader?.user?.email || '—'}</div>
                        <div className="text-sm text-gray-700">Members:</div>
                        <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {members.map((m, idx) => (
                            <li key={m.id || idx} className="flex items-center space-x-2">
                              <img
                                className="inline-block h-8 w-8 rounded-full ring-2 ring-white"
                                src={m.user?.profilePicture || `https://ui-avatars.com/api/?name=${encodeURIComponent(m.user?.fullName || m.user?.email || 'U')}`}
                                alt={m.user?.fullName || 'Member'}
                              />
                              <span className="text-gray-800">{m.user?.fullName || m.user?.email}</span>
                              <span className="text-xs text-blue-700 bg-blue-100 px-2 py-0.5 rounded-full">{m.role || 'Member'}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    );
                  })()}
                </div>
              )}
              {/* Event Overview */}
              <div>
                <h4 className="text-lg font-medium text-gray-900 mb-3">Event Overview</h4>
                <p className="text-gray-600">{description}</p>
              </div>

              {/* Key Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    {getLocationIcon()}
                    <span className="text-gray-700">{getLocationText()}</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <CalendarIcon className="h-5 w-5 text-gray-500" />
                    <span className="text-gray-700">
                      {derivedStart ? format(derivedStart, 'MMM dd, yyyy') : 'TBA'} - {derivedEnd ? format(derivedEnd, 'MMM dd, yyyy') : 'TBA'}
                    </span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <UsersIcon className="h-5 w-5 text-gray-500" />
                    <span className="text-gray-700">
                      {event.currentParticipants}/{event.maxParticipants} participants
                    </span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <TrophyIcon className="h-5 w-5 text-gray-500" />
                    <span className="text-gray-700 font-medium text-green-600">{event.prize}</span>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                      {event.category}
                    </span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <ClockIcon className="h-5 w-5 text-gray-500" />
                    <span className="text-gray-700">
                      {derivedRegDeadline ? `Registration closes ${format(derivedRegDeadline, 'MMM dd, yyyy')}` : 'Registration deadline TBA'}
                    </span>
                  </div>
                  {Array.isArray(event.teams) && event.teams.length > 0 && (
                    <div className="space-y-2">
                      <div className="text-sm text-gray-700 font-medium">Your Team</div>
                      {(() => {
                        const team = event.teams[0];
                        const members = team?.members || [];
                        const leader = members.find(m => (m.role === 'Leader')) || members[0];
                        return (
                          <div className="bg-gray-50 rounded-lg p-3">
                            <div className="text-gray-800 font-medium mb-2">{team.teamName || team.name}</div>
                            <div className="text-sm text-gray-600 mb-2">Leader: {leader?.user?.fullName || leader?.user?.email || '—'}</div>
                            <div className="flex -space-x-2">
                              {members.map((m, idx) => (
                                <img
                                  key={m.id || idx}
                                  className="inline-block h-8 w-8 rounded-full ring-2 ring-white"
                                  src={m.user?.profilePicture || `https://ui-avatars.com/api/?name=${encodeURIComponent(m.user?.fullName || m.user?.email || 'U')}`}
                                  alt={m.user?.fullName || 'Member'}
                                  title={m.user?.fullName || m.user?.email}
                                />
                              ))}
                            </div>
                          </div>
                        );
                      })()}
                    </div>
                  )}
                  {event.isRegistered && (
                    <div className="flex items-center space-x-3">
                      <CheckCircleIcon className="h-5 w-5 text-green-500" />
                      <span className="text-green-700 font-medium">
                        {registrationOn ? `Registered on ${format(registrationOn, 'MMM dd, yyyy')}` : 'Registered'}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Timeline */}
              <div>
                <h4 className="text-lg font-medium text-gray-900 mb-3">Event Timeline</h4>
                <div className="space-y-3">
                  {(Array.isArray(event.timeline) ? event.timeline : [])
                    .map((item, index) => {
                      const label = item?.event || item?.label || 'Milestone';
                      const date = item?.date || item?.when || item?.deadline || '';
                      return (
                        <div key={index} className="flex items-center space-x-3">
                          <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                          <span className="text-gray-700 font-medium">{String(date)}:</span>
                          <span className="text-gray-600">{label}</span>
                        </div>
                      );
                    })}
                </div>
              </div>

              {/* Rules */}
              <div>
                <h4 className="text-lg font-medium text-gray-900 mb-3">Rules & Guidelines</h4>
                <ul className="space-y-2">
                  {rulesArray.map((rule, index) => (
                    <li key={index} className="flex items-start space-x-3">
                      <span className="text-blue-500 mt-1">•</span>
                      <span className="text-gray-600">{rule}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Q&A */}
              <div>
                <QnA eventId={event.id} />
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-600">
                {event.isRegistered ? (
                  <span className="text-green-600 font-medium">✓ You are registered for this event</span>
                ) : event.status === 'full' ? (
                  <span className="text-red-600 font-medium">Event is full</span>
                ) : new Date(event.registrationDeadline) < new Date() ? (
                  <span className="text-gray-600">Registration is closed</span>
                ) : (
                  <span className="text-gray-600">Registration is open</span>
                )}
              </div>
              
              <div className="flex space-x-3">
                <button
                  onClick={onClose}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Close
                </button>
                
                {isRegistrationOpen() && !event.isRegistered && (
                  <button
                    onClick={handleRegistration}
                    disabled={isRegistering}
                    className={`px-6 py-2 rounded-lg font-medium transition-colors ${
                      isRegistering
                        ? 'bg-gray-400 text-gray-200 cursor-not-allowed'
                        : 'bg-blue-600 text-white hover:bg-blue-700'
                    }`}
                  >
                    {isRegistering ? 'Registering...' : 'Register Now'}
                  </button>
                )}
                
                {registrationSuccess && (
                  <button
                    disabled
                    className="px-6 py-2 bg-green-600 text-white rounded-lg font-medium cursor-not-allowed"
                  >
                    ✓ Registered!
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventDetailsModal;
