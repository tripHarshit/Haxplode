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
  FlagIcon
} from '@heroicons/react/24/outline';
import { format } from 'date-fns';

const AssignedSubmissions = ({ submissions, onViewSubmission, onStartReview }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [viewMode, setViewMode] = useState('cards'); // 'cards' or 'table'

  const filteredSubmissions = useMemo(() => {
    return submissions.filter(submission => {
      const matchesSearch = submission.projectTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           submission.teamName.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = statusFilter === 'all' || submission.reviewStatus === statusFilter;
      const matchesPriority = priorityFilter === 'all' || submission.priority === priorityFilter;
      
      return matchesSearch && matchesStatus && matchesPriority;
    });
  }, [submissions, searchTerm, statusFilter, priorityFilter]);

  const getStatusColor = (status) => {
    switch (status) {
      case 'assigned': return 'bg-blue-100 text-blue-800';
      case 'in_progress': return 'bg-yellow-100 text-yellow-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'flagged': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'assigned': return <ClockIcon className="h-4 w-4" />;
      case 'in_progress': return <PlayIcon className="h-4 w-4" />;
      case 'completed': return <CheckCircleIcon className="h-4 w-4" />;
      case 'flagged': return <FlagIcon className="h-4 w-4" />;
      default: return <ClockIcon className="h-4 w-4" />;
    }
  };

  const getDaysUntilDeadline = (deadline) => {
    const now = new Date();
    const deadlineDate = new Date(deadline);
    const diffTime = deadlineDate - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  return (
    <div className="space-y-6">
      {/* Header with Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative">
          <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500" />
          <input
            type="text"
            placeholder="Search by project title or team name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-700 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500"
          />
        </div>
        
        <div className="flex gap-2">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
          >
            <option value="all">All Status</option>
            <option value="assigned">Assigned</option>
            <option value="in_progress">In Progress</option>
            <option value="completed">Completed</option>
            <option value="flagged">Flagged</option>
          </select>
          
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
          >
            <option value="all">All Priority</option>
            <option value="urgent">Urgent</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>

          <div className="flex border border-gray-300 dark:border-gray-700 rounded-md">
            <button
              onClick={() => setViewMode('cards')}
              className={`px-3 py-2 text-sm font-medium ${
                viewMode === 'cards' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700'
              }`}
            >
              Cards
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`px-3 py-2 text-sm font-medium ${
                viewMode === 'table' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700'
              }`}
            >
              Table
            </button>
          </div>
        </div>
      </div>

      {/* Results Count */}
      <div className="text-sm text-gray-600 dark:text-gray-300">
        Showing {filteredSubmissions.length} of {submissions.length} submissions
      </div>

      {/* Submissions Display */}
      {viewMode === 'cards' ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredSubmissions.map((submission) => (
            <SubmissionCard
              key={submission.id}
              submission={submission}
              onViewSubmission={onViewSubmission}
              onStartReview={onStartReview}
              getStatusColor={getStatusColor}
              getPriorityColor={getPriorityColor}
              getStatusIcon={getStatusIcon}
              getDaysUntilDeadline={getDaysUntilDeadline}
            />
          ))}
        </div>
      ) : (
        <SubmissionTable
          submissions={filteredSubmissions}
          onViewSubmission={onViewSubmission}
          onStartReview={onStartReview}
          getStatusColor={getStatusColor}
          getPriorityColor={getPriorityColor}
          getStatusIcon={getStatusIcon}
          getDaysUntilDeadline={getDaysUntilDeadline}
        />
      )}

      {filteredSubmissions.length === 0 && (
        <div className="text-center py-12">
          <DocumentTextIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No submissions found</h3>
          <p className="text-gray-500">Try adjusting your search or filter criteria</p>
        </div>
      )}
    </div>
  );
};

// Submission Card Component
const SubmissionCard = ({ submission, onViewSubmission, onStartReview, getStatusColor, getPriorityColor, getStatusIcon, getDaysUntilDeadline }) => {
  const daysUntilDeadline = getDaysUntilDeadline(submission.deadline);
  const isDeadlineUrgent = daysUntilDeadline <= 2;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-shadow duration-200">
      {/* Header */}
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-start justify-between mb-3">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 line-clamp-2">{submission.projectTitle}</h3>
          <div className="flex items-center space-x-2">
            {submission.isUrgent && (
              <ExclamationTriangleIcon className="h-5 w-5 text-red-500" title="Urgent" />
            )}
            {isDeadlineUrgent && (
              <ClockIcon className="h-5 w-5 text-orange-500" title="Deadline approaching" />
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

        <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2 mb-3">{submission.description}</p>
        
        <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
          <span>Team: {submission.teamName}</span>
          <span>{format(new Date(submission.submissionDate), 'MMM dd, yyyy')}</span>
        </div>
      </div>

      {/* Technologies */}
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

      {/* Quick Actions */}
      <div className="p-6">
        <div className="flex items-center justify-between mb-3">
          <div className="text-sm text-gray-600 dark:text-gray-300">
            {submission.timeSpent > 0 ? (
              <span>Time spent: {Math.floor(submission.timeSpent / 60)}h {submission.timeSpent % 60}m</span>
            ) : (
              <span>Not started</span>
            )}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-300">
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
            className="flex-1 px-3 py-2 text-sm font-medium text-blue-600 border border-blue-600 rounded-md hover:bg-blue-50 dark:hover:bg-blue-900/30"
          >
            <EyeIcon className="h-4 w-4 inline mr-1" />
            View Details
          </button>
          
          {submission.reviewStatus !== 'completed' && (
            <button
              onClick={() => onStartReview(submission)}
              className="flex-1 px-3 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
            >
              {submission.reviewStatus === 'in_progress' ? 'Continue Review' : 'Start Review'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

// Submission Table Component
const SubmissionTable = ({ submissions, onViewSubmission, onStartReview, getStatusColor, getPriorityColor, getStatusIcon, getDaysUntilDeadline }) => {
  return (
    <div className="bg-white dark:bg-gray-800 shadow overflow-hidden sm:rounded-md">
      <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
        <thead className="bg-gray-50 dark:bg-gray-700">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
              Project
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
              Team
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
              Status
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
              Priority
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
              Deadline
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
              Time Spent
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
          {submissions.map((submission) => {
            const daysUntilDeadline = getDaysUntilDeadline(submission.deadline);
            return (
              <tr key={submission.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div>
                    <div className="text-sm font-medium text-gray-900 dark:text-gray-100">{submission.projectTitle}</div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">{submission.eventTitle}</div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
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
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                  <div>
                    <div>{format(new Date(submission.deadline), 'MMM dd, yyyy')}</div>
                    <div className={`text-xs ${daysUntilDeadline <= 2 ? 'text-red-600' : 'text-gray-500 dark:text-gray-400'}`}>
                      {daysUntilDeadline > 0 ? `${daysUntilDeadline} day${daysUntilDeadline !== 1 ? 's' : ''} left` : 'Overdue'}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                  {submission.timeSpent > 0 ? (
                    <span>{Math.floor(submission.timeSpent / 60)}h {submission.timeSpent % 60}m</span>
                  ) : (
                    <span className="text-gray-400 dark:text-gray-500">Not started</span>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div className="flex space-x-2">
                    <button
                      onClick={() => onViewSubmission(submission)}
                      className="text-blue-600 hover:text-blue-900 dark:hover:text-blue-400"
                    >
                      View
                    </button>
                    {submission.reviewStatus !== 'completed' && (
                      <button
                        onClick={() => onStartReview(submission)}
                        className="text-green-600 hover:text-green-900 dark:hover:text-green-400"
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

