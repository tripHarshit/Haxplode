import React, { useState } from 'react';
import { 
  MagnifyingGlassIcon, 
  PlusIcon,
  UserPlusIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline';
import { mockJudges } from '../../utils/organizerMockData';
import { judgeService } from '../../services/judgeService';
import { toast } from 'react-toastify';

const JudgeManagement = ({ eventId, onJudgesUpdate }) => {
  const [judges] = useState(mockJudges);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddJudge, setShowAddJudge] = useState(false);
  const [loading, setLoading] = useState(false);

  const filteredJudges = judges.filter(judge =>
    judge.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    judge.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
    judge.expertise.some(exp => exp.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const getWorkloadColor = (workload) => {
    if (workload >= 80) return 'text-red-600';
    if (workload >= 60) return 'text-yellow-600';
    return 'text-green-600';
  };

  const getRatingColor = (rating) => {
    if (rating >= 4.5) return 'text-green-600';
    if (rating >= 4.0) return 'text-yellow-600';
    return 'text-red-600';
  };

  const handleAssignSubmissionsToJudges = async () => {
    try {
      setLoading(true);
      await judgeService.assignSubmissionsToJudges(eventId);
      
      // Show success message
      toast.success('Submissions assigned to judges successfully!');
      
      // Refresh judges list
      if (onJudgesUpdate) {
        onJudgesUpdate();
      }
    } catch (error) {
      console.error('Error assigning submissions to judges:', error);
      toast.error(error.response?.data?.message || 'Failed to assign submissions to judges');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header with Actions */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Judge Management</h2>
          <p className="text-gray-600 dark:text-gray-400">Manage judges and their assignments for this event</p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={handleAssignSubmissionsToJudges}
            disabled={loading || judges.length === 0}
            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Assigning...' : 'Assign Submissions to Judges'}
          </button>
          <button
            onClick={() => setShowAddJudge(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Add Judge
          </button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <ChartBarIcon className="h-8 w-8 text-blue-600" />
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 truncate">Total Judges</dt>
                <dd className="text-lg font-medium text-gray-900">{judges.length}</dd>
              </dl>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <ChartBarIcon className="h-8 w-8 text-green-600" />
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 truncate">Active Judges</dt>
                <dd className="text-lg font-medium text-gray-900">
                  {judges.filter(j => j.status === 'active').length}
                </dd>
              </dl>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <ChartBarIcon className="h-8 w-8 text-purple-600" />
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 truncate">Avg Rating</dt>
                <dd className="text-lg font-medium text-gray-900">
                  {(judges.reduce((sum, j) => sum + j.rating, 0) / judges.length).toFixed(1)}
                </dd>
              </dl>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <ChartBarIcon className="h-8 w-8 text-orange-600" />
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 truncate">Avg Workload</dt>
                <dd className="text-lg font-medium text-gray-900">
                  {Math.round(judges.reduce((sum, j) => sum + j.workload, 0) / judges.length)}%
                </dd>
              </dl>
            </div>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="flex-1">
        <div className="relative">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search judges by name, company, or expertise..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Judges List */}
      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <ul className="divide-y divide-gray-200">
          {filteredJudges.map((judge) => (
            <li key={judge.id}>
              <div className="px-4 py-4 sm:px-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <img
                      className="h-12 w-12 rounded-full"
                      src={judge.avatar}
                      alt={judge.name}
                    />
                    
                    <div>
                      <h3 className="text-lg font-medium text-gray-900">{judge.name}</h3>
                      <p className="text-sm text-gray-500">{judge.role} at {judge.company}</p>
                      <p className="text-xs text-gray-400">{judge.bio}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-6">
                    <div className="text-right">
                      <div className="flex items-center space-x-2">
                        <span className="text-sm text-gray-500">Rating:</span>
                        <span className={`text-sm font-medium ${getRatingColor(judge.rating)}`}>
                          {judge.rating}/5.0
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm text-gray-500">Workload:</span>
                        <span className={`text-sm font-medium ${getWorkloadColor(judge.workload)}`}>
                          {judge.workload}%
                        </span>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <p className="text-sm font-medium text-gray-900">{judge.reviewsCompleted} reviews</p>
                      <p className="text-xs text-gray-500">Avg: {judge.averageScore}/10</p>
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
                
                <div className="mt-4">
                  <div className="flex flex-wrap gap-2">
                    {judge.expertise.map((exp, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                      >
                        {exp}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div>
                    <span className="text-gray-500">Events:</span>
                    <span className="ml-2 font-medium text-gray-900">{judge.events.length}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Rounds:</span>
                    <span className="ml-2 font-medium text-gray-900">{judge.rounds.length}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Contact:</span>
                    <span className="ml-2 font-medium text-gray-900">{judge.phone}</span>
                  </div>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>

      {/* Add Judge Modal Placeholder */}
      {showAddJudge && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">Add New Judge</h3>
              <button
                onClick={() => setShowAddJudge(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ×
              </button>
            </div>
            
            <div className="text-center py-8">
              <UserPlusIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Add Judge Form</h3>
              <p className="text-gray-500">Judge creation form will be implemented here</p>
            </div>
            
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowAddJudge(false)}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700">
                Add Judge
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default JudgeManagement;
