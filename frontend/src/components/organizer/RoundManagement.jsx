import React, { useState } from 'react';
import { 
  PlusIcon,
  PlayIcon,
  PauseIcon,
  StopIcon,
  PencilIcon,
  TrashIcon,
  EyeIcon,
  UserGroupIcon
} from '@heroicons/react/24/outline';
import { mockRounds, mockJudges } from '../../utils/organizerMockData';

const RoundManagement = () => {
  const [rounds] = useState(mockRounds);
  const [judges] = useState(mockJudges);
  const [showAddRound, setShowAddRound] = useState(false);

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'upcoming': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-gray-100 text-gray-800';
      case 'paused': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'active': return '🟢';
      case 'upcoming': return '🔵';
      case 'completed': return '⚪';
      case 'paused': return '🟡';
      default: return '⚪';
    }
  };

  const handleRoundAction = (roundId, action) => {
    console.log(`${action} round ${roundId}`);
    // Implement round control logic here
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Round Management</h2>
          <p className="text-gray-600">Manage judging rounds, criteria, and progression</p>
        </div>
        <button
          onClick={() => setShowAddRound(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 flex items-center space-x-2"
        >
          <PlusIcon className="h-4 w-4" />
          <span>Add Round</span>
        </button>
      </div>

      {/* Rounds Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{rounds.length}</div>
            <div className="text-sm text-gray-500">Total Rounds</div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">
              {rounds.filter(r => r.status === 'active').length}
            </div>
            <div className="text-sm text-gray-500">Active Rounds</div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">
              {rounds.filter(r => r.status === 'upcoming').length}
            </div>
            <div className="text-sm text-gray-500">Upcoming Rounds</div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-600">
              {rounds.filter(r => r.status === 'completed').length}
            </div>
            <div className="text-sm text-gray-500">Completed Rounds</div>
          </div>
        </div>
      </div>

      {/* Rounds List */}
      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <ul className="divide-y divide-gray-200">
          {rounds.map((round) => (
            <li key={round.id}>
              <div className="px-4 py-4 sm:px-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <span className="text-2xl">{getStatusIcon(round.status)}</span>
                    
                    <div>
                      <h3 className="text-lg font-medium text-gray-900">{round.name}</h3>
                      <p className="text-sm text-gray-500">{round.description}</p>
                      <p className="text-xs text-gray-400">{round.eventTitle}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(round.status)}`}>
                      {round.status}
                    </span>
                    
                    <div className="text-right">
                      <p className="text-sm font-medium text-gray-900">{round.submissions} submissions</p>
                      <p className="text-xs text-gray-500">{round.reviewed} reviewed</p>
                    </div>
                  </div>
                </div>
                
                {/* Round Details */}
                <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <span className="text-sm text-gray-500">Start:</span>
                    <span className="ml-2 text-sm font-medium text-gray-900">
                      {new Date(round.startDate).toLocaleDateString()}
                    </span>
                  </div>
                  <div>
                    <span className="text-sm text-gray-500">End:</span>
                    <span className="ml-2 text-sm font-medium text-gray-900">
                      {new Date(round.endDate).toLocaleDateString()}
                    </span>
                  </div>
                  <div>
                    <span className="text-sm text-gray-500">Judges:</span>
                    <span className="ml-2 text-sm font-medium text-gray-900">
                      {round.judges.length} assigned
                    </span>
                  </div>
                </div>

                {/* Judging Criteria */}
                {round.criteria && round.criteria.length > 0 && (
                  <div className="mt-4">
                    <h4 className="text-sm font-medium text-gray-900 mb-2">Judging Criteria</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {round.criteria.map((criterion, index) => (
                        <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                          <span className="text-sm text-gray-700">{criterion.name}</span>
                          <span className="text-sm font-medium text-blue-600">{criterion.weight}%</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Round Controls */}
                <div className="mt-4 flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    {round.status === 'upcoming' && (
                      <button
                        onClick={() => handleRoundAction(round.id, 'start')}
                        className="px-3 py-1 bg-green-600 text-white text-xs rounded hover:bg-green-700 flex items-center space-x-1"
                      >
                        <PlayIcon className="h-3 w-3" />
                        <span>Start</span>
                      </button>
                    )}
                    
                    {round.status === 'active' && (
                      <>
                        <button
                          onClick={() => handleRoundAction(round.id, 'pause')}
                          className="px-3 py-1 bg-yellow-600 text-white text-xs rounded hover:bg-yellow-700 flex items-center space-x-1"
                        >
                          <PauseIcon className="h-3 w-3" />
                          <span>Pause</span>
                        </button>
                        <button
                          onClick={() => handleRoundAction(round.id, 'end')}
                          className="px-3 py-1 bg-red-600 text-white text-xs rounded hover:bg-red-700 flex items-center space-x-1"
                        >
                          <StopIcon className="h-3 w-3" />
                          <span>End</span>
                        </button>
                      </>
                    )}
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <button className="p-1 text-gray-400 hover:text-gray-600">
                      <EyeIcon className="h-4 w-4" />
                    </button>
                    <button className="p-1 text-gray-400 hover:text-gray-600">
                      <PencilIcon className="h-4 w-4" />
                    </button>
                    <button className="p-1 text-red-400 hover:text-red-600">
                      <TrashIcon className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>

      {/* Add Round Modal Placeholder */}
      {showAddRound && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">Add New Round</h3>
              <button
                onClick={() => setShowAddRound(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ×
              </button>
            </div>
            
            <div className="text-center py-8">
              <PlusIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Add Round Form</h3>
              <p className="text-gray-500">Round creation form will be implemented here</p>
            </div>
            
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowAddRound(false)}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700">
                Add Round
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RoundManagement;
