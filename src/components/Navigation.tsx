import { Link, useLocation } from 'react-router-dom';
import { Home, Star, Plus, Map, User, DollarSign } from 'lucide-react';
import Logo from './Logo';
import { useIsMobile } from '@/hooks/use-mobile';
import { ThemeToggle } from './ThemeToggle';

const Navigation = () => {
  const location = useLocation();
  const isMobile = useIsMobile();

  // Hide desktop navigation on mobile (show mobile bottom nav instead)
  if (isMobile) return null;

  const navItems = [
    { path: '/', label: 'Home', icon: Home },
    { path: '/popular', label: 'Popular', icon: Star },
    { path: '/create-trip', label: 'Create Trip', icon: Plus },
    { path: '/itinerary', label: 'Itinerary', icon: Map },
    { path: '/profile', label: 'Profile', icon: User },
    { path: '/pricing', label: 'Pricing', icon: DollarSign },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border">
      <div className="container mx-auto px-2 sm:px-4">
        <div className="flex items-center justify-between h-14 sm:h-16">
          <Logo />
          <div className="flex items-center gap-1 sm:gap-3">
            {navItems.map(({ path, label, icon: Icon }) => (
              <Link
                key={path}
                to={path}
                className={`flex items-center gap-1 sm:gap-2 px-2 sm:px-4 py-1.5 sm:py-2 rounded-2xl font-medium transition-all duration-300 text-xs sm:text-sm ${
                  location.pathname === path
                    ? 'bg-primary text-primary-foreground shadow-lg'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                }`}
              >
                <Icon className="h-3 w-3 sm:h-4 sm:w-4" />
                <span className="hidden md:inline">{label}</span>
              </Link>
            ))}
            <ThemeToggle />
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
