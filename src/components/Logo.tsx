import { Link } from 'react-router-dom';
import loopiLogo from '@/assets/loopi-logo.png';

export default function Logo() {
  return (
    <Link 
      to="/" 
      className="flex items-center gap-3 font-bold text-2xl text-foreground hover:opacity-80 transition-opacity"
    >
      <img src={loopiLogo} alt="Loopi" className="h-8 w-8 sm:h-10 sm:w-10 object-contain" />
      <span className="bg-gradient-to-r from-primary via-accent to-secondary bg-clip-text text-transparent">
        Loopi
      </span>
    </Link>
  );
}
