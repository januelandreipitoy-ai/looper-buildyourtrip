import { Link } from 'react-router-dom';
import looperLogo from '@/assets/looper-logo.png';

export default function Logo() {
  return (
    <Link 
      to="/" 
      className="flex items-center gap-3 font-bold text-2xl text-foreground hover:opacity-80 transition-opacity"
    >
      <img src={looperLogo} alt="Looper" className="h-8 w-8 sm:h-10 sm:w-10 object-contain" />
      <span className="font-cursive text-3xl bg-gradient-to-r from-primary via-accent to-secondary bg-clip-text text-transparent">
        Looper
      </span>
    </Link>
  );
}
