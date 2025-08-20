import React, { useState, useMemo } from 'react';
import { 
  MagnifyingGlassIcon, 
  FunnelIcon,
  EyeIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  PlayIcon,
  DocumentTextIcon,
  FlagIcon,
  UserIcon,
  CheckBadgeIcon
} from '@heroicons/react/24/outline';
import { format } from 'date-fns';

const AssignedSubmissions = ({ submissions, onViewSubmission, onStartReview }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [viewMode, setViewMode] = useState('cards'); // 'cards' or 'table'

  const filteredSubmissions = useMemo(() => {
    return submissions.filter(submission => {
      const matchesSearch = submission.projectName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           submission.teamName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           submission.projectDescription?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = statusFilter === 'all' || submission.reviewStatus === statusFilter;
      
      return matchesSearch && matchesStatus;
    });
  }, [submissions, searchTerm, statusFilter]);

  const getStatusColor = (status) => {
    switch (status) {
      case 'assigned': return 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300';
      case 'reviewed': return 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300';
      default: return 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'assigned': return <UserIcon className="h-4 w-4" />;
      case 'reviewed': return <CheckBadgeIcon className="h-4 w-4" />;
      default: return <ClockIcon className="h-4 w-4" />;
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'assigned': return 'Assigned';
      case 'reviewed': return 'Reviewed';
      default: return 'Unknown';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header with Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative">
          <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 dark:text-slate-500" />
          <input
            type="text"
            placeholder="Search by project name, team name, or description..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input pl-10"
          />
        </div>
        
        <div className="flex gap-2">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="input"
          >
            <option value="all">All Status</option>
            <option value="assigned">Assigned</option>
            <option value="reviewed">Reviewed</option>
          </select>
          
          <div className="flex border border-gray-300 dark:border-gray-700 rounded-md">
            <button
              onClick={() => setViewMode('cards')}
              className={`px-3 py-2 text-sm font-medium ${
                viewMode === 'cards' 
                  ? 'bg-emerald-600 text-white' 
                  : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700'
              }`}
            >
              Cards
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`px-3 py-2 text-sm font-medium ${
                viewMode === 'table' 
                  ? 'bg-emerald-600 text-white' 
                  : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700'
              }`}
            >
              Table
            </button>
          </div>
        </div>
      </div>

      {/* Results Count */}
      <div className="text-sm text-slate-600 dark:text-slate-300">
        Showing {filteredSubmissions.length} of {submissions.length} submissions
      </div>

      {/* Submissions Display */}
      {viewMode === 'cards' ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredSubmissions.map((submission) => (
            <SubmissionCard
              key={submission._id || submission.id}
              submission={submission}
              onViewSubmission={onViewSubmission}
              onStartReview={onStartReview}
              getStatusColor={getStatusColor}
              getStatusIcon={getStatusIcon}
              getStatusText={getStatusText}
            />
          ))}
        </div>
      ) : (
        <SubmissionTable
          submissions={filteredSubmissions}
          onViewSubmission={onViewSubmission}
          onStartReview={onStartReview}
          getStatusColor={getStatusColor}
          getStatusIcon={getStatusIcon}
          getStatusText={getStatusText}
        />
      )}

      {filteredSubmissions.length === 0 && (
        <div className="text-center py-12">
          <DocumentTextIcon className="h-12 w-12 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">No submissions found</h3>
          <p className="text-gray-500 dark:text-gray-400">Try adjusting your search or filter criteria</p>
        </div>
      )}
    </div>
  );
};

// Submission Card Component
const SubmissionCard = ({ submission, onViewSubmission, onStartReview, getStatusColor, getStatusIcon, getStatusText }) => {
  return (
    <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 hover:shadow-md transition-shadow duration-200">
      {/* Header */}
      <div className="p-6 border-b border-slate-200 dark:border-slate-700">
        <div className="flex items-start justify-between mb-3">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 line-clamp-2">{submission.projectName}</h3>
          <div className="flex items-center space-x-2">
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(submission.reviewStatus)}`}>
              <div className="flex items-center space-x-1">
                {getStatusIcon(submission.reviewStatus)}
                <span>{getStatusText(submission.reviewStatus)}</span>
              </div>
            </span>
          </div>
        </div>
        
        <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2 mb-3">{submission.projectDescription}</p>
        
        <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
          <span>Team: {submission.teamName || 'Unknown Team'}</span>
          <span>{format(new Date(submission.submissionDate), 'MMM dd, yyyy')}</span>
        </div>
      </div>

      {/* Technologies */}
      {submission.technologies && submission.technologies.length > 0 && (
        <div className="px-6 py-3 border-b border-gray-200 dark:border-gray-700">
          <div className="flex flex-wrap gap-1">
            {submission.technologies.slice(0, 4).map((tech, index) => (
              <span
                key={index}
                className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-100"
              >
                {tech}
              </span>
            ))}
            {submission.technologies.length > 4 && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-100">
                +{submission.technologies.length - 4} more
              </span>
            )}
          </div>
        </div>
      )}

      {/* Review Info */}
      {submission.reviewStatus === 'reviewed' && (
        <div className="px-6 py-3 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600 dark:text-gray-300">Your Score:</span>
            <span className="font-semibold text-green-600 dark:text-green-400">
              {submission.judgeScore || 0}/100
            </span>
          </div>
          {submission.reviewedAt && (
            <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Reviewed on {format(new Date(submission.reviewedAt), 'MMM dd, yyyy HH:mm')}
            </div>
          )}
        </div>
      )}

      {/* Quick Actions */}
      <div className="p-6">

        <div className="flex space-x-2">
          <button
            onClick={() => onViewSubmission(submission)}
            className="flex-1 px-3 py-2 text-sm font-medium text-emerald-600 border border-emerald-600 rounded-md hover:bg-emerald-50 dark:hover:bg-emerald-900/30"
          >
            <EyeIcon className="h-4 w-4 inline mr-1" />
            View Details
          </button>
          
          {submission.reviewStatus === 'assigned' && (
            <button
              onClick={() => onStartReview(submission)}
              className="flex-1 px-3 py-2 text-sm font-medium text-white bg-emerald-600 rounded-md hover:bg-emerald-700"
            >
              Start Review
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

// Submission Table Component
const SubmissionTable = ({ submissions, onViewSubmission, onStartReview, getStatusColor, getStatusIcon, getStatusText }) => {
  return (
    <div className="bg-white dark:bg-slate-800 shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden sm:rounded-lg">
      <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
        <thead className="bg-slate-50 dark:bg-slate-700">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-slate-600 dark:text-slate-300 uppercase tracking-wider">
              Project
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-slate-600 dark:text-slate-300 uppercase tracking-wider">
              Team
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-slate-600 dark:text-slate-300 uppercase tracking-wider">
              Status
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
              Score
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
              Submitted
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-slate-600 dark:text-slate-300 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
          {submissions.map((submission) => (
            <tr key={submission._id || submission.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
              <td className="px-6 py-4 whitespace-nowrap">
                <div>
                  <div className="text-sm font-medium text-gray-900 dark:text-gray-100">{submission.projectName}</div>
                  <div className="text-sm text-gray-500 dark:text-gray-400 line-clamp-1">{submission.projectDescription}</div>
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                {submission.teamName || 'Unknown Team'}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(submission.reviewStatus)}`}>
                  {getStatusIcon(submission.reviewStatus)}
                  <span className="ml-1">{getStatusText(submission.reviewStatus)}</span>
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                {submission.reviewStatus === 'reviewed' ? (
                  <span className="font-semibold text-green-600 dark:text-green-400">
                    {submission.judgeScore || 0}/100
                  </span>
                ) : (
                  <span className="text-gray-400 dark:text-gray-500">-</span>
                )}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                {format(new Date(submission.submissionDate), 'MMM dd, yyyy')}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                <div className="flex space-x-2">
                  <button
                    onClick={() => onViewSubmission(submission)}
                    className="text-blue-600 hover:text-blue-900 dark:hover:text-blue-400"
                  >
                    View
                  </button>
                  {submission.reviewStatus === 'assigned' && (
                    <button
                      onClick={() => onStartReview(submission)}
                      className="text-green-600 hover:text-green-900 dark:hover:text-green-400"
                    >
                      Review
                    </button>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default AssignedSubmissions;

