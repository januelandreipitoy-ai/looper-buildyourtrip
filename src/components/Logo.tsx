import { Link } from 'react-router-dom';
import loopiCharacter from '@/assets/loopi-character.png';
import { useIsMobile } from '@/hooks/use-mobile';

export default function Logo() {
  const isMobile = useIsMobile();

  return (
    <Link 
      to="/" 
      className="flex items-center gap-3 hover:opacity-80 transition-opacity"
    >
      <img src={loopiCharacter} alt="Loopi" className="h-10 w-10 sm:h-12 sm:w-12 object-contain" />
      {!isMobile && (
        <span className="font-looper font-bold text-2xl sm:text-3xl text-logo">
          Looper
        </span>
      )}
    </Link>
  );
}
