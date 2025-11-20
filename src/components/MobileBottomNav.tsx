import { Link, useLocation } from 'react-router-dom';
import { Home, Star, Plus, Map, User } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';

const MobileBottomNav = () => {
  const location = useLocation();
  const isMobile = useIsMobile();

  if (!isMobile) return null;

  const navItems = [
    { path: '/', label: 'Home', icon: Home },
    { path: '/checkout', label: 'Check Out', icon: Star },
    { path: '/create-trip', label: 'Create', icon: Plus, isCenter: true },
    { path: '/itinerary', label: 'Itinerary', icon: Map },
    { path: '/profile', label: 'Profile', icon: User },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-secondary border-t border-border/20 pb-safe">
      <div className="flex items-center justify-around px-4 py-3">
        {navItems.map(({ path, label, icon: Icon, isCenter }) => (
          <Link
            key={path}
            to={path}
            className={`flex flex-col items-center gap-1 transition-all duration-200 ${
              isCenter
                ? 'relative -top-4 bg-primary text-primary-foreground rounded-full p-4 shadow-lg scale-110'
                : isActive(path)
                ? 'text-primary scale-105'
                : 'text-muted-foreground'
            }`}
          >
            <Icon className={isCenter ? 'h-6 w-6' : 'h-5 w-5'} />
            {!isCenter && (
              <span className="text-[10px] font-medium">{label}</span>
            )}
          </Link>
        ))}
      </div>
    </nav>
  );
};

export default MobileBottomNav;
