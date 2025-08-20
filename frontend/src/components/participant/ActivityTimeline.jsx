import React from 'react';
import { formatDistanceToNow } from 'date-fns';

const ActivityTimeline = ({ activities }) => {
  const getActivityIcon = (type) => {
    const iconMap = {
      event_registration: '🎯',
      team_creation: '👥',
      team_join: '➕',
      submission_update: '📝',
      project_submission: '🚀',
      award_won: '🏆',
      deadline_missed: '⏰',
      team_invitation: '📧',
    };
    return iconMap[type] || '📌';
  };

  const getActivityColor = (type) => {
    const colorMap = {
      event_registration: 'bg-blue-100 text-blue-800',
      team_creation: 'bg-green-100 text-green-800',
      team_join: 'bg-purple-100 text-purple-800',
      submission_update: 'bg-orange-100 text-orange-800',
      project_submission: 'bg-indigo-100 text-indigo-800',
      award_won: 'bg-yellow-100 text-yellow-800',
      deadline_missed: 'bg-red-100 text-red-800',
      team_invitation: 'bg-pink-100 text-pink-800',
    };
    return colorMap[type] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="flow-root">
      <ul className="-mb-8">
        {activities.map((activity, activityIdx) => (
          <li key={activity.id}>
            <div className="relative pb-8">
              {activityIdx !== activities.length - 1 ? (
                <span
                  className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200"
                  aria-hidden="true"
                />
              ) : null}
              <div className="relative flex space-x-3">
                <div>
                  <span className={`h-8 w-8 rounded-full flex items-center justify-center ring-8 ring-white ${getActivityColor(activity.type)}`}>
                    {getActivityIcon(activity.type)}
                  </span>
                </div>
                <div className="min-w-0 flex-1 pt-1.5 flex justify-between space-x-4">
                  <div>
                    <p className="text-sm text-gray-900 font-medium">{activity.title}</p>
                    <p className="text-sm text-gray-600">{activity.description}</p>
                  </div>
                  <div className="text-right text-sm whitespace-nowrap text-gray-500">
                    <time dateTime={activity.timestamp}>
                      {formatDistanceToNow(new Date(activity.timestamp), { addSuffix: true })}
                    </time>
                  </div>
                </div>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ActivityTimeline;
