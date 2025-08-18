import React, { useState } from 'react';
import { 
  XMarkIcon, 
  UserGroupIcon, 
  UserPlusIcon, 
  CogIcon,
  TrashIcon,
  ChatBubbleLeftRightIcon,
  DocumentTextIcon,
  CalendarIcon,
  EnvelopeIcon,
  ClipboardDocumentIcon
} from '@heroicons/react/24/outline';
import { format } from 'date-fns';

const TeamDetailsModal = ({ team, isOpen, onClose }) => {
  const [showInviteForm, setShowInviteForm] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [isInviting, setIsInviting] = useState(false);
  const [isLeaving, setIsLeaving] = useState(false);
  const [errors, setErrors] = useState({});

  if (!isOpen || !team) return null;

  const handleInviteMember = async (e) => {
    e.preventDefault();
    
    if (!inviteEmail.trim()) {
      setErrors({ email: 'Email is required' });
      return;
    }
    
    setIsInviting(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // In real app: await participantService.inviteTeamMember(team.id, inviteEmail);
      console.log('Inviting member:', inviteEmail);
      
      setInviteEmail('');
      setErrors({});
      setShowInviteForm(false);
      
      // Show success message
      alert('Invitation sent successfully!');
      
    } catch (error) {
      console.error('Failed to invite member:', error);
      setErrors({ submit: 'Failed to send invitation. Please try again.' });
    } finally {
      setIsInviting(false);
    }
  };

  const handleLeaveTeam = async () => {
    if (!confirm('Are you sure you want to leave this team? This action cannot be undone.')) {
      return;
    }
    
    setIsLeaving(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // In real app: await participantService.leaveTeam(team.id);
      console.log('Leaving team:', team.id);
      
      onClose();
      // In real app, this would trigger a refresh of the teams list
      
    } catch (error) {
      console.error('Failed to leave team:', error);
      alert('Failed to leave team. Please try again.');
    } finally {
      setIsLeaving(false);
    }
  };

  const copyInvitationCode = () => {
    navigator.clipboard.writeText(team.invitationCode);
    // In real app, show a toast notification
    alert('Invitation code copied to clipboard!');
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
          <div className="bg-blue-600 px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <UserGroupIcon className="h-6 w-6 text-white" />
                <h3 className="text-lg font-semibold text-white">{team.name}</h3>
              </div>
              <button
                onClick={onClose}
                disabled={isInviting || isLeaving}
                className="text-white hover:text-blue-100 transition-colors disabled:opacity-50"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="px-6 py-6 max-h-96 overflow-y-auto">
            <div className="space-y-6">
              {/* Team Overview */}
              <div>
                <h4 className="text-lg font-medium text-gray-900 mb-3">Team Overview</h4>
                <p className="text-gray-600">{team.description}</p>
              </div>

              {/* Team Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="bg-blue-50 rounded-lg p-4">
                    <div className="flex items-center space-x-2 text-sm text-blue-800 mb-2">
                      <DocumentTextIcon className="h-4 w-4" />
                      <span className="font-medium">Hackathon</span>
                    </div>
                    <p className="text-blue-900">{team.hackathonTitle}</p>
                  </div>
                  
                  <div className="bg-green-50 rounded-lg p-4">
                    <div className="flex items-center space-x-2 text-sm text-green-800 mb-2">
                      <CalendarIcon className="h-4 w-4" />
                      <span className="font-medium">Created</span>
                    </div>
                    <p className="text-green-900">{format(new Date(team.createdAt), 'MMM dd, yyyy')}</p>
                  </div>
                  
                  <div className="bg-purple-50 rounded-lg p-4">
                    <div className="flex items-center space-x-2 text-sm text-purple-800 mb-2">
                      <ClipboardDocumentIcon className="h-4 w-4" />
                      <span className="font-medium">Invitation Code</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <code className="text-purple-900 font-mono text-sm bg-purple-100 px-2 py-1 rounded">
                        {team.invitationCode}
                      </code>
                      <button
                        onClick={copyInvitationCode}
                        className="text-purple-600 hover:text-purple-700 transition-colors"
                        title="Copy invitation code"
                      >
                        <ClipboardDocumentIcon className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Progress */}
                {team.progress && (
                  <div className="space-y-4">
                    <h5 className="font-medium text-gray-900">Project Progress</h5>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-gray-700">Completion</span>
                        <span className="text-lg font-bold text-gray-900">{team.progress.completion}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-3">
                        <div
                          className="bg-blue-600 h-3 rounded-full transition-all duration-300"
                          style={{ width: `${team.progress.completion}%` }}
                        ></div>
                      </div>
                      <p className="text-sm text-gray-600 mt-2">
                        {team.progress.projectName}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        Last updated: {format(new Date(team.progress.lastUpdated), 'MMM dd, yyyy HH:mm')}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Team Members */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-lg font-medium text-gray-900">Team Members</h4>
                  <button
                    onClick={() => setShowInviteForm(!showInviteForm)}
                    className="inline-flex items-center px-3 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
                  >
                    <UserPlusIcon className="h-4 w-4 mr-2" />
                    Invite Member
                  </button>
                </div>

                {/* Invite Form */}
                {showInviteForm && (
                  <div className="bg-gray-50 rounded-lg p-4 mb-4">
                    <form onSubmit={handleInviteMember} className="space-y-4">
                      <div>
                        <label htmlFor="inviteEmail" className="block text-sm font-medium text-gray-700 mb-2">
                          Email Address
                        </label>
                        <div className="flex space-x-2">
                          <input
                            type="email"
                            id="inviteEmail"
                            value={inviteEmail}
                            onChange={(e) => setInviteEmail(e.target.value)}
                            className={`flex-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                              errors.email ? 'border-red-300' : 'border-gray-300'
                            }`}
                            placeholder="Enter email address"
                            disabled={isInviting}
                          />
                          <button
                            type="submit"
                            disabled={isInviting || !inviteEmail.trim()}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors disabled:opacity-50"
                          >
                            {isInviting ? 'Sending...' : 'Send'}
                          </button>
                        </div>
                        {errors.email && (
                          <p className="mt-1 text-sm text-red-600">{errors.email}</p>
                        )}
                        {errors.submit && (
                          <p className="mt-1 text-sm text-red-600">{errors.submit}</p>
                        )}
                      </div>
                    </form>
                  </div>
                )}

                {/* Members List */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {team.members.map((member) => (
                    <div key={member.id} className="bg-white border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center space-x-3">
                        <img
                          src={member.avatar}
                          alt={member.name}
                          className="w-12 h-12 rounded-full"
                        />
                        <div className="flex-1">
                          <h5 className="font-medium text-gray-900">{member.name}</h5>
                          <p className="text-sm text-blue-600 font-medium">{member.role}</p>
                          <div className="flex flex-wrap gap-1 mt-2">
                            {member.skills.slice(0, 3).map((skill, index) => (
                              <span
                                key={index}
                                className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-gray-100 text-gray-800"
                              >
                                {skill}
                              </span>
                            ))}
                            {member.skills.length > 3 && (
                              <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-gray-100 text-gray-800">
                                +{member.skills.length - 3} more
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                
                <p className="text-sm text-gray-500 mt-3">
                  {team.members.length} of {team.maxMembers} members
                </p>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex space-x-2">
                <button className="p-2 text-gray-400 hover:text-blue-600 transition-colors">
                  <ChatBubbleLeftRightIcon className="h-5 w-5" />
                </button>
                <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
                  <CogIcon className="h-5 w-5" />
                </button>
              </div>
              
              <div className="flex space-x-3">
                <button
                  onClick={onClose}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Close
                </button>
                
                <button
                  onClick={handleLeaveTeam}
                  disabled={isLeaving}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 transition-colors disabled:opacity-50"
                >
                  {isLeaving ? 'Leaving...' : 'Leave Team'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeamDetailsModal;
