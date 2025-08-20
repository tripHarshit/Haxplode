import React, { useState } from 'react';
import { 
  PlusIcon, 
  MagnifyingGlassIcon, 
  UserGroupIcon, 
  RocketLaunchIcon,
  DocumentTextIcon
} from '@heroicons/react/24/outline';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';

const QuickActions = ({ onActionClick }) => {
  const { user } = useAuth();
  const { showError } = useNotifications();
  const [isLoading, setIsLoading] = useState(false);

  const actions = [
    {
      id: 'browse-events',
      title: 'Browse Events',
      description: 'Discover new hackathons and challenges',
      icon: MagnifyingGlassIcon,
      color: 'bg-blue-500 hover:bg-blue-600',
      action: 'browse-events'
    },
    {
      id: 'join-team',
      title: 'Join Team',
      description: 'Join an existing team with invitation code',
      icon: PlusIcon,
      color: 'bg-purple-500 hover:bg-purple-600',
      action: 'join-team'
    },
    {
      id: 'submit-project',
      title: 'Submit Project',
      description: 'Submit your project for active events',
      icon: RocketLaunchIcon,
      color: 'bg-orange-500 hover:bg-orange-600',
      action: 'submit-project'
    },
    {
      id: 'manage-submissions',
      title: 'Manage Submissions',
      description: 'View and edit your project submissions',
      icon: DocumentTextIcon,
      color: 'bg-pink-500 hover:bg-pink-600',
      action: 'manage-submissions'
    }
  ];

  const handleActionClick = async (action) => {
    if (!user) {
      showError('Please log in to perform this action');
      return;
    }

    if (isLoading) return;

    setIsLoading(true);
    try {
      // Call the parent handler with the action
      if (onActionClick) {
        await onActionClick(action.action);
      }
    } catch (error) {
      showError('Failed to perform action. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border p-6">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Quick Actions</h3>
        <p className="text-sm text-gray-600">Get started quickly with these common tasks</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {actions.map((action) => {
          const Icon = action.icon;
          return (
            <button
              key={action.id}
              onClick={() => handleActionClick(action)}
              disabled={isLoading}
              className={`${action.color} text-white p-4 rounded-lg text-left transition-all duration-200 transform hover:scale-105 hover:shadow-lg group disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0">
                  <Icon className="h-6 w-6 text-white group-hover:scale-110 transition-transform" />
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-sm mb-1">{action.title}</h4>
                  <p className="text-xs text-blue-100 opacity-90">{action.description}</p>
                </div>
              </div>
            </button>
          );
        })}
      </div>
      
      <div className="mt-6 pt-6 border-t border-gray-200">
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-600">Need help getting started?</p>
          <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
            View Tutorial
          </button>
        </div>
      </div>
    </div>
  );
};

export default QuickActions;
