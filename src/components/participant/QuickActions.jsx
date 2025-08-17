import React from 'react';
import { 
  PlusIcon, 
  MagnifyingGlassIcon, 
  UserGroupIcon, 
  RocketLaunchIcon,
  CalendarIcon,
  DocumentTextIcon
} from '@heroicons/react/24/outline';

const QuickActions = () => {
  const actions = [
    {
      id: 'browse-events',
      title: 'Browse Events',
      description: 'Discover new hackathons and challenges',
      icon: MagnifyingGlassIcon,
      color: 'bg-blue-500 hover:bg-blue-600',
      href: '#events'
    },
    {
      id: 'create-team',
      title: 'Create Team',
      description: 'Form a new team for upcoming events',
      icon: UserGroupIcon,
      color: 'bg-green-500 hover:bg-green-600',
      href: '#teams'
    },
    {
      id: 'join-team',
      title: 'Join Team',
      description: 'Join an existing team with invitation code',
      icon: PlusIcon,
      color: 'bg-purple-500 hover:bg-purple-600',
      href: '#teams'
    },
    {
      id: 'submit-project',
      title: 'Submit Project',
      description: 'Submit your project for active events',
      icon: RocketLaunchIcon,
      color: 'bg-orange-500 hover:bg-orange-600',
      href: '#submissions'
    },
    {
      id: 'view-schedule',
      title: 'View Schedule',
      description: 'Check your upcoming event schedule',
      icon: CalendarIcon,
      color: 'bg-indigo-500 hover:bg-indigo-600',
      href: '#schedule'
    },
    {
      id: 'manage-submissions',
      title: 'Manage Submissions',
      description: 'View and edit your project submissions',
      icon: DocumentTextIcon,
      color: 'bg-pink-500 hover:bg-pink-600',
      href: '#submissions'
    }
  ];

  const handleActionClick = (action) => {
    // In a real app, this would navigate to the appropriate section or open modals
    console.log(`Action clicked: ${action.title}`);
    
    // For demo purposes, scroll to the appropriate tab
    if (action.href) {
      const element = document.querySelector(action.href);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
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
              className={`${action.color} text-white p-4 rounded-lg text-left transition-all duration-200 transform hover:scale-105 hover:shadow-lg group`}
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
