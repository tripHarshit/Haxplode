import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';
import { 
  UserIcon, 
  EnvelopeIcon, 
  PencilIcon,
  CheckIcon,
  XMarkIcon,
  BuildingOfficeIcon,
  LinkIcon,
  GlobeAltIcon
} from '@heroicons/react/24/outline';

const ProfilePage = () => {
  const { user, updateProfile } = useAuth();
  const { showSuccess, showError } = useNotifications();
  
  // State management
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    bio: '',
    organization: '',
    organizationRole: '',
    industry: '',
    experienceYears: '',
    linkedinProfile: '',
    githubProfile: '',
    website: '',
    hackathonsOrganized: '',
    teamSize: ''
  });

  // Initialize form data when user data changes
  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        bio: user.bio || '',
        organization: user.organization || '',
        organizationRole: user.organizationRole || '',
        industry: user.industry || '',
        experienceYears: user.experienceYears || '',
        linkedinProfile: user.linkedinProfile || '',
        githubProfile: user.githubProfile || '',
        website: user.website || '',
        hackathonsOrganized: user.hackathonsOrganized || '',
        teamSize: user.teamSize || ''
      });
    }
  }, [user]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };



  const handleSave = async () => {
    if (!formData.name.trim()) {
      showError('Name is required');
      return;
    }

    setIsLoading(true);
    try {
      await updateProfile(formData);
      showSuccess('Profile updated successfully!');
      setIsEditing(false);
    } catch (error) {
      showError(error.message || 'Failed to update profile');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        bio: user.bio || '',
        organization: user.organization || '',
        organizationRole: user.organizationRole || '',
        industry: user.industry || '',
        experienceYears: user.experienceYears || '',
        linkedinProfile: user.linkedinProfile || '',
        githubProfile: user.githubProfile || '',
        website: user.website || '',
        hackathonsOrganized: user.hackathonsOrganized || '',
        teamSize: user.teamSize || ''
      });
    }
    setIsEditing(false);
  };

  // Check if user exists
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center max-w-md mx-auto px-4">
          <UserIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
            Profile Not Available
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Please log in to view and edit your profile.
          </p>
          <button 
            onClick={() => window.location.href = '/login'}
            className="btn-primary"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  // Check if user is an organizer
  const isOrganizer = user.roles?.includes('organizer');

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Profile</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            {isOrganizer 
              ? 'Manage your organizer profile and professional information'
              : 'Manage your personal information and preferences'
            }
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
          {/* Profile Header */}
          <div className="px-6 py-6 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center space-x-4 mb-4 sm:mb-0">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                    {user.name}
                  </h2>
                  <div className="flex items-center space-x-2 mt-1">
                    {user.roles?.map((role, index) => (
                      <span
                        key={index}
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          role === 'organizer' 
                            ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                            : 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300'
                        }`}
                      >
                        {role === 'organizer' ? '🎯 Organizer' : role}
                      </span>
                    ))}
                  </div>
                  {isOrganizer && user.organization && (
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      {user.organizationRole} at {user.organization}
                    </p>
                  )}
                </div>
              </div>
              
              <div className="flex space-x-3">
                {!isEditing ? (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="btn-primary flex items-center space-x-2"
                  >
                    <PencilIcon className="h-4 w-4" />
                    <span>Edit Profile</span>
                  </button>
                ) : (
                  <>
                    <button
                      onClick={handleCancel}
                      className="btn-outline flex items-center space-x-2"
                    >
                      <XMarkIcon className="h-4 w-4" />
                      <span>Cancel</span>
                    </button>
                    <button
                      onClick={handleSave}
                      disabled={isLoading}
                      className="btn-primary flex items-center space-x-2"
                    >
                      {isLoading ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                          <span>Saving...</span>
                        </>
                      ) : (
                        <>
                          <CheckIcon className="h-4 w-4" />
                          <span>Save Changes</span>
                        </>
                      )}
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Profile Content */}
          <div className="p-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Left Column - Quick Info */}
              <div className="lg:col-span-1 space-y-6">

                {/* Simple Role Info */}
                <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
                  <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3 uppercase tracking-wide">
                    Account Info
                  </h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Role</span>
                      <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                        {user.roles?.join(', ') || 'N/A'}
                      </span>
                    </div>
                    {isOrganizer && (
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600 dark:text-gray-400">Organization</span>
                        <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                          {user.organization || 'Not specified'}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Organizer-specific Quick Actions */}
                {isOrganizer && (
                  <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4 border border-green-200 dark:border-green-800">
                    <h3 className="text-sm font-medium text-green-800 dark:text-green-300 mb-3 uppercase tracking-wide">
                      Organizer Tools
                    </h3>
                    <div className="space-y-2">
                      <div className="text-xs text-green-700 dark:text-green-400">
                        • Create new hackathons
                      </div>
                      <div className="text-xs text-green-700 dark:text-green-400">
                        • Manage participants
                      </div>
                      <div className="text-xs text-green-700 dark:text-green-400">
                        • Review submissions
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Right Column - Profile Details */}
              <div className="lg:col-span-2 space-y-8">
                {/* Basic Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 flex items-center">
                    <UserIcon className="h-5 w-5 mr-2 text-blue-600" />
                    Basic Information
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Full Name *
                      </label>
                      {isEditing ? (
                        <input
                          type="text"
                          name="name"
                          value={formData.name}
                          onChange={handleInputChange}
                          className="input"
                          placeholder="Enter your full name"
                          required
                        />
                      ) : (
                        <p className="text-gray-900 dark:text-gray-100 py-2 px-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                          {user.name || 'Not specified'}
                        </p>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Email Address
                      </label>
                      <div className="flex items-center space-x-2 py-2 px-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                        <EnvelopeIcon className="h-4 w-4 text-gray-400" />
                        <span className="text-gray-900 dark:text-gray-100">
                          {user.email}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
                    </div>
                  </div>
                </div>

                {/* Bio */}
                <div className="space-y-4">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Bio
                  </label>
                  {isEditing ? (
                    <textarea
                      name="bio"
                      value={formData.bio}
                      onChange={handleInputChange}
                      rows={4}
                      className="input resize-none"
                      placeholder={isOrganizer 
                        ? "Tell us about your experience organizing events, your vision for hackathons, and what drives you..."
                        : "Tell us about yourself, your interests, and what you're passionate about..."
                      }
                    />
                  ) : (
                    <div className="py-3 px-4 bg-gray-50 dark:bg-gray-700 rounded-lg min-h-[4rem]">
                      <p className="text-gray-900 dark:text-gray-100">
                        {user.bio || (isOrganizer 
                          ? 'No bio added yet. Tell us about your hackathon organizing experience!'
                          : 'No bio added yet. Click edit to add your bio.'
                        )}
                      </p>
                    </div>
                  )}
                </div>

                {/* Organization Information - Organizer Specific */}
                {isOrganizer && (
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 flex items-center">
                      <BuildingOfficeIcon className="h-5 w-5 mr-2 text-green-600" />
                      Organization Details
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Organization/Company
                        </label>
                        {isEditing ? (
                          <input
                            type="text"
                            name="organization"
                            value={formData.organization}
                            onChange={handleInputChange}
                            className="input"
                            placeholder="Enter your organization name"
                          />
                        ) : (
                          <p className="text-gray-900 dark:text-gray-100 py-2 px-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                            {user.organization || 'Not specified'}
                          </p>
                        )}
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Your Role
                        </label>
                        {isEditing ? (
                          <input
                            type="text"
                            name="organizationRole"
                            value={formData.organizationRole}
                            onChange={handleInputChange}
                            className="input"
                            placeholder="e.g., Event Manager, Director"
                          />
                        ) : (
                          <p className="text-gray-900 dark:text-gray-100 py-2 px-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                            {user.organizationRole || 'Not specified'}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Industry
                        </label>
                        {isEditing ? (
                          <input
                            type="text"
                            name="industry"
                            value={formData.industry}
                            onChange={handleInputChange}
                            className="input"
                            placeholder="e.g., Technology, Education, Finance"
                          />
                        ) : (
                          <p className="text-gray-900 dark:text-gray-100 py-2 px-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                            {user.industry || 'Not specified'}
                          </p>
                        )}
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Years of Experience
                        </label>
                        {isEditing ? (
                          <input
                            type="number"
                            name="experienceYears"
                            value={formData.experienceYears}
                            onChange={handleInputChange}
                            min="0"
                            max="50"
                            className="input"
                            placeholder="5"
                          />
                        ) : (
                          <p className="text-gray-900 dark:text-gray-100 py-2 px-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                            {user.experienceYears ? `${user.experienceYears} years` : 'Not specified'}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* Hackathon Experience - Organizer Specific */}
                {isOrganizer && (
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 flex items-center">
                      <TrophyIcon className="h-5 w-5 mr-2 text-green-600" />
                      Hackathon Experience
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Hackathons Organized
                        </label>
                        {isEditing ? (
                          <input
                            type="number"
                            name="hackathonsOrganized"
                            value={formData.hackathonsOrganized}
                            onChange={handleInputChange}
                            min="0"
                            className="input"
                            placeholder="10"
                          />
                        ) : (
                          <p className="text-gray-900 dark:text-gray-100 py-2 px-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                            {user.hackathonsOrganized || '0'}
                          </p>
                        )}
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Typical Team Size
                        </label>
                        {isEditing ? (
                          <input
                            type="text"
                            name="teamSize"
                            value={formData.teamSize}
                            onChange={handleInputChange}
                            className="input"
                            placeholder="e.g., 3-5 members"
                          />
                        ) : (
                          <p className="text-gray-900 dark:text-gray-100 py-2 px-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                            {user.teamSize || 'Not specified'}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* Social Profiles */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 flex items-center">
                    <LinkIcon className="h-5 w-5 mr-2 text-blue-600" />
                    Social Profiles
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        LinkedIn Profile
                      </label>
                      {isEditing ? (
                        <input
                          type="url"
                          name="linkedinProfile"
                          value={formData.linkedinProfile}
                          onChange={handleInputChange}
                          className="input"
                          placeholder="https://linkedin.com/in/username"
                        />
                      ) : (
                        <div className="py-2 px-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                          {user.linkedinProfile ? (
                            <a 
                              href={user.linkedinProfile} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 flex items-center space-x-2"
                            >
                              <span>View Profile</span>
                              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                              </svg>
                            </a>
                          ) : (
                            <span className="text-gray-500">Not specified</span>
                          )}
                        </div>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        GitHub Profile
                      </label>
                      {isEditing ? (
                        <input
                          type="url"
                          name="githubProfile"
                          value={formData.githubProfile}
                          onChange={handleInputChange}
                          className="input"
                          placeholder="https://github.com/username"
                        />
                      ) : (
                        <div className="py-2 px-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                          {user.githubProfile ? (
                            <a 
                              href={user.githubProfile} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 flex items-center space-x-2"
                            >
                              <span>View Profile</span>
                              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                              </svg>
                            </a>
                          ) : (
                            <span className="text-gray-500">Not specified</span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                  {isOrganizer && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Website
                      </label>
                      {isEditing ? (
                        <input
                          type="url"
                          name="website"
                          value={formData.website}
                          onChange={handleInputChange}
                          className="input"
                          placeholder="https://yourwebsite.com"
                        />
                      ) : (
                        <div className="py-2 px-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                          {user.website ? (
                            <a 
                              href={user.website} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 flex items-center space-x-2"
                            >
                              <span>Visit Website</span>
                              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                              </svg>
                            </a>
                          ) : (
                            <span className="text-gray-500">Not specified</span>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>






              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
