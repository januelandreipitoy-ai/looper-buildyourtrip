import { Link, useLocation } from 'react-router-dom';
import { Compass, Map, Heart, Calendar } from 'lucide-react';
import Logo from './Logo';

const Navigation = () => {
  const location = useLocation();

  const navItems = [
    { path: '/explore', label: 'Explore', icon: Compass },
    { path: '/saved', label: 'Saved', icon: Heart },
    { path: '/map', label: 'Map', icon: Map },
    { path: '/itinerary', label: 'Itinerary', icon: Calendar },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border">
      <div className="container mx-auto px-2 sm:px-4">
        <div className="flex items-center justify-between h-14 sm:h-16">
          <Logo />
          <div className="flex items-center gap-1 sm:gap-2">
            {navItems.map(({ path, label, icon: Icon }) => (
              <Link
                key={path}
                to={path}
                className={`flex items-center gap-1 sm:gap-2 px-2 sm:px-6 py-1.5 sm:py-2 rounded-full font-medium transition-all duration-300 text-xs sm:text-base ${
                  location.pathname === path
                    ? 'bg-gradient-to-r from-primary via-accent to-secondary text-white shadow-lg'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                }`}
              >
                <Icon className="h-3 w-3 sm:h-4 sm:w-4" />
                <span className="hidden xs:inline">{label}</span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
