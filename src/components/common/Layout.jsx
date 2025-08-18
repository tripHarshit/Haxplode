import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { 
  Home, 
  Calendar, 
  Users, 
  Trophy, 
  Settings, 
  LogOut, 
  Menu, 
  X,
  User,
  Bell
} from 'lucide-react';

const Layout = ({ children }) => {
  const { user, logout, hasRole } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    // Log navigation test
    if (window.navigationTester) {
      window.navigationTester.logAuthEvent('logout', true);
      window.navigationTester.logButtonClick('Logout', 'top_bar');
      window.navigationTester.logNavigation(location.pathname, '/', 'logout');
    }
    
    logout();
    navigate('/');
  };

  const getDashboardHref = () => {
    if (hasRole('participant')) return '/participant';
    if (hasRole('organizer')) return '/organizer';
    if (hasRole('judge')) return '/judge';
    return '/dashboard';
  };

  const navigation = [
    { 
      name: 'Dashboard', 
      href: getDashboardHref(),
      icon: Home 
    },
    ...(hasRole('participant') ? [
      { name: 'Hackathons', href: '/participant/hackathons', icon: Calendar },
      { name: 'My Submissions', href: '/participant/submissions', icon: Trophy },
      { name: 'My Teams', href: '/participant', icon: Users },
    ] : []),
    ...(hasRole('organizer') ? [
      { name: 'My Hackathons', href: '/organizer', icon: Calendar },
      { name: 'Create Hackathon', href: '/organizer/create', icon: Calendar },
      { name: 'Participants', href: '/organizer', icon: Users },
    ] : []),
    ...(hasRole('judge') ? [
      { name: 'Submissions', href: '/judge/submissions', icon: Trophy },
      { name: 'Judging', href: '/judge', icon: Users },
      { name: 'Leaderboard', href: '/judge', icon: Trophy },
    ] : []),
    { name: 'Profile', href: '/profile', icon: User },
    { name: 'Settings', href: '/settings', icon: Settings },
  ];

  const additionalLinks = [
    { name: 'Home', href: '/', icon: Home },
  ];

  const isActive = (href) => {
    return location.pathname === href || location.pathname.startsWith(href + '/');
  };

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Mobile sidebar */}
      <div className={`fixed inset-0 z-50 lg:hidden ${sidebarOpen ? 'block' : 'hidden'}`}>
        <div className="fixed inset-0 bg-neutral-900/80" onClick={() => setSidebarOpen(false)} />
        <div className="fixed inset-y-0 left-0 w-64 bg-white shadow-xl">
          <div className="flex h-16 items-center justify-between px-6 border-b border-neutral-200">
            <h1 className="text-xl font-bold text-gradient">Haxcode</h1>
            <button
              onClick={() => setSidebarOpen(false)}
              className="text-neutral-500 hover:text-neutral-700"
            >
              <X size={24} />
            </button>
          </div>
          <nav className="px-6 py-4">
            {navigation.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                onClick={() => {
                  setSidebarOpen(false);
                  // Log navigation test
                  if (window.navigationTester) {
                    window.navigationTester.logNavigation(location.pathname, item.href, 'mobile_menu_click');
                    window.navigationTester.logButtonClick(item.name, 'mobile_sidebar_menu');
                  }
                }}
                className={`flex items-center px-3 py-2 text-sm font-medium rounded-lg mb-2 transition-colors ${
                  isActive(item.href)
                    ? 'bg-primary-50 text-primary-700 border border-primary-200'
                    : 'text-neutral-700 hover:bg-neutral-100'
                }`}
              >
                <item.icon size={20} className="mr-3" />
                {item.name}
              </Link>
            ))}
            
            {/* Divider */}
            <div className="border-t border-neutral-200 my-4"></div>
            
            {/* Additional Links */}
            {additionalLinks.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center px-3 py-2 text-sm font-medium rounded-lg mb-2 transition-colors ${
                  isActive(item.href)
                    ? 'bg-neutral-50 text-neutral-700 border border-neutral-200'
                    : 'text-neutral-600 hover:bg-neutral-100'
                }`}
              >
                <item.icon size={20} className="mr-3" />
                {item.name}
              </Link>
            ))}
          </nav>
        </div>
      </div>

      {/* Desktop sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:w-64 lg:flex-col">
        <div className="flex grow flex-col gap-y-5 overflow-y-auto border-r border-neutral-200 bg-white px-6 pb-4">
          <div className="flex h-16 shrink-0 items-center">
            <h1 className="text-xl font-bold text-gradient">Haxcode</h1>
          </div>
          <nav className="flex flex-1 flex-col">
            <ul role="list" className="flex flex-1 flex-col gap-y-7">
              <li>
                <ul role="list" className="-mx-2 space-y-1">
                  {navigation.map((item) => (
                    <li key={item.name}>
                      <Link
                        to={item.href}
                        onClick={() => {
                          // Log navigation test
                          if (window.navigationTester) {
                            window.navigationTester.logNavigation(location.pathname, item.href, 'desktop_menu_click');
                            window.navigationTester.logButtonClick(item.name, 'desktop_sidebar_menu');
                          }
                        }}
                        className={`flex items-center px-2 py-2 text-sm font-medium rounded-lg transition-colors ${
                          isActive(item.href)
                            ? 'bg-primary-50 text-primary-700 border border-primary-200'
                            : 'text-neutral-700 hover:bg-neutral-100'
                        }`}
                      >
                        <item.icon size={20} className="mr-3" />
                        {item.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </li>
              
              {/* Divider */}
              <li className="border-t border-neutral-200 my-4"></li>
              
              {/* Additional Links */}
              <li>
                <ul role="list" className="-mx-2 space-y-1">
                  {additionalLinks.map((item) => (
                    <li key={item.name}>
                      <Link
                        to={item.href}
                        className={`flex items-center px-2 py-2 text-sm font-medium rounded-lg transition-colors ${
                          isActive(item.href)
                            ? 'bg-neutral-50 text-neutral-700 border border-neutral-200'
                            : 'text-neutral-600 hover:bg-neutral-100'
                        }`}
                      >
                        <item.icon size={20} className="mr-3" />
                        {item.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </li>
            </ul>
          </nav>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:pl-64">
        {/* Top bar */}
        <div className="sticky top-0 z-40 flex h-16 shrink-0 items-center gap-x-4 border-b border-neutral-200 bg-white px-4 shadow-sm sm:gap-x-6 sm:px-6 lg:px-8">
          <button
            type="button"
            className="-m-2.5 p-2.5 text-neutral-700 lg:hidden"
            onClick={() => {
              setSidebarOpen(true);
              // Log navigation test
              if (window.navigationTester) {
                window.navigationTester.logButtonClick('Hamburger Menu', 'mobile_header');
                window.navigationTester.logModalInteraction('Mobile Sidebar', 'open');
              }
            }}
          >
            <Menu size={24} />
          </button>

          <div className="flex flex-1 gap-x-4 self-stretch lg:gap-x-6">
            <div className="flex flex-1"></div>
            <div className="flex items-center gap-x-4 lg:gap-x-6">
              {/* Notifications */}
              <button className="p-2 text-neutral-400 hover:text-neutral-500">
                <Bell size={20} />
              </button>

              {/* User menu */}
              <div className="flex items-center gap-x-4">
                <div className="hidden sm:flex sm:flex-col sm:items-end">
                  <p className="text-sm font-medium text-neutral-900">{user?.name}</p>
                  <p className="text-xs text-neutral-500">{user?.email}</p>
                </div>
                <div className="h-8 w-8 rounded-full bg-primary-100 flex items-center justify-center">
                  <span className="text-sm font-medium text-primary-700">
                    {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                  </span>
                </div>
                <button
                  onClick={handleLogout}
                  className="p-2 text-neutral-400 hover:text-neutral-500"
                  title="Logout"
                >
                  <LogOut size={20} />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Page content */}
        <main className="py-6">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;
