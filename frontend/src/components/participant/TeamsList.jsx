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
import { participantService } from '../../services/participantService';

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

  const handleTeamUpdate = (newTeams) => {
    if (Array.isArray(newTeams)) {
      setCurrentTeams(newTeams);
    } else {
      setCurrentTeams((prev) => prev.filter(Boolean));
    }
  };

  const handleDeleteTeam = async (teamId, e) => {
    e.stopPropagation();
    
    if (!user) {
      showError('Please log in to delete teams');
      return;
    }

    // Optimistically decide whether this is a delete or a leave based on role in the team
    const team = currentTeams.find(t => String(t.id) === String(teamId));
    const membership = (team?.members || []).find(m => String(m.userId || m.id) === String(user?.id));
    const isLeader = membership?.role?.toLowerCase?.() === 'leader' || membership?.role === 'Team Lead';

    const confirmMsg = isLeader ? 'Delete this team? This cannot be undone.' : 'Leave this team?';
    if (!window.confirm(confirmMsg)) return;

    setIsDeleting(true);
    try {
      if (isLeader) {
        await participantService.deleteTeam(teamId);
        showSuccess('Team deleted');
      } else {
        await participantService.leaveTeam(teamId);
        showSuccess('Left team');
      }
      // Remove from local list
      handleTeamUpdate(currentTeams.filter(t => String(t.id) !== String(teamId)));
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
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Teams</h2>
          <p className="text-slate-600 dark:text-slate-300">Your registered hackathons and teams</p>
        </div>
        
        <div className="flex space-x-3">
          <button
            onClick={() => setShowJoinModal(true)}
            className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg text-sm font-medium text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors"
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
              className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6 hover:shadow-md transition-all duration-200 cursor-pointer transform hover:scale-[1.02]"
              onClick={() => handleTeamClick(team)}
            >
              <div className="space-y-4">
                {/* Team Header */}
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-1">{team.name}</h3>
                    <p className="text-sm text-slate-600 dark:text-slate-300 line-clamp-2">{team.description}</p>
                  </div>
                  <div className="flex items-center space-x-2 ml-4">
                    <button className="p-2 text-slate-400 hover:text-slate-600 dark:text-slate-400 dark:hover:text-slate-200 transition-colors">
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
                      <span className="text-slate-600 dark:text-slate-300">Project Progress</span>
                      <span className="font-medium text-slate-900 dark:text-white">{team.progress.completion}%</span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-slate-700 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full transition-all duration-300 ${getProgressColor(team.progress.completion)}`}
                        style={{ width: `${team.progress.completion}%` }}
                      ></div>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {team.progress.projectName}
                    </p>
                  </div>
                )}

                {/* Members */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Team Members</span>
                    <span className="text-xs text-slate-500 dark:text-slate-400">
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
                      <span className="inline-flex items-center justify-center h-8 w-8 rounded-full bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-slate-300 text-xs ring-2 ring-white dark:ring-slate-800">
                        +{(team.members || []).length - 6}
                      </span>
                    )}
                  </div>
                </div>

                {/* Team Actions */}
                <div className="flex items-center justify-between pt-3 border-t border-gray-100 dark:border-slate-700">
                  <div className="flex items-center space-x-2 text-sm text-slate-500 dark:text-slate-400">
                    <CalendarIcon className="h-4 w-4" />
                    <span>Created {format(new Date(team.createdAt), 'MMM dd')}</span>
                  </div>
                  
                  <div className="flex space-x-2">
                    <button 
                      className="p-2 text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleTeamClick(team);
                      }}
                    >
                      <ChatBubbleLeftRightIcon className="h-4 w-4" />
                    </button>
                    <button 
                      className="p-2 text-slate-400 hover:text-red-600 dark:hover:text-red-400 transition-colors disabled:opacity-50"
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
          <UserGroupIcon className="h-12 w-12 mx-auto text-gray-300 dark:text-slate-600 mb-4" />
          <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-2">No teams yet</h3>
          <p className="text-slate-600 dark:text-slate-300 mb-6">Create a team or join an existing one to get started</p>
          <div className="flex justify-center space-x-3">
            <button
              onClick={() => setShowJoinModal(true)}
              className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg text-sm font-medium text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors"
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
