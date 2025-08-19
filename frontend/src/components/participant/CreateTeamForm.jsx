import React, { useState } from 'react';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import { useNotifications } from '../../context/NotificationContext';
import { participantService } from '../../services/participantService';
import { authService } from '../../services/authService';
import { hackathonService } from '../../services/hackathonService';

const CreateTeamForm = ({ event, onBack, onInviteCode, onCompleted }) => {
  const { showSuccess, showError } = useNotifications();
  const [formData, setFormData] = useState({
    teamName: '',
    description: '',
    fullName: '',
    education: '',
    institution: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const validate = () => {
    const e = {};
    if (!formData.teamName.trim()) e.teamName = 'Team name is required';
    if (!formData.description.trim()) e.description = 'Description is required';
    if (!formData.fullName.trim()) e.fullName = 'Your name is required';
    if (!formData.education.trim()) e.education = 'Education level is required';
    if (!formData.institution.trim()) e.institution = 'Institution is required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (evt) => {
    evt.preventDefault();
    if (!validate()) return;
    setIsSubmitting(true);
    try {
      // Update participant info
      await authService.updateProfile({ fullName: formData.fullName, bio: `${formData.education} @ ${formData.institution}` });

      // Create team
      const createRes = await participantService.createTeam({
        teamName: formData.teamName.trim(),
        description: formData.description.trim(),
        eventId: event.id,
      });

      const teamId = createRes?.data?.team?.id || createRes?.data?.team?.data?.id || createRes?.data?.id || createRes?.team?.id;
      if (!teamId) throw new Error('Team creation response missing ID');

      // Generate invite code for the leader to share
      const inviteRes = await participantService.inviteTeamMember(teamId, 'placeholder@example.com');
      const code = inviteRes?.invitationCode || inviteRes?.data?.invitationCode;

      // Register for event
      await hackathonService.registerForHackathon(event.id);

      showSuccess('Team created successfully');
      if (code && onInviteCode) onInviteCode(code);
      if (onCompleted) onCompleted();
    } catch (err) {
      showError(err.message || 'Failed to create team');
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
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Your Full Name *</label>
          <input
            type="text"
            name="fullName"
            value={formData.fullName}
            onChange={handleChange}
            disabled={isSubmitting}
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${errors.fullName ? 'border-red-300' : 'border-gray-300'}`}
            placeholder="Jane Doe"
          />
          {errors.fullName && <p className="mt-1 text-sm text-red-600">{errors.fullName}</p>}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Education *</label>
            <input
              type="text"
              name="education"
              value={formData.education}
              onChange={handleChange}
              disabled={isSubmitting}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${errors.education ? 'border-red-300' : 'border-gray-300'}`}
              placeholder="B.Tech / B.Sc / M.Sc / ..."
            />
            {errors.education && <p className="mt-1 text-sm text-red-600">{errors.education}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Institution *</label>
            <input
              type="text"
              name="institution"
              value={formData.institution}
              onChange={handleChange}
              disabled={isSubmitting}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${errors.institution ? 'border-red-300' : 'border-gray-300'}`}
              placeholder="College/University/Company"
            />
            {errors.institution && <p className="mt-1 text-sm text-red-600">{errors.institution}</p>}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Team Name *</label>
          <input
            type="text"
            name="teamName"
            value={formData.teamName}
            onChange={handleChange}
            disabled={isSubmitting}
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${errors.teamName ? 'border-red-300' : 'border-gray-300'}`}
            placeholder="Enter a team name"
          />
          {errors.teamName && <p className="mt-1 text-sm text-red-600">{errors.teamName}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Description *</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            disabled={isSubmitting}
            rows={3}
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${errors.description ? 'border-red-300' : 'border-gray-300'}`}
            placeholder="Briefly describe your team"
          />
          {errors.description && <p className="mt-1 text-sm text-red-600">{errors.description}</p>}
        </div>

        <div className="flex items-center justify-end space-x-3 pt-2">
          <button type="button" onClick={onBack} className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">Cancel</button>
          <button type="submit" disabled={isSubmitting} className="px-6 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50">
            {isSubmitting ? 'Creating...' : 'Create Team'}
          </button>
        </div>
      </div>
    </form>
  );
};

export default CreateTeamForm;


