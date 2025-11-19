import { Heart } from 'lucide-react';
import { cn } from '@/lib/utils';

interface HeartButtonProps {
  isSaved: boolean;
  onClick: (e: React.MouseEvent) => void;
  className?: string;
}

export const HeartButton = ({ isSaved, onClick, className }: HeartButtonProps) => {
  return (
    <button
      onClick={onClick}
      className={cn(
        "relative p-2 rounded-full bg-white/90 hover:bg-white transition-all",
        "group",
        className
      )}
    >
      <Heart 
        className={cn(
          "h-5 w-5 transition-all duration-300",
          isSaved 
            ? "fill-red-500 text-red-500 animate-heart-pop" 
            : "text-gray-700 group-hover:scale-110"
        )}
      />
      {isSaved && (
        <>
          <span className="absolute inset-0 rounded-full bg-red-500/20 animate-ping" />
          <span className="absolute -top-1 -right-1 text-xl animate-sparkle">✨</span>
        </>
      )}
    </button>
  );
};
