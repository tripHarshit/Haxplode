import React from 'react';
import { 
  AcademicCapIcon, 
  BuildingOfficeIcon, 
  ClockIcon,
  StarIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';
import { format } from 'date-fns';

const JudgeProfile = ({ profile, assignments }) => {
  const totalAssigned = assignments.reduce((sum, assignment) => sum + assignment.assignedSubmissions, 0);
  const totalCompleted = assignments.reduce((sum, assignment) => sum + assignment.completedReviews, 0);
  const totalPending = assignments.reduce((sum, assignment) => sum + assignment.pendingReviews, 0);
  const completionPercentage = totalAssigned > 0 ? Math.round((totalCompleted / totalAssigned) * 100) : 0;

  return (
    <div className="bg-white rounded-lg shadow-md border border-gray-200">
      {/* Profile Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-start space-x-4">
          <div className="flex-shrink-0">
            <img
              className="h-16 w-16 rounded-full object-cover"
              src={profile.avatar}
              alt={profile.name}
            />
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-2xl font-bold text-gray-900">{profile.name}</h2>
            <p className="text-gray-600">{profile.position}</p>
            <p className="text-gray-500 text-sm">{profile.organization}</p>
            
            <div className="mt-3 flex flex-wrap gap-2">
              {profile.expertise.map((skill, index) => (
                <span
                  key={index}
                  className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>
          
          <div className="flex-shrink-0 text-right">
            <div className="flex items-center space-x-1 text-green-600">
              <CheckCircleIcon className="h-5 w-5" />
              <span className="text-sm font-medium">Active</span>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Last active {format(new Date(profile.lastActive), 'MMM dd, yyyy')}
            </p>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Quick Overview</h3>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{totalAssigned}</div>
            <div className="text-xs text-gray-500">Assigned</div>
          </div>
          
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{totalCompleted}</div>
            <div className="text-xs text-gray-500">Completed</div>
          </div>
          
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-600">{totalPending}</div>
            <div className="text-xs text-gray-500">Pending</div>
          </div>
          
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">{profile.totalReviews}</div>
            <div className="text-xs text-gray-500">Total Reviews</div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mt-6">
          <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
            <span>Overall Progress</span>
            <span>{completionPercentage}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${completionPercentage}%` }}
            ></div>
          </div>
        </div>

        {/* Performance Metrics */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex items-center space-x-3">
            <div className="flex-shrink-0">
              <StarIcon className="h-5 w-5 text-yellow-500" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900">{profile.averageScore}</p>
              <p className="text-xs text-gray-500">Average Score</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <div className="flex-shrink-0">
              <CheckCircleIcon className="h-5 w-5 text-green-500" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900">{profile.reviewAccuracy}%</p>
              <p className="text-xs text-gray-500">Review Accuracy</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <div className="flex-shrink-0">
              <ClockIcon className="h-5 w-5 text-blue-500" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900">{profile.experience}</p>
              <p className="text-xs text-gray-500">Experience</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default JudgeProfile;
