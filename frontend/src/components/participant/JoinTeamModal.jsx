import React, { useState } from 'react';
import { XMarkIcon, UserPlusIcon, KeyIcon } from '@heroicons/react/24/outline';
import { useNotifications } from '../../context/NotificationContext';
import { participantService } from '../../services/participantService';

const JoinTeamModal = ({ isOpen, onClose, onTeamJoined }) => {
  const [invitationCode, setInvitationCode] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const { showSuccess, showError } = useNotifications();

  if (!isOpen) return null;

  const handleInputChange = (e) => {
    const { value } = e.target;
    setInvitationCode(value.toUpperCase());
    
    // Clear error when user starts typing
    if (errors.invitationCode) {
      setErrors(prev => ({
        ...prev,
        invitationCode: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!invitationCode.trim()) {
      newErrors.invitationCode = 'Invitation code is required';
    } else if (invitationCode.length < 6) {
      newErrors.invitationCode = 'Invitation code must be at least 6 characters';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsSubmitting(true);
    try {
      await participantService.joinTeam(invitationCode.trim().toUpperCase());

      if (typeof onTeamJoined === 'function') {
        try {
          const { teams } = await participantService.getParticipantTeams();
          onTeamJoined(Array.isArray(teams) ? teams : []);
        } catch (_) {}
      }

      setInvitationCode('');
      setErrors({});
      onClose();
      showSuccess('Joined team successfully');
    } catch (error) {
      console.error('Failed to join team:', error);
      const message = error?.message || 'Failed to join team. Please check your invitation code and try again.';
      setErrors({ submit: message });
      showError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      setInvitationCode('');
      setErrors({});
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        {/* Background overlay */}
        <div 
          className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
          onClick={handleClose}
        ></div>

        {/* Modal panel */}
        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
          {/* Header */}
          <div className="bg-purple-600 px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <UserPlusIcon className="h-6 w-6 text-white" />
                <h3 className="text-lg font-semibold text-white">Join Existing Team</h3>
              </div>
              <button
                onClick={handleClose}
                disabled={isSubmitting}
                className="text-white hover:text-purple-100 transition-colors disabled:opacity-50"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="px-6 py-6">
            <div className="space-y-6">
              {/* Info */}
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                <div className="flex items-start space-x-3">
                  <KeyIcon className="h-5 w-5 text-purple-600 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-medium text-purple-800 mb-1">
                      How to join a team
                    </h4>
                    <p className="text-sm text-purple-700">
                      Ask your team leader for the invitation code. Enter it below to join their team.
                    </p>
                  </div>
                </div>
              </div>

              {/* Invitation Code */}
              <div>
                <label htmlFor="invitationCode" className="block text-sm font-medium text-gray-700 mb-2">
                  Invitation Code *
                </label>
                <input
                  type="text"
                  id="invitationCode"
                  name="invitationCode"
                  value={invitationCode}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors text-center text-lg font-mono tracking-wider ${
                    errors.invitationCode ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="Enter code (e.g., QUANTUM2024)"
                  disabled={isSubmitting}
                  maxLength={20}
                />
                {errors.invitationCode && (
                  <p className="mt-1 text-sm text-red-600">{errors.invitationCode}</p>
                )}
                <p className="mt-1 text-sm text-gray-500">
                  The code is case-insensitive
                </p>
              </div>

              {/* Submit Error */}
              {errors.submit && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                  <p className="text-sm text-red-600">{errors.submit}</p>
                </div>
              )}

              {/* Actions */}
              <div className="flex items-center justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={handleClose}
                  disabled={isSubmitting}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || !invitationCode.trim()}
                  className="px-6 py-2 bg-purple-600 text-white rounded-lg text-sm font-medium hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? 'Joining...' : 'Join Team'}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default JoinTeamModal;
