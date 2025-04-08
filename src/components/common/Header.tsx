import { Link, useLocation } from 'react-router-dom';
import { BarChart2, FileText, List, Settings, LogOut } from 'lucide-react';

interface NavItem {
  name: string;
  path: string;
  icon: React.ReactNode;
}

const navItems: NavItem[] = [
  {
    name: 'Dashboard',
    path: '/dashboard',
    icon: <BarChart2 className="w-5 h-5" />
  },
  {
    name: 'Tests',
    path: '/tests',
    icon: <FileText className="w-5 h-5" />
  },
  {
    name: 'Stories',
    path: '/stories',
    icon: <List className="w-5 h-5" />
  },
  {
    name: 'Templates',
    path: '/templates',
    icon: <Settings className="w-5 h-5" />
  }
];

export default function Header() {
  const location = useLocation();

  const handleLogout = () => {
    localStorage.removeItem('token');
    window.location.href = '/login';
  };

  return (
    <header className="bg-gradient-to-r from-indigo-600 to-purple-600 shadow-lg fixed top-0 left-0 right-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Link to="/dashboard" className="flex items-center space-x-2">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                <span className="text-xl font-bold text-white">UATOPIA</span>
              </Link>
            </div>
            <nav className="hidden sm:ml-6 sm:flex sm:space-x-8">
              {navItems.map((item) => {
                const isActive = location.pathname.startsWith(item.path);
                return (
                  <Link
                    key={item.name}
                    to={item.path}
                    className={`
                      inline-flex items-center px-1 pt-1 text-sm font-medium
                      ${isActive
                        ? 'text-white border-b-2 border-white'
                        : 'text-white/80 hover:text-white hover:border-b-2 hover:border-white/50'
                      }
                    `}
                  >
                    <span className="mr-2">{item.icon}</span>
                    {item.name}
                  </Link>
                );
              })}
            </nav>
          </div>
          <div className="flex items-center">
            <button
              onClick={handleLogout}
              className="text-white/80 hover:text-white flex items-center space-x-2"
            >
              <LogOut className="w-5 h-5" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
