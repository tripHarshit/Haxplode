import React from 'react';
import { formatDistanceToNow, format } from 'date-fns';
import { ClockIcon, ExclamationTriangleIcon, ExclamationCircleIcon, InformationCircleIcon } from '@heroicons/react/24/outline';

const DeadlinesList = ({ deadlines }) => {
  const getPriorityIcon = (priority) => {
    switch (priority) {
      case 'high':
        return <ExclamationTriangleIcon className="h-5 w-5 text-red-500" />;
      case 'medium':
        return <ExclamationCircleIcon className="h-5 w-5 text-yellow-500" />;
      case 'low':
        return <InformationCircleIcon className="h-5 w-5 text-blue-500" />;
      default:
        return <ClockIcon className="h-5 w-5 text-gray-500" />;
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high':
        return 'border-l-red-500 bg-red-50 dark:bg-red-900/10';
      case 'medium':
        return 'border-l-yellow-500 bg-yellow-50 dark:bg-yellow-900/10';
      case 'low':
        return 'border-l-blue-500 bg-blue-50 dark:bg-blue-900/10';
      default:
        return 'border-l-gray-500 bg-gray-700/30';
    }
  };

  const getTimeRemaining = (deadline) => {
    const now = new Date();
    const deadlineDate = new Date(deadline);
    const diff = deadlineDate - now;
    
    if (diff < 0) {
      return 'Overdue';
    }
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    
    if (days > 0) {
      return `${days}d ${hours}h remaining`;
    } else if (hours > 0) {
      return `${hours}h remaining`;
    } else {
      return 'Less than 1h remaining';
    }
  };

  const isUrgent = (deadline) => {
    const now = new Date();
    const deadlineDate = new Date(deadline);
    const diff = deadlineDate - now;
    const days = diff / (1000 * 60 * 60 * 24);
    return days <= 3;
  };

  return (
    <div className="space-y-4">
      {deadlines.map((deadline) => (
        <div
          key={deadline.id}
          className={`p-4 rounded-lg border-l-4 ${getPriorityColor(deadline.priority)} ${
            isUrgent(deadline.deadline) ? 'ring-2 ring-red-200' : ''
          }`}
        >
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center space-x-2 mb-2">
                {getPriorityIcon(deadline.priority)}
                <span className="text-sm font-medium text-slate-900 dark:text-white">
                  {deadline.title}
                </span>
              </div>
              <p className="text-sm text-slate-600 dark:text-slate-300 mb-2">
                {deadline.description}
              </p>
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-500 dark:text-slate-400">
                  {format(new Date(deadline.deadline), 'MMM dd, yyyy')}
                </span>
                <span className={`text-xs font-medium ${
                  isUrgent(deadline.deadline) ? 'text-red-600 dark:text-red-400' : 'text-slate-600 dark:text-slate-300'
                }`}>
                  {getTimeRemaining(deadline.deadline)}
                </span>
              </div>
            </div>
          </div>
        </div>
      ))}
      
      {deadlines.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <ClockIcon className="h-12 w-12 mx-auto text-gray-300 mb-4" />
          <p className="text-sm">No upcoming deadlines</p>
        </div>
      )}
    </div>
  );
};

export default DeadlinesList;
