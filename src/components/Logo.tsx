import { Link } from 'react-router-dom';
import looperLogo from '@/assets/looper-logo.png';

export default function Logo() {
  return (
    <Link 
      to="/" 
      className="flex items-center gap-3 font-bold text-2xl hover:opacity-80 transition-opacity"
    >
      <img src={looperLogo} alt="Looper" className="h-8 w-8 sm:h-10 sm:w-10 object-contain" />
      <span className="text-3xl" style={{ fontFamily: 'Helvetica, Arial, sans-serif', color: '#8A78B8' }}>
        Looper
      </span>
    </Link>
  );
}
