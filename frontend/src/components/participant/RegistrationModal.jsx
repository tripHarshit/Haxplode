import React, { useState } from 'react';
import { XMarkIcon, UserGroupIcon, UserPlusIcon, CheckCircleIcon } from '@heroicons/react/24/outline';
import CreateTeamForm from './CreateTeamForm';
import JoinTeamForm from './JoinTeamForm';
import TeamCodeDisplay from './TeamCodeDisplay';

const RegistrationModal = ({ isOpen, onClose, event, onCompleted }) => {
  const [step, setStep] = useState('choose'); // choose | create | join | code | success
  const [inviteCode, setInviteCode] = useState('');

  if (!isOpen || !event) return null;

  const handleBackToChoices = () => setStep('choose');

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={onClose}></div>

        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full">
          <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">Register for {event.title}</h3>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>

          {step === 'choose' && (
            <div className="px-6 py-6">
              <p className="text-gray-600 mb-6">Choose how you want to participate:</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <button
                  onClick={() => setStep('create')}
                  className="border rounded-xl p-5 text-left hover:border-blue-400 hover:shadow-sm transition-colors"
                >
                  <div className="flex items-center space-x-3 mb-2">
                    <UserGroupIcon className="h-6 w-6 text-blue-600" />
                    <span className="font-semibold text-gray-900">Create a Team</span>
                  </div>
                  <p className="text-sm text-gray-600">Become a team leader, create a team for this event, then share the join code.</p>
                </button>
                <button
                  onClick={() => setStep('join')}
                  className="border rounded-xl p-5 text-left hover:border-purple-400 hover:shadow-sm transition-colors"
                >
                  <div className="flex items-center space-x-3 mb-2">
                    <UserPlusIcon className="h-6 w-6 text-purple-600" />
                    <span className="font-semibold text-gray-900">Join a Team</span>
                  </div>
                  <p className="text-sm text-gray-600">Enter a join code from your team leader and complete your profile.</p>
                </button>
              </div>
            </div>
          )}

          {step === 'create' && (
            <CreateTeamForm
              event={event}
              onBack={handleBackToChoices}
              onInviteCode={(code) => {
                setInviteCode(code);
                setStep('code');
              }}
              onCompleted={() => {
                if (onCompleted) onCompleted();
              }}
            />
          )}

          {step === 'join' && (
            <JoinTeamForm
              event={event}
              onBack={handleBackToChoices}
              onJoined={() => {
                setStep('success');
                if (onCompleted) onCompleted();
              }}
            />
          )}

          {step === 'code' && (
            <div className="px-6 py-6">
              <TeamCodeDisplay code={inviteCode} onClose={onClose} onDone={() => onClose()} />
            </div>
          )}

          {step === 'success' && (
            <div className="px-6 py-10 text-center">
              <CheckCircleIcon className="h-12 w-12 text-green-600 mx-auto mb-3" />
              <h4 className="text-lg font-semibold text-gray-900 mb-1">You're all set!</h4>
              <p className="text-gray-600 mb-6">You've joined a team for {event.title}.</p>
              <div className="flex items-center justify-center space-x-3">
                <button onClick={onClose} className="px-5 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors">Close</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RegistrationModal;


