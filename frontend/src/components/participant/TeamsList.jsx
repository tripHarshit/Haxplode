import React, { useState, useEffect } from 'react';
import { 
  PlusIcon, 
  UserGroupIcon, 
  UserPlusIcon, 
  CogIcon,
  TrashIcon,
  ChatBubbleLeftRightIcon,
  DocumentTextIcon,
  CalendarIcon
} from '@heroicons/react/24/outline';
import { format } from 'date-fns';
import CreateTeamModal from './CreateTeamModal';
import JoinTeamModal from './JoinTeamModal';
import TeamDetailsModal from './TeamDetailsModal';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';
import { dataService } from '../../utils/mockData';

const TeamsList = ({ teams }) => {
  const { user } = useAuth();
  const { showSuccess, showError } = useNotifications();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [showTeamDetails, setShowTeamDetails] = useState(false);
  const [currentTeams, setCurrentTeams] = useState(teams);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    setCurrentTeams(teams);
  }, [teams]);

  const handleTeamUpdate = () => {
    setCurrentTeams(dataService.getTeams());
  };

  const handleDeleteTeam = async (teamId, e) => {
    e.stopPropagation();
    
    if (!user) {
      showError('Please log in to delete teams');
      return;
    }

    if (!window.confirm('Are you sure you want to delete this team? This action cannot be undone.')) {
      return;
    }

    setIsDeleting(true);
    try {
      await dataService.deleteTeam(teamId, user.id);
      showSuccess('Team deleted successfully');
      handleTeamUpdate();
    } catch (error) {
      showError(error.message);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleTeamClick = (team) => {
    setSelectedTeam(team);
    setShowTeamDetails(true);
  };

  const closeTeamDetails = () => {
    setShowTeamDetails(false);
    setSelectedTeam(null);
  };

  const getProgressColor = (completion) => {
    if (completion >= 80) return 'bg-green-500';
    if (completion >= 60) return 'bg-blue-500';
    if (completion >= 40) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Teams</h2>
          <p className="text-gray-600">Your registered hackathons and teams</p>
        </div>
        
        <div className="flex space-x-3">
          <button
            onClick={() => setShowJoinModal(true)}
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors"
          >
            <UserPlusIcon className="h-4 w-4 mr-2" />
            Join Team
          </button>
        </div>
      </div>

      {/* Teams Grid */}
      {currentTeams.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {currentTeams.map((team) => (
            <div
              key={team.id}
              className="bg-white rounded-xl shadow-sm border p-6 hover:shadow-md transition-all duration-200 cursor-pointer transform hover:scale-[1.02]"
              onClick={() => handleTeamClick(team)}
            >
              <div className="space-y-4">
                {/* Team Header */}
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">{team.name}</h3>
                    <p className="text-sm text-gray-600 line-clamp-2">{team.description}</p>
                  </div>
                  <div className="flex items-center space-x-2 ml-4">
                    <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
                      <CogIcon className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                {/* Hackathon Info */}
                <div className="bg-blue-50 rounded-lg p-3">
                  <div className="flex items-center space-x-2 text-sm text-blue-800">
                    <DocumentTextIcon className="h-4 w-4" />
                    <span className="font-medium">{team.event?.name || team.hackathonTitle}</span>
                  </div>
                </div>

                {/* Progress */}
                {team.progress && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Project Progress</span>
                      <span className="font-medium text-gray-900">{team.progress.completion}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full transition-all duration-300 ${getProgressColor(team.progress.completion)}`}
                        style={{ width: `${team.progress.completion}%` }}
                      ></div>
                    </div>
                    <p className="text-xs text-gray-500">
                      {team.progress.projectName}
                    </p>
                  </div>
                )}

                {/* Members */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700">Team Members</span>
                    <span className="text-xs text-gray-500">
                      {team.members.length}/{team.maxMembers}
                    </span>
                  </div>
                  
                  <div className="flex -space-x-2">
                    {(team.members || []).slice(0, 6).map((member, idx) => (
                      <img
                        key={member.id || idx}
                        className="inline-block h-8 w-8 rounded-full ring-2 ring-white"
                        src={member.user?.profilePicture || `https://ui-avatars.com/api/?name=${encodeURIComponent(member.user?.fullName || member.user?.email || 'U')}`}
                        alt={member.user?.fullName || 'Member'}
                        title={`${member.user?.fullName || member.user?.email || ''}${member.role ? ' • ' + member.role : ''}`}
                      />
                    ))}
                    {(team.members || []).length > 6 && (
                      <span className="inline-flex items-center justify-center h-8 w-8 rounded-full bg-gray-100 text-gray-600 text-xs ring-2 ring-white">
                        +{(team.members || []).length - 6}
                      </span>
                    )}
                  </div>
                </div>

                {/* Team Actions */}
                <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                  <div className="flex items-center space-x-2 text-sm text-gray-500">
                    <CalendarIcon className="h-4 w-4" />
                    <span>Created {format(new Date(team.createdAt), 'MMM dd')}</span>
                  </div>
                  
                  <div className="flex space-x-2">
                    <button 
                      className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleTeamClick(team);
                      }}
                    >
                      <ChatBubbleLeftRightIcon className="h-4 w-4" />
                    </button>
                    <button 
                      className="p-2 text-gray-400 hover:text-red-600 transition-colors disabled:opacity-50"
                      onClick={(e) => handleDeleteTeam(team.id, e)}
                      disabled={isDeleting}
                    >
                      <TrashIcon className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <UserGroupIcon className="h-12 w-12 mx-auto text-gray-300 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No teams yet</h3>
          <p className="text-gray-600 mb-6">Create a team or join an existing one to get started</p>
          <div className="flex justify-center space-x-3">
            <button
              onClick={() => setShowJoinModal(true)}
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors"
            >
              <UserPlusIcon className="h-4 w-4 mr-2" />
              Join Team
            </button>
          </div>
        </div>
      )}

      {/* Modals */}
      <CreateTeamModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onTeamCreated={handleTeamUpdate}
      />
      
      <JoinTeamModal
        isOpen={showJoinModal}
        onClose={() => setShowJoinModal(false)}
        onTeamJoined={handleTeamUpdate}
      />
      
      {selectedTeam && (
        <TeamDetailsModal
          team={selectedTeam}
          isOpen={showTeamDetails}
          onClose={closeTeamDetails}
        />
      )}
    </div>
  );
};

export default TeamsList;
