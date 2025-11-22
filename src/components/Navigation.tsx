import { useIsMobile } from '@/hooks/use-mobile';
import { ThemeToggle } from './ThemeToggle';

const Navigation = () => {
  const isMobile = useIsMobile();

  // Hide navigation completely - desktop uses Sidebar, mobile uses bottom nav
  // ThemeToggle is conditionally rendered based on platform/page in ThemeToggle component itself
  if (isMobile) return <ThemeToggle />;
  
  return null;
};

export default Navigation;
