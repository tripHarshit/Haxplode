import React from 'react';
import { XMarkIcon, UsersIcon, CalendarIcon, EnvelopeIcon, CodeBracketIcon } from '@heroicons/react/24/outline';
import { format } from 'date-fns';

const ParticipantDetailsModal = ({ participant, isOpen, onClose }) => {
  if (!isOpen || !participant) return null;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-full max-w-2xl shadow-lg rounded-md bg-white">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold text-gray-900">Participant Details</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-2xl"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>
        
        <div className="space-y-6">
          {/* Basic Information */}
          <div className="flex items-center space-x-4">
            <div className="h-16 w-16 rounded-full bg-blue-100 flex items-center justify-center">
              <UsersIcon className="h-8 w-8 text-blue-600" />
            </div>
            <div>
              <h4 className="text-2xl font-bold text-gray-900">{participant.name}</h4>
              <p className="text-gray-600">{participant.email}</p>
            </div>
          </div>

          {/* Registration Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex items-center space-x-2 mb-2">
                <CalendarIcon className="h-5 w-5 text-gray-500" />
                <span className="font-medium text-gray-700">Registration Date</span>
              </div>
              <p className="text-gray-900">{format(new Date(participant.registrationDate), 'MMMM dd, yyyy')}</p>
            </div>
            
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex items-center space-x-2 mb-2">
                <EnvelopeIcon className="h-5 w-5 text-gray-500" />
                <span className="font-medium text-gray-700">Last Active</span>
              </div>
              <p className="text-gray-900">{format(new Date(participant.lastActive), 'MMMM dd, yyyy')}</p>
            </div>
          </div>

          {/* Team Information */}
          <div className="bg-blue-50 p-4 rounded-lg">
            <h5 className="font-medium text-blue-900 mb-3">Team Information</h5>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-blue-700">Status:</span>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  participant.teamStatus === 'In Team' 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-yellow-100 text-yellow-800'
                }`}>
                  {participant.teamStatus}
                </span>
              </div>
              {participant.teamName && (
                <div className="flex justify-between">
                  <span className="text-blue-700">Team Name:</span>
                  <span className="text-blue-900 font-medium">{participant.teamName}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-blue-700">Hackathon:</span>
                <span className="text-blue-900">{participant.hackathonTitle}</span>
              </div>
            </div>
          </div>

          {/* Skills */}
          <div>
            <h5 className="font-medium text-gray-900 mb-3 flex items-center space-x-2">
              <CodeBracketIcon className="h-5 w-5 text-gray-500" />
              <span>Skills & Expertise</span>
            </h5>
            <div className="flex flex-wrap gap-2">
              {participant.skills.map((skill, index) => (
                <span
                  key={index}
                  className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>

          {/* Submissions */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h5 className="font-medium text-gray-900 mb-3">Submission History</h5>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Total Submissions:</span>
                <span className="font-medium text-gray-900">{participant.submissions}</span>
              </div>
              {participant.submissions > 0 ? (
                <p className="text-sm text-gray-600">
                  This participant has submitted {participant.submissions} project{participant.submissions !== 1 ? 's' : ''} for the hackathon.
                </p>
              ) : (
                <p className="text-sm text-gray-600">
                  No submissions yet. This participant is still working on their project.
                </p>
              )}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex justify-end space-x-3 pt-4 border-t">
            <button
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Close
            </button>
            <button className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700">
              Send Message
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ParticipantDetailsModal;
