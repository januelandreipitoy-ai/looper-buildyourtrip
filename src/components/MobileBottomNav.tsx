import { Link, useLocation } from 'react-router-dom';
import { Home, Star, Plus, Map, User } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';

const MobileBottomNav = () => {
  const location = useLocation();
  const isMobile = useIsMobile();

  if (!isMobile) return null;

  const navItems = [
    { path: '/', label: 'Home', icon: Home },
    { path: '/popular', label: 'Popular', icon: Star },
    { path: '/create-trip', label: 'Create', icon: Plus, isCenter: true },
    { path: '/itinerary', label: 'Itinerary', icon: Map },
    { path: '/profile', label: 'Profile', icon: User },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-[100] bg-[hsl(var(--forest-green))] border-t border-[hsl(var(--forest-green))] pb-safe shadow-lg">
      <div className="flex items-center justify-around px-4 py-2">
        {navItems.map(({ path, label, icon: Icon, isCenter }) => (
          <Link
            key={path}
            to={path}
            className={`flex items-center justify-center transition-all duration-200 ${
              isCenter
                ? 'relative -top-4 bg-[hsl(var(--soft-coral))] text-white rounded-full p-4 shadow-lg hover:scale-110 active:scale-95'
                : isActive(path)
                ? 'text-[hsl(var(--soft-coral))] scale-110'
                : 'text-white hover:text-white/90'
            }`}
          >
            <Icon className={isCenter ? 'h-7 w-7' : 'h-6 w-6'} />
          </Link>
        ))}
      </div>
    </nav>
  );
};

export default MobileBottomNav;
