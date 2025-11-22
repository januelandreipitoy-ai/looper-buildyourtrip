import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Heart, Plus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { FavoritesPanel } from '@/components/FavoritesPanel';
import { useTrip } from '@/contexts/TripContext';
import { SimpleSearchBar } from '@/components/SimpleSearchBar';

interface Inspiration {
  id: string;
  image: string;
  location: string;
  category: string;
}

const inspirationImages: Inspiration[] = [
  {
    id: '1',
    image: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=600',
    location: 'Tokyo Tower',
    category: 'Landmarks',
  },
  {
    id: '2',
    image: 'https://images.unsplash.com/photo-1528360983277-13d401cdc186?w=600',
    location: 'Ramen Street',
    category: 'Food & Drink',
  },
  {
    id: '3',
    image: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=600',
    location: 'Fushimi Inari',
    category: 'Temples',
  },
  {
    id: '4',
    image: 'https://images.unsplash.com/photo-1590559899731-a382839e5549?w=600',
    location: 'Osaka Street',
    category: 'City Life',
  },
  {
    id: '5',
    image: 'https://images.unsplash.com/photo-1480796927426-f609979314bd?w=600',
    location: 'Kinkaku-ji',
    category: 'Temples',
  },
  {
    id: '6',
    image: 'https://images.unsplash.com/photo-1526481280693-3bfa7568e0f3?w=600',
    location: 'Shibuya Crossing',
    category: 'Landmarks',
  },
  {
    id: '7',
    image: 'https://images.unsplash.com/photo-1492571350019-22de08371fd3?w=600',
    location: 'Cherry Blossoms',
    category: 'Nature',
  },
  {
    id: '8',
    image: 'https://images.unsplash.com/photo-1478436127897-769e1b3f0f36?w=600',
    location: 'Arashiyama Bamboo',
    category: 'Nature',
  },
];

export default function CreateTrip() {
  const [activeFilter, setActiveFilter] = useState<string>('all');
  const [selectedLocations, setSelectedLocations] = useState<string[]>([]);
  const [isFavoritesPanelOpen, setIsFavoritesPanelOpen] = useState(false);
  const { toast } = useToast();

  const filters = ['All', 'Popular', 'Seasonal', 'Hidden Gems', 'Food', 'Nature'];

  const toggleLocation = (id: string) => {
    if (selectedLocations.includes(id)) {
      setSelectedLocations(selectedLocations.filter((locId) => locId !== id));
      toast({
        title: 'Removed from trip',
        description: 'Location removed from your trip builder',
      });
    } else {
      setSelectedLocations([...selectedLocations, id]);
      toast({
        title: 'Added to trip!',
        description: 'Location added to your trip builder',
      });
    }
  };

  const { savedLocations } = useTrip();

  return (
    <div className="min-h-screen bg-background pb-24 md:pl-20">
      {/* Favorites Button - Fixed Top Right */}
      <Button
        onClick={() => setIsFavoritesPanelOpen(true)}
        size="icon"
        variant="secondary"
        className="fixed top-6 right-6 z-40 rounded-full shadow-lg"
      >
        <Heart className="h-5 w-5" />
        {savedLocations.length > 0 && (
          <Badge className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0 flex items-center justify-center bg-[hsl(var(--soft-coral))] text-white">
            {savedLocations.length}
          </Badge>
        )}
      </Button>

      <div className="container mx-auto px-4 pt-6">
        {/* Search Bar */}
        <div className="mb-6">
          <SimpleSearchBar placeholder="Search destinations to add to your trip..." />
        </div>
        {/* Filters */}
        <div className="flex gap-2 overflow-x-auto pb-4 mb-4 scrollbar-hide">
          {filters.map((filter) => (
            <Badge
              key={filter}
              variant={activeFilter === filter.toLowerCase() ? 'default' : 'outline'}
              className="cursor-pointer whitespace-nowrap px-4 py-2"
              onClick={() => setActiveFilter(filter.toLowerCase())}
            >
              {filter}
            </Badge>
          ))}
        </div>

        {/* Pinterest-style Masonry Grid */}
        <div className="columns-2 md:columns-3 lg:columns-4 gap-1 space-y-1">
          {inspirationImages.map((item) => (
            <div
              key={item.id}
              className="relative break-inside-avoid mb-1 group cursor-pointer"
              onClick={() => toggleLocation(item.id)}
            >
              <div className="relative overflow-hidden rounded-2xl">
                <img
                  src={item.image}
                  alt={item.location}
                  className="w-full h-auto object-cover transition-transform duration-300 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                
                {/* Add/Heart Button */}
                <button
                  className={`absolute top-3 right-3 p-2 rounded-full transition-all duration-200 ${
                    selectedLocations.includes(item.id)
                      ? 'bg-primary text-primary-foreground scale-110'
                      : 'bg-background/80 text-foreground hover:bg-background'
                  }`}
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleLocation(item.id);
                  }}
                >
                  {selectedLocations.includes(item.id) ? (
                    <Heart className="h-4 w-4 fill-current" />
                  ) : (
                    <Plus className="h-4 w-4" />
                  )}
                </button>

                {/* Location Info */}
                <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
                  <p className="font-semibold text-sm mb-1">{item.location}</p>
                  <p className="text-xs opacity-90">{item.category}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Selected Count */}
        {selectedLocations.length > 0 && (
          <div className="fixed bottom-24 left-1/2 transform -translate-x-1/2 z-40">
            <Badge className="bg-secondary text-secondary-foreground px-6 py-3 text-base shadow-lg">
              {selectedLocations.length} location{selectedLocations.length > 1 ? 's' : ''} added
            </Badge>
          </div>
        )}
      </div>

      {/* Favorites Panel */}
      <FavoritesPanel
        isOpen={isFavoritesPanelOpen}
        onClose={() => setIsFavoritesPanelOpen(false)}
      />
    </div>
  );
}
