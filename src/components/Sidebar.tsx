import { Link, useLocation } from 'react-router-dom';
import { Home, Star, Plus, Map, User, DollarSign } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';

const Sidebar = () => {
  const location = useLocation();
  const isMobile = useIsMobile();

  // Hide sidebar on mobile (use bottom nav instead)
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
    <aside className="fixed left-0 top-0 h-screen w-20 bg-card border-r border-border z-50 flex flex-col items-center py-6">
      {/* Logo at top */}
      <Link to="/" className="mb-8">
        <img 
          src="/src/assets/loopi-character.png" 
          alt="Looper" 
          className="w-12 h-12 object-contain"
        />
      </Link>

      {/* Navigation icons */}
      <nav className="flex flex-col gap-6 flex-1">
        {navItems.map(({ path, label, icon: Icon }) => (
          <Link
            key={path}
            to={path}
            className={`flex items-center justify-center w-12 h-12 rounded-2xl transition-all duration-300 ${
              location.pathname === path
                ? 'bg-[hsl(var(--soft-coral))] text-white shadow-lg'
                : 'text-muted-foreground hover:text-foreground hover:bg-muted'
            }`}
            title={label}
          >
            <Icon className="h-6 w-6" />
          </Link>
        ))}
      </nav>
    </aside>
  );
};

export default Sidebar;
