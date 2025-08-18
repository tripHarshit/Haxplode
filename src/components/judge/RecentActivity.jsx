import React from 'react';
import { format } from 'date-fns';

const RecentActivity = ({ activities }) => {
  const getActivityIcon = (type) => {
    switch (type) {
      case 'review_submitted':
        return '✅';
      case 'assignment_received':
        return '📋';
      case 'deadline_approaching':
        return '⏰';
      case 'review_in_progress':
        return '📝';
      default:
        return '📌';
    }
  };

  const getActivityColor = (type) => {
    switch (type) {
      case 'review_submitted':
        return 'bg-green-100 text-green-800';
      case 'assignment_received':
        return 'bg-blue-100 text-blue-800';
      case 'deadline_approaching':
        return 'bg-orange-100 text-orange-800';
      case 'review_in_progress':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md border border-gray-200">
      <div className="px-6 py-4 border-b border-gray-200">
        <h3 className="text-lg font-medium text-gray-900">Recent Activity</h3>
      </div>
      
      <div className="p-6">
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
                        <span className="text-sm">{getActivityIcon(activity.type)}</span>
                      </span>
                    </div>
                    <div className="min-w-0 flex-1 pt-1.5 flex justify-between space-x-4">
                      <div>
                        <p className="text-sm text-gray-900">{activity.title}</p>
                        <p className="text-sm text-gray-500">{activity.description}</p>
                      </div>
                      <div className="text-right text-sm whitespace-nowrap text-gray-500">
                        <time dateTime={activity.timestamp}>
                          {format(new Date(activity.timestamp), 'MMM dd, yyyy')}
                        </time>
                        <div className="text-xs">
                          {format(new Date(activity.timestamp), 'HH:mm')}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
        
        {activities.length === 0 && (
          <div className="text-center py-8">
            <p className="text-gray-500">No recent activity</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default RecentActivity;

