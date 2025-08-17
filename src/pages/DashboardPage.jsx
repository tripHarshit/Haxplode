import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { 
  Calendar, 
  Trophy, 
  Users, 
  TrendingUp, 
  Code,
  ArrowRight
} from 'lucide-react';

const DashboardPage = () => {
  const { user, hasRole } = useAuth();
  const navigate = useNavigate();

  const getDashboardContent = () => {
    if (hasRole('participant')) {
      return {
        title: 'Participant Dashboard',
        description: 'Track your hackathon progress and manage your projects',
        stats: [
          { label: 'Active Hackathons', value: '3', icon: Calendar, color: 'primary' },
          { label: 'Projects Built', value: '7', icon: Code, color: 'secondary' },
          { label: 'Awards Won', value: '2', icon: Trophy, color: 'accent' },
          { label: 'Team Members', value: '12', icon: Users, color: 'success' },
        ],
        actions: [
          { label: 'Browse Hackathons', href: '/participant/hackathons', icon: Calendar },
          { label: 'My Submissions', href: '/participant/submissions', icon: Trophy },
          { label: 'Find Team', href: '/participant/teams', icon: Users },
        ]
      };
    } else if (hasRole('organizer')) {
      return {
        title: 'Organizer Dashboard',
        description: 'Manage your hackathons and track participant engagement',
        stats: [
          { label: 'Active Hackathons', value: '2', icon: Calendar, color: 'primary' },
          { label: 'Total Participants', value: '156', icon: Users, color: 'secondary' },
          { label: 'Submissions', value: '23', icon: Code, color: 'accent' },
          { label: 'Revenue', value: '$2.4K', icon: TrendingUp, color: 'success' },
        ],
        actions: [
          { label: 'My Hackathons', href: '/organizer', icon: Calendar },
          { label: 'Create New', href: '/organizer/create', icon: Calendar },
          { label: 'Analytics', href: '/organizer/analytics', icon: TrendingUp },
        ]
      };
    } else if (hasRole('judge')) {
      return {
        title: 'Judge Dashboard',
        description: 'Review submissions and provide feedback to participants',
        stats: [
          { label: 'Pending Reviews', value: '8', icon: Code, color: 'primary' },
          { label: 'Completed Reviews', value: '45', icon: Trophy, color: 'secondary' },
          { label: 'Hackathons Judged', value: '6', icon: Calendar, color: 'accent' },
          { label: 'Average Score', value: '8.7', icon: TrendingUp, color: 'success' },
        ],
        actions: [
          { label: 'Review Submissions', href: '/judge/submissions', icon: Code },
          { label: 'Judging Criteria', href: '/judge/criteria', icon: Trophy },
          { label: 'Past Reviews', href: '/judge/history', icon: Calendar },
        ]
      };
    }
    
    return {
      title: 'Dashboard',
      description: 'Welcome to Haxcode! Choose your role to get started.',
      stats: [],
      actions: [
        { label: 'Browse Hackathons', href: '/hackathons', icon: Calendar },
        { label: 'Create Account', href: '/register', icon: Users },
      ]
    };
  };

  const content = getDashboardContent();

  const getColorClasses = (color) => {
    const colors = {
      primary: 'bg-primary-100 text-primary-600',
      secondary: 'bg-secondary-100 text-secondary-600',
      accent: 'bg-accent-100 text-accent-600',
      success: 'bg-success-100 text-success-600',
    };
    return colors[color] || colors.primary;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-b border-neutral-200 pb-6">
        <h1 className="text-3xl font-bold text-neutral-900">{content.title}</h1>
        <p className="mt-2 text-lg text-neutral-600">{content.description}</p>
      </div>

      {/* Welcome Section */}
      <div className="card bg-gradient-to-r from-primary-50 to-secondary-50 border-primary-200">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-neutral-900">
              Welcome back, {user?.name}! 👋
            </h2>
            <p className="mt-1 text-neutral-600">
              Ready to build something amazing today?
            </p>
          </div>
          <div className="hidden sm:block">
            <div className="text-4xl">🚀</div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      {content.stats.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {content.stats.map((stat, index) => (
            <div key={index} className="card">
              <div className="flex items-center">
                <div className={`p-2 rounded-lg ${getColorClasses(stat.color)}`}>
                  <stat.icon className="h-6 w-6" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-neutral-600">{stat.label}</p>
                  <p className="text-2xl font-bold text-neutral-900">{stat.value}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Quick Actions */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-neutral-900">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {content.actions.map((action, index) => (
            <button
              key={index}
              onClick={() => navigate(action.href)}
              className="card-hover text-left p-6 hover:scale-105 transition-transform duration-200"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="p-2 rounded-lg bg-primary-100 text-primary-600">
                    <action.icon className="h-5 w-5" />
                  </div>
                  <span className="ml-3 font-medium text-neutral-900">{action.label}</span>
                </div>
                <ArrowRight className="h-5 w-5 text-neutral-400" />
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Recent Activity */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-neutral-900">Recent Activity</h3>
        <div className="card">
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <div className="w-2 h-2 bg-primary-500 rounded-full"></div>
              <span className="text-sm text-neutral-600">
                You registered for "AI Innovation Challenge 2024"
              </span>
              <span className="text-xs text-neutral-400 ml-auto">2 hours ago</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-2 h-2 bg-secondary-500 rounded-full"></div>
              <span className="text-sm text-neutral-600">
                Your team submitted "Smart City Solution" project
              </span>
              <span className="text-xs text-neutral-400 ml-auto">1 day ago</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-2 h-2 bg-accent-500 rounded-full"></div>
              <span className="text-sm text-neutral-600">
                You won 2nd place in "Web3 Hackathon"
              </span>
              <span className="text-xs text-neutral-400 ml-auto">3 days ago</span>
            </div>
          </div>
        </div>
      </div>

      {/* Upcoming Events */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-neutral-900">Upcoming Events</h3>
        <div className="card">
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-primary-50 rounded-lg">
              <div>
                <h4 className="font-medium text-neutral-900">AI Innovation Challenge</h4>
                <p className="text-sm text-neutral-600">Starts in 2 days</p>
              </div>
              <button className="btn-primary text-sm px-4 py-2">
                View Details
              </button>
            </div>
            <div className="flex items-center justify-between p-4 bg-secondary-50 rounded-lg">
              <div>
                <h4 className="font-medium text-neutral-900">Web3 Development Workshop</h4>
                <p className="text-sm text-neutral-600">Tomorrow at 2:00 PM</p>
              </div>
              <button className="btn-secondary text-sm px-4 py-2">
                Join
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
