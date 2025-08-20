import React from 'react';
import { CheckCircleIcon } from '@heroicons/react/24/outline';

const JudgeProfile = ({ profile, assignments }) => {
  const totalAssigned = assignments.reduce((sum, assignment) => sum + assignment.assignedSubmissions, 0);
  const totalCompleted = assignments.reduce((sum, assignment) => sum + assignment.completedReviews, 0);
  const totalPending = assignments.reduce((sum, assignment) => sum + assignment.pendingReviews, 0);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700">
      {/* Profile Header */}
      <div className="p-6">
        <div className="flex items-center space-x-4">
          <div className="flex-shrink-0">
            <img
              className="h-16 w-16 rounded-full object-cover ring-2 ring-gray-200 dark:ring-gray-600"
              src={profile.avatar}
              alt={profile.name}
            />
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">{profile.name}</h2>
            <p className="text-gray-600 dark:text-gray-300 text-sm">{profile.position}</p>
            <p className="text-gray-500 dark:text-gray-400 text-sm">{profile.organization}</p>
            
            {profile.expertise && profile.expertise.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-2">
                {profile.expertise.slice(0, 3).map((skill, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200"
                  >
                    {skill}
                  </span>
                ))}
                {profile.expertise.length > 3 && (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300">
                    +{profile.expertise.length - 3} more
                  </span>
                )}
              </div>
            )}
          </div>
          
          <div className="flex-shrink-0 text-right">
            <div className="flex items-center space-x-1 text-green-600 dark:text-green-400">
              <CheckCircleIcon className="h-4 w-4" />
              <span className="text-xs font-medium">Active</span>
            </div>
          </div>
        </div>
      </div>

      {/* Simple Stats */}
      <div className="px-6 pb-6">
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{totalAssigned}</div>
            <div className="text-xs text-gray-500 dark:text-gray-400">Assigned</div>
          </div>
          
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600 dark:text-green-400">{totalCompleted}</div>
            <div className="text-xs text-gray-500 dark:text-gray-400">Completed</div>
          </div>
          
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">{totalPending}</div>
            <div className="text-xs text-gray-500 dark:text-gray-400">Pending</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default JudgeProfile;

