import Globe3D from '@/components/Globe3D';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { Compass } from 'lucide-react';

export default function Home() {
  const navigate = useNavigate();

  return (
    <div className="relative w-full h-screen overflow-hidden bg-background">
      <Globe3D />
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center z-10 pointer-events-none">
        <h1 className="text-6xl font-bold mb-4 text-foreground drop-shadow-lg">
          Explore the World
        </h1>
        <p className="text-xl text-muted-foreground mb-8 drop-shadow">
          Discover amazing destinations and plan your perfect trip
        </p>
        <Button
          size="lg"
          onClick={() => navigate('/search')}
          className="pointer-events-auto bg-gradient-to-r from-primary via-accent to-secondary hover:opacity-90 text-white border-0"
        >
          <Compass className="mr-2 h-5 w-5" />
          Start Exploring
        </Button>
      </div>
    </div>
  );
}
