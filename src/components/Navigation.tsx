import { Link, useLocation } from 'react-router-dom';
import { Compass, Calendar, DollarSign } from 'lucide-react';
import Logo from './Logo';
import { ThemeToggle } from './ThemeToggle';

const Navigation = () => {
  const location = useLocation();

  const navItems = [
    { path: '/explore', label: 'Explore', icon: Compass },
    { path: '/itinerary', label: 'Itinerary', icon: Calendar },
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
                className={`flex items-center gap-1 sm:gap-2 px-2 sm:px-6 py-1.5 sm:py-2 rounded-full font-medium transition-all duration-300 text-xs sm:text-base ${
                  location.pathname === path
                    ? 'bg-primary text-primary-foreground shadow-lg'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                }`}
              >
                <Icon className="h-3 w-3 sm:h-4 sm:w-4" />
                <span className="hidden xs:inline">{label}</span>
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
