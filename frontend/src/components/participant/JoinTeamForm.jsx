import React, { useState } from 'react';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import { useNotifications } from '../../context/NotificationContext';
import { participantService } from '../../services/participantService';
import { authService } from '../../services/authService';
import { hackathonService } from '../../services/hackathonService';

const JoinTeamForm = ({ event, onBack, onJoined }) => {
  const { showSuccess, showError } = useNotifications();
  const [code, setCode] = useState('');
  const [fullName, setFullName] = useState('');
  const [education, setEducation] = useState('');
  const [institution, setInstitution] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  const validate = () => {
    const e = {};
    if (!code.trim()) e.code = 'Code is required';
    if (code.trim().length < 6) e.code = 'Code must be at least 6 characters';
    if (!fullName.trim()) e.fullName = 'Your name is required';
    if (!education.trim()) e.education = 'Education level is required';
    if (!institution.trim()) e.institution = 'Institution is required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (evt) => {
    evt.preventDefault();
    if (!validate()) return;
    setIsSubmitting(true);
    try {
      // Update participant info
      await authService.updateProfile({ fullName, bio: `${education} @ ${institution}` });
      // Join team
      await participantService.joinTeam(code.trim().toUpperCase());
      // Register for event
      await hackathonService.registerForHackathon(event.id);
      showSuccess('Joined team successfully');
      if (onJoined) onJoined();
    } catch (err) {
      showError(err.message || 'Failed to join team');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="px-6 py-6">
      <div className="flex items-center justify-between mb-4">
        <button type="button" onClick={onBack} className="text-gray-600 hover:text-gray-900 flex items-center space-x-2">
          <ArrowLeftIcon className="h-5 w-5" />
          <span>Back</span>
        </button>
      </div>

      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Your Full Name *</label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => {
                setFullName(e.target.value);
                if (errors.fullName) setErrors((prev) => ({ ...prev, fullName: '' }));
              }}
              disabled={isSubmitting}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 ${errors.fullName ? 'border-red-300' : 'border-gray-300'}`}
              placeholder="Jane Doe"
            />
            {errors.fullName && <p className="mt-1 text-sm text-red-600">{errors.fullName}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Education *</label>
            <input
              type="text"
              value={education}
              onChange={(e) => {
                setEducation(e.target.value);
                if (errors.education) setErrors((prev) => ({ ...prev, education: '' }));
              }}
              disabled={isSubmitting}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 ${errors.education ? 'border-red-300' : 'border-gray-300'}`}
              placeholder="B.Tech / B.Sc / M.Sc / ..."
            />
            {errors.education && <p className="mt-1 text-sm text-red-600">{errors.education}</p>}
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Institution *</label>
          <input
            type="text"
            value={institution}
            onChange={(e) => {
              setInstitution(e.target.value);
              if (errors.institution) setErrors((prev) => ({ ...prev, institution: '' }));
            }}
            disabled={isSubmitting}
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 ${errors.institution ? 'border-red-300' : 'border-gray-300'}`}
            placeholder="College/University/Company"
          />
          {errors.institution && <p className="mt-1 text-sm text-red-600">{errors.institution}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Join Code *</label>
          <input
            type="text"
            value={code}
            onChange={(e) => {
              setCode(e.target.value.toUpperCase());
              if (errors.code) setErrors((prev) => ({ ...prev, code: '' }));
            }}
            disabled={isSubmitting}
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-center tracking-widest font-mono ${errors.code ? 'border-red-300' : 'border-gray-300'}`}
            placeholder="ABC123"
            maxLength={20}
          />
          {errors.code && <p className="mt-1 text-sm text-red-600">{errors.code}</p>}
        </div>

        <div className="flex items-center justify-end space-x-3 pt-2">
          <button type="button" onClick={onBack} className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">Cancel</button>
          <button type="submit" disabled={isSubmitting || !code.trim()} className="px-6 py-2 bg-purple-600 text-white rounded-lg text-sm font-medium hover:bg-purple-700 disabled:opacity-50">
            {isSubmitting ? 'Joining...' : 'Join Team'}
          </button>
        </div>
      </div>
    </form>
  );
};

export default JoinTeamForm;


