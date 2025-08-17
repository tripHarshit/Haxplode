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

const EventDetailsModal = ({ event, isOpen, onClose }) => {
  const [isRegistering, setIsRegistering] = useState(false);
  const [registrationSuccess, setRegistrationSuccess] = useState(false);

  if (!isOpen || !event) return null;

  const handleRegistration = async () => {
    setIsRegistering(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      setRegistrationSuccess(true);
      // In real app: await participantService.registerForEvent(event.id);
    } catch (error) {
      console.error('Registration failed:', error);
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
    if (event.isRegistered || event.status === 'full') return false;
    return new Date(event.registrationDeadline) > new Date();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        {/* Background overlay */}
        <div 
          className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
          onClick={onClose}
        ></div>

        {/* Modal panel */}
        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full">
          {/* Header */}
          <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">{event.title}</h3>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="px-6 py-6 max-h-96 overflow-y-auto">
            <div className="space-y-6">
              {/* Event Overview */}
              <div>
                <h4 className="text-lg font-medium text-gray-900 mb-3">Event Overview</h4>
                <p className="text-gray-600">{event.description}</p>
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
                      {format(new Date(event.startDate), 'MMM dd, yyyy')} - {format(new Date(event.endDate), 'MMM dd, yyyy')}
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
                      Registration closes {format(new Date(event.registrationDeadline), 'MMM dd, yyyy')}
                    </span>
                  </div>
                  {event.isRegistered && (
                    <div className="flex items-center space-x-3">
                      <CheckCircleIcon className="h-5 w-5 text-green-500" />
                      <span className="text-green-700 font-medium">Registered on {format(new Date(event.registrationDate), 'MMM dd, yyyy')}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Timeline */}
              <div>
                <h4 className="text-lg font-medium text-gray-900 mb-3">Event Timeline</h4>
                <div className="space-y-3">
                  {event.timeline.map((item, index) => (
                    <div key={index} className="flex items-center space-x-3">
                      <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                      <span className="text-gray-700 font-medium">{item.date}:</span>
                      <span className="text-gray-600">{item.event}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Rules */}
              <div>
                <h4 className="text-lg font-medium text-gray-900 mb-3">Rules & Guidelines</h4>
                <ul className="space-y-2">
                  {event.rules.map((rule, index) => (
                    <li key={index} className="flex items-start space-x-3">
                      <span className="text-blue-500 mt-1">•</span>
                      <span className="text-gray-600">{rule}</span>
                    </li>
                  ))}
                </ul>
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
