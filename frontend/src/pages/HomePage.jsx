import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';
import ThemeToggle from '../components/ui/ThemeToggle';
import { 
  Code, 
  Users, 
  Trophy, 
  Calendar, 
  ArrowRight, 
  Sparkles,
  Zap,
  Target,
  Globe
} from 'lucide-react';

const HomePage = () => {
  const { isAuthenticated, user, getRedirectPath } = useAuth();
  const navigate = useNavigate();
  const { showWarning } = useNotifications();

  const features = [
    {
      icon: Code,
      title: 'Build Amazing Projects',
      description: 'Create innovative solutions with cutting-edge technologies and frameworks.',
    },
    {
      icon: Users,
      title: 'Collaborate & Network',
      description: 'Connect with developers, designers, and innovators from around the world.',
    },
    {
      icon: Trophy,
      title: 'Win Prizes',
      description: 'Compete for exciting prizes and recognition in your field.',
    },
    {
      icon: Calendar,
      title: 'Flexible Scheduling',
      description: 'Participate in hackathons that fit your schedule and interests.',
    },
  ];

  const stats = [
    { label: 'Active Hackathons', value: '25+' },
    { label: 'Participants', value: '10K+' },
    { label: 'Projects Built', value: '500+' },
    { label: 'Countries', value: '50+' },
  ];

  const handleDashboardNavigation = () => {
    if (user && user.roles) {
      const dashboardPath = getRedirectPath(user);
      navigate(dashboardPath);
    } else {
      navigate('/dashboard');
    }
  };

  const handleBrowseHackathons = () => {
    if (!isAuthenticated) {
      showWarning('You need to log in first to browse hackathons.');
      navigate('/login');
      return;
    }
    navigate('/participant/hackathons');
  };

  return (
    <div className="min-h-screen bg-white dark:bg-slate-700">
      {/* Navigation */}
      <nav className="relative z-50">
        <div className="mx-auto max-w-7xl px-6 lg:px-8 nav-glass rounded-2xl mt-4">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center">
              <h1 className="text-2xl font-black headline-gradient drop-shadow">Haxplode</h1>
            </div>
            <div className="flex items-center space-x-4">
              <ThemeToggle />
              {isAuthenticated ? (
                <>
                  <span className="text-slate-700 dark:text-white">Welcome, {user?.fullName || user?.name}!</span>
                  <button
                    onClick={handleDashboardNavigation}
                    className="btn-primary"
                  >
                    Go to Dashboard
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/login"
                    className="btn-ghost-invert"
                  >
                    Sign In
                  </Link>
                  <Link
                    to="/register"
                    className="btn-primary animate-pulse"
                  >
                    Get Started
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 lg:py-32 hero-gradient hero-animated-bg shadow-2xl">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="text-center">
            <div className="flex items-center justify-center mb-6 animate-float">
              <Sparkles className="h-8 w-8 text-emerald-400 mr-2 drop-shadow" />
              <span className="font-bold tracking-wide text-emerald-500 dark:text-emerald-400 drop-shadow">The Ultimate Hackathon Platform</span>
            </div>
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black tracking-tight text-white">
              Build, Compete, and{' '}
              <span className="headline-gradient">Innovate</span>
            </h1>
            <p className="mt-6 text-lg leading-relaxed text-white/90 dark:text-white max-w-3xl mx-auto">
              Join thousands of developers, designers, and innovators in the most exciting hackathons. 
              Create amazing projects, win prizes, and build your network.
            </p>
            <div className="mt-10 flex items-center justify-center gap-x-6">
              {!isAuthenticated && (
                <Link
                  to="/register"
                  className="btn-primary text-lg px-8 py-3 animate-pulse"
                >
                  Start Building Today
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              )}
              {isAuthenticated ? (
                <Link
                  to="/participant/hackathons"
                  className="btn-secondary-invert text-lg px-8 py-3"
                >
                  Browse Hackathons
                </Link>
              ) : (
                <button
                  onClick={handleBrowseHackathons}
                  className="btn-secondary-invert text-lg px-8 py-3"
                >
                  Browse Hackathons
                </button>
              )}
            </div>
          </div>
        </div>
        
        {/* Background decoration */}
        <div className="absolute inset-0 -z-10 overflow-hidden">
          <div className="absolute left-[calc(50%-4rem)] top-10 -z-10 transform-gpu blur-3xl sm:left-[calc(50%-18rem)] lg:left-48 lg:top-[calc(50%-30rem)] xl:left-[calc(50%-24rem)]">
            <div className="aspect-[1108/632] w-[69.25rem] bg-gradient-to-r from-emerald-600 to-slate-700 opacity-20" />
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-white/80 backdrop-blur-sm dark:bg-slate-700/60">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-4xl md:text-5xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-emerald-600 to-green-500">{stat.value}</div>
                <div className="text-sm text-slate-700 dark:text-white">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 lg:py-32 bg-white dark:bg-slate-700">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-slate-900 dark:text-slate-200">
              Everything you need to succeed
            </h2>
            <p className="mt-4 text-lg leading-relaxed text-slate-700 dark:text-white">
              Our platform provides all the tools and resources you need to build amazing projects.
            </p>
          </div>
          
          <div className="grid grid-cols-1 gap-12 lg:gap-16 md:grid-cols-2 lg:grid-cols-4">
            {features.map((feature, index) => (
              <div key={index} className="card-hover-modern text-center transform transition-transform duration-500 hover:scale-105 border border-gradient-to-r from-emerald-600/20 to-slate-700/20">
                <div className="mx-auto h-12 w-12 flex items-center justify-center mb-4 icon-gradient">
                  <feature.icon className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-bold text-slate-700 dark:text-white mb-2">
                  {feature.title}
                </h3>
                <p className="text-slate-700 dark:text-white leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Dashboard Options Section */}
      {isAuthenticated && (
        <section className="py-20 bg-white/90 dark:bg-slate-700/60 backdrop-blur-md">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold tracking-tight text-slate-700 dark:text-white sm:text-4xl">
                Your Dashboard
              </h2>
              <p className="mt-4 text-lg leading-relaxed text-slate-700 dark:text-white">
                Access your personalized dashboard and start building amazing projects.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Participant Dashboard */}
              {user?.roles?.includes('participant') && (
                <div className="card-hover-modern text-center p-6 border border-gradient-to-r from-emerald-600/20 to-slate-700/20">
                  <div className="mx-auto h-12 w-12 flex items-center justify-center mb-4 icon-gradient">
                    <Users className="h-6 w-6" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-700 dark:text-white mb-2">
                    Participant Dashboard
                  </h3>
                  <p className="text-slate-700 dark:text-white mb-4 leading-relaxed">
                    Manage your hackathon participation, teams, and project submissions.
                  </p>
                  <button
                    onClick={handleDashboardNavigation}
                    className="btn-primary w-full"
                  >
                    Go to Dashboard
                  </button>
                </div>
              )}
              
              {/* Organizer Dashboard */}
              {user?.roles?.includes('organizer') && (
                <div className="card-hover-modern text-center p-6 border border-gradient-to-r from-emerald-600/20 to-slate-700/20">
                  <div className="mx-auto h-12 w-12 flex items-center justify-center mb-4 icon-gradient">
                    <Calendar className="h-6 w-6" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-700 dark:text-white mb-2">
                    Organizer Dashboard
                  </h3>
                  <p className="text-slate-700 dark:text-white mb-4 leading-relaxed">
                    Create and manage hackathons, review submissions, and engage participants.
                  </p>
                  <button
                    onClick={handleDashboardNavigation}
                    className="btn-primary w-full"
                  >
                    Go to Dashboard
                  </button>
                </div>
              )}
              
              {/* Judge Dashboard */}
              {user?.roles?.includes('judge') && (
                <div className="card-hover-modern text-center p-6 border border-gradient-to-r from-emerald-600/20 to-slate-700/20">
                  <div className="mx-auto h-12 w-12 flex items-center justify-center mb-4 icon-gradient">
                    <Trophy className="h-6 w-6" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-700 dark:text-white mb-2">
                    Judge Dashboard
                  </h3>
                  <p className="text-slate-700 dark:text-white mb-4 leading-relaxed">
                    Review and evaluate project submissions with detailed scoring.
                  </p>
                  <button
                    onClick={handleDashboardNavigation}
                    className="btn-primary w-full"
                  >
                    Go to Dashboard
                  </button>
                </div>
              )}
              
              {/* General Dashboard (for users without specific roles) */}
              {(!user?.roles || user.roles.length === 0) && (
                <div className="card-hover-modern text-center p-6 border border-gradient-to-r from-emerald-600/20 to-slate-700/20">
                  <div className="mx-auto h-12 w-12 flex items-center justify-center mb-4 icon-gradient">
                    <Target className="h-6 w-6" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-700 dark:text-white mb-2">
                    General Dashboard
                  </h3>
                  <p className="text-slate-700 dark:text-white mb-4 leading-relaxed">
                    Access your account overview and manage your profile settings.
                  </p>
                  <button
                    onClick={handleDashboardNavigation}
                    className="btn-primary w-full"
                  >
                    Go to Dashboard
                  </button>
                </div>
              )}
            </div>
          </div>
        </section>
      )}

      {/* CTA Section */}
      <section className="py-20 app-gradient shadow-glow">
        <div className="mx-auto max-w-7xl px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Ready to start your hackathon journey?
          </h2>
          <p className="mt-4 text-lg text-slate-200">
            Join thousands of innovators and start building the future today.
          </p>
          <div className="mt-8">
            {!isAuthenticated ? (
              <Link
                to="/register"
                className="btn-secondary text-lg px-8 py-3 animate-pulse"
              >
                Get Started Now
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            ) : (
              <button
                onClick={handleDashboardNavigation}
                className="btn-secondary text-lg px-8 py-3"
              >
                Go to Dashboard
                <ArrowRight className="ml-2 h-5 w-5" />
              </button>
            )}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-neutral-900 py-12">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="col-span-1 md:col-span-2">
              <h3 className="text-xl font-black headline-gradient mb-4">Haxplode</h3>
              <p className="text-neutral-400 mb-4">
                The ultimate platform for hackathons, innovation, and collaboration.
              </p>
              <div className="flex space-x-4">
                <a href="#" className="text-neutral-400 hover:text-white">
                  <Globe className="h-5 w-5" />
                </a>
              </div>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-neutral-200 mb-4">Platform</h4>
              <ul className="space-y-2">
                {isAuthenticated ? (
                  <>
                    <li>
                      <button
                        onClick={handleDashboardNavigation}
                        className="text-neutral-400 hover:text-white text-left"
                      >
                        My Dashboard
                      </button>
                    </li>
                    <li>
                      <Link to="/participant/hackathons" className="text-neutral-400 hover:text-white">
                        Browse Hackathons
                      </Link>
                    </li>
                  </>
                ) : (
                  <>
                    <li><a href="#" className="text-neutral-400 hover:text-white">Hackathons</a></li>
                    <li><a href="#" className="text-neutral-400 hover:text-white">Projects</a></li>
                  </>
                )}
                <li><a href="#" className="text-neutral-400 hover:text-white">Leaderboard</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-neutral-200 mb-4">Support</h4>
              <ul className="space-y-2">
                <li><a href="#" className="text-neutral-400 hover:text-white">Help Center</a></li>
                <li><a href="#" className="text-neutral-400 hover:text-white">Contact</a></li>
                <li><a href="#" className="text-neutral-400 hover:text-white">Documentation</a></li>
              </ul>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-neutral-800 text-center">
            <p className="text-neutral-400">
              © 2024 Haxplode. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;
