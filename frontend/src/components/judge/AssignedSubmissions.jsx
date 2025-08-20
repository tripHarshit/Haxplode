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

      case 'assigned': return 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200';
      case 'in_progress': return 'bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-300';
      case 'completed': return 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-800 dark:text-emerald-300';
      case 'flagged': return 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300';
      default: return 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300';
      case 'high': return 'bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-300';
      case 'medium': return 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300';
      case 'low': return 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300';

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
          

          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="input"
          >
            <option value="all">All Priority</option>
            <option value="urgent">Urgent</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>

          <div className="flex border border-slate-300 dark:border-slate-700 rounded-md">

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

          <h3 className="text-lg font-semibold text-slate-900 dark:text-white line-clamp-2">{submission.projectTitle}</h3>
          <div className="flex items-center space-x-2">
            {submission.isUrgent && (
              <ExclamationTriangleIcon className="h-5 w-5 text-red-500" title="Urgent" />
            )}
            {isDeadlineUrgent && (
              <ClockIcon className="h-5 w-5 text-amber-500" title="Deadline approaching" />
            )}
          </div>
        </div>
        
        <div className="flex items-center space-x-2 mb-3">
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(submission.reviewStatus)}`}>
            <div className="flex items-center space-x-1">
              {getStatusIcon(submission.reviewStatus)}
              <span>{submission.reviewStatus.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}</span>
            </div>
          </span>
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(submission.priority)}`}>
            {submission.priority.charAt(0).toUpperCase() + submission.priority.slice(1)}
          </span>
        </div>

        <p className="text-sm text-slate-600 dark:text-slate-300 line-clamp-2 mb-3">{submission.description}</p>
        
        <div className="flex items-center justify-between text-sm text-slate-600 dark:text-slate-300">
          <span>Team: {submission.teamName}</span>

          <span>{format(new Date(submission.submissionDate), 'MMM dd, yyyy')}</span>
        </div>
      </div>

      {/* Technologies */}

      <div className="px-6 py-3 border-b border-slate-200 dark:border-slate-700">
        <div className="flex flex-wrap gap-1">
          {submission.technologies.slice(0, 4).map((tech, index) => (
            <span
              key={index}
              className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-100"
            >
              {tech}
            </span>
          ))}
          {submission.technologies.length > 4 && (
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-100">
              +{submission.technologies.length - 4} more

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

        <div className="flex items-center justify-between mb-3">
          <div className="text-sm text-slate-600 dark:text-slate-300">
            {submission.timeSpent > 0 ? (
              <span>Time spent: {Math.floor(submission.timeSpent / 60)}h {submission.timeSpent % 60}m</span>
            ) : (
              <span>Not started</span>
            )}
          </div>
          <div className="text-sm text-slate-600 dark:text-slate-300">
            {daysUntilDeadline > 0 ? (
              <span>{daysUntilDeadline} day{daysUntilDeadline !== 1 ? 's' : ''} left</span>
            ) : (
              <span className="text-red-600 font-medium">Overdue</span>
            )}
          </div>
        </div>


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

            <th className="px-6 py-3 text-left text-xs font-medium text-slate-600 dark:text-slate-300 uppercase tracking-wider">
              Priority
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-slate-600 dark:text-slate-300 uppercase tracking-wider">
              Deadline
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-slate-600 dark:text-slate-300 uppercase tracking-wider">
              Time Spent

            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-slate-600 dark:text-slate-300 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>

        <tbody className="bg-white dark:bg-slate-800 divide-y divide-slate-200 dark:divide-slate-700">
          {submissions.map((submission) => {
            const daysUntilDeadline = getDaysUntilDeadline(submission.deadline);
            return (
              <tr key={submission.id} className="hover:bg-slate-50 dark:hover:bg-slate-700">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div>
                    <div className="text-sm font-medium text-slate-900 dark:text-white">{submission.projectTitle}</div>
                    <div className="text-sm text-slate-600 dark:text-slate-300">{submission.eventTitle}</div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900 dark:text-white">
                  {submission.teamName}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(submission.reviewStatus)}`}>
                    {getStatusIcon(submission.reviewStatus)}
                    <span className="ml-1">{submission.reviewStatus.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}</span>
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(submission.priority)}`}>
                    {submission.priority.charAt(0).toUpperCase() + submission.priority.slice(1)}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900 dark:text-white">
                  <div>
                    <div>{format(new Date(submission.deadline), 'MMM dd, yyyy')}</div>
                    <div className={`text-xs ${daysUntilDeadline <= 2 ? 'text-red-600' : 'text-slate-600 dark:text-slate-300'}`}>
                      {daysUntilDeadline > 0 ? `${daysUntilDeadline} day${daysUntilDeadline !== 1 ? 's' : ''} left` : 'Overdue'}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900 dark:text-white">
                  {submission.timeSpent > 0 ? (
                    <span>{Math.floor(submission.timeSpent / 60)}h {submission.timeSpent % 60}m</span>
                  ) : (
                    <span className="text-slate-400 dark:text-slate-500">Not started</span>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div className="flex space-x-2">
                    <button
                      onClick={() => onViewSubmission(submission)}
                      className="text-emerald-600 hover:text-emerald-800 dark:hover:text-emerald-400"

                    >
                      Review
                    </button>

                    {submission.reviewStatus !== 'completed' && (
                      <button
                        onClick={() => onStartReview(submission)}
                        className="text-emerald-600 hover:text-emerald-800 dark:hover:text-emerald-400"
                      >
                        {submission.reviewStatus === 'in_progress' ? 'Continue' : 'Review'}
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            );
          })}

        </tbody>
      </table>
    </div>
  );
};

export default AssignedSubmissions;

