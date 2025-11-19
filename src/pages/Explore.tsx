import { useState, useEffect } from 'react';
import { Heart, MapPin, Loader2 } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import { useTrip, SavedLocation } from '@/contexts/TripContext';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { FavoritesPanel } from '@/components/FavoritesPanel';
import { Button } from '@/components/ui/button';
import { HeartButton } from '@/components/HeartButton';
import { DestinationDetailPopup } from '@/components/DestinationDetailPopup';

interface Destination {
  id: string;
  name: string;
  location: string;
  image: string;
  category: string;
}

const Explore = () => {
  const location = useLocation();
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<Destination[]>([]);
  const [searchInput, setSearchInput] = useState<string>('');
  const [isFavoritesPanelOpen, setIsFavoritesPanelOpen] = useState(false);
  const [selectedDestination, setSelectedDestination] = useState<SavedLocation | null>(null);
  const [isDetailPopupOpen, setIsDetailPopupOpen] = useState(false);
  const { addLocation, savedLocations } = useTrip();

  const searchQuery = (location.state as any)?.searchQuery || '';

  const categoryTags = [
    'Hidden Gems',
    'Shopping & Local Life',
    'Relaxation & Wellness',
    'Activities & Attractions',
    'Food & Drink'
  ];

  const destinations: Destination[] = [
    { id: '1', name: 'Chureito Pagoda', location: 'Fujiyoshida, Japan', image: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=800&auto=format&fit=crop', category: 'Landmarks' },
    { id: '2', name: 'Japan Travel Guide', location: 'Japan', image: 'https://images.unsplash.com/photo-1528164344705-47542687000d?w=800&auto=format&fit=crop', category: 'Travel' },
    { id: '3', name: 'Kyoto Cafe', location: 'Kyoto, Japan', image: 'https://images.unsplash.com/photo-1514933651103-005eec06c04b?w=800&auto=format&fit=crop', category: 'Cafés' },
    { id: '4', name: 'Sensoji Temple', location: 'Tokyo, Japan', image: 'https://images.unsplash.com/photo-1478436127897-769e1b3f0f36?w=800&auto=format&fit=crop', category: 'Landmarks' },
    { id: '5', name: 'Shibuya Crossing', location: 'Tokyo, Japan', image: 'https://images.unsplash.com/photo-1542051841857-5f90071e7989?w=800&auto=format&fit=crop', category: 'Street' },
    { id: '6', name: 'Mount Fuji Street', location: 'Japan', image: 'https://images.unsplash.com/photo-1590559899731-a382839e5549?w=800&auto=format&fit=crop', category: 'Nature' },
    { id: '7', name: 'Traditional Izakaya', location: 'Tokyo, Japan', image: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800&auto=format&fit=crop', category: 'Restaurants' },
    { id: '8', name: 'Cherry Blossoms', location: 'Japan', image: 'https://images.unsplash.com/photo-1522383225653-ed111181a951?w=800&auto=format&fit=crop', category: 'Nature' },
    { id: '9', name: 'Tokyo Tower', location: 'Tokyo, Japan', image: 'https://images.unsplash.com/photo-1536098561742-ca998e48cbcc?w=800&auto=format&fit=crop', category: 'Landmarks' },
    { id: '10', name: 'Lost in Japan', location: 'Japan', image: 'https://images.unsplash.com/photo-1528164344705-47542687000d?w=800&auto=format&fit=crop', category: 'Travel' },
    { id: '11', name: 'Traditional Streets', location: 'Kyoto, Japan', image: 'https://images.unsplash.com/photo-1480796927426-f609979314bd?w=800&auto=format&fit=crop', category: 'Street' },
    { id: '12', name: 'Cherry Blossom Alley', location: 'Tokyo, Japan', image: 'https://images.unsplash.com/photo-1554797589-7241bb691973?w=800&auto=format&fit=crop', category: 'Nature' },
    { id: '13', name: 'Neon Streets', location: 'Tokyo, Japan', image: 'https://images.unsplash.com/photo-1542051841857-5f90071e7989?w=800&auto=format&fit=crop', category: 'Nightlife' },
  ];

  const defaultDestinations: Destination[] = [
    { id: '1', name: 'Chureito Pagoda', location: 'Fujiyoshida, Japan', image: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=800&auto=format&fit=crop', category: 'Landmarks' },
    { id: '2', name: 'Japan Travel Guide', location: 'Japan', image: 'https://images.unsplash.com/photo-1528164344705-47542687000d?w=800&auto=format&fit=crop', category: 'Travel' },
    { id: '3', name: 'Kyoto Cafe', location: 'Kyoto, Japan', image: 'https://images.unsplash.com/photo-1514933651103-005eec06c04b?w=800&auto=format&fit=crop', category: 'Cafés' },
    { id: '4', name: 'Sensoji Temple', location: 'Tokyo, Japan', image: 'https://images.unsplash.com/photo-1478436127897-769e1b3f0f36?w=800&auto=format&fit=crop', category: 'Landmarks' },
    { id: '5', name: 'Shibuya Crossing', location: 'Tokyo, Japan', image: 'https://images.unsplash.com/photo-1542051841857-5f90071e7989?w=800&auto=format&fit=crop', category: 'Street' },
    { id: '6', name: 'Mount Fuji Street', location: 'Japan', image: 'https://images.unsplash.com/photo-1590559899731-a382839e5549?w=800&auto=format&fit=crop', category: 'Nature' },
  ];

  const performSearch = async (query: string) => {
    if (!query.trim()) return;
    setIsSearching(true);

    try {
      const { data, error } = await supabase.functions.invoke('search-destinations', {
        body: { query }
      });

      if (error) throw error;

      if (data?.destinations && Array.isArray(data.destinations)) {
        setSearchResults(data.destinations);
        toast.success(`Found ${data.destinations.length} destinations`);
      } else {
        setSearchResults(destinations);
        toast.info('Showing default results');
      }
    } catch (error) {
      console.error('Search error:', error);
      setSearchResults(destinations);
      toast.error('Search failed, showing default results');
    } finally {
      setIsSearching(false);
    }
  };

  useEffect(() => {
    if (searchQuery) {
      performSearch(searchQuery);
    }
  }, [searchQuery]);

  const handleTagClick = (tag: string) => {
    setSelectedCategory(tag === selectedCategory ? '' : tag);
    if (tag !== selectedCategory) {
      performSearch(tag);
    }
  };

  const displayedDestinations = selectedCategory
    ? searchResults.filter(d => d.category === selectedCategory)
    : searchResults.length > 0
    ? searchResults
    : defaultDestinations;

  const handleSaveLocation = async (destination: any, e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation();
    }
    
    try {
      let lat = destination.lat;
      let lon = destination.lon;

      if (!lat || !lon) {
        const geocodeResponse = await fetch(
          `https://photon.komoot.io/api/?q=${encodeURIComponent(destination.location)}&limit=1`
        );
        const geocodeData = await geocodeResponse.json();

        if (geocodeData.features && geocodeData.features.length > 0) {
          const coords = geocodeData.features[0].geometry.coordinates;
          lon = coords[0];
          lat = coords[1];
        } else {
          throw new Error('Could not find location coordinates');
        }
      }

      const savedLocation: SavedLocation = {
        id: destination.id,
        name: destination.name,
        description: destination.location,
        image: destination.image,
        lat,
        lng: lon,
        tags: [destination.category],
        type: destination.category || 'landmark'
      };

      addLocation(savedLocation);
      toast.success(`${destination.name} added to favorites!`);
    } catch (error) {
      console.error('Error saving location:', error);
      toast.error('Failed to save location. Please try again.');
    }
  };

  const handleDestinationClick = async (destination: any) => {
    let lat = destination.lat;
    let lon = destination.lon;

    if (!lat || !lon) {
      try {
        const geocodeResponse = await fetch(
          `https://photon.komoot.io/api/?q=${encodeURIComponent(destination.location)}&limit=1`
        );
        const geocodeData = await geocodeResponse.json();

        if (geocodeData.features && geocodeData.features.length > 0) {
          const coords = geocodeData.features[0].geometry.coordinates;
          lon = coords[0];
          lat = coords[1];
        }
      } catch (error) {
        console.error('Error geocoding:', error);
      }
    }

    const savedLocation: SavedLocation = {
      id: destination.id,
      name: destination.name,
      description: destination.location,
      image: destination.image,
      lat: lat || 0,
      lng: lon || 0,
      tags: [destination.category],
      type: destination.category || 'landmark'
    };

    setSelectedDestination(savedLocation);
    setIsDetailPopupOpen(true);
  };

  const isDestinationSaved = (destinationId: string) => {
    return savedLocations.some(loc => loc.id === destinationId);
  };

  return (
    <div className="min-h-screen bg-background">
      <Button 
        onClick={() => setIsFavoritesPanelOpen(true)}
        className="fixed top-20 right-4 z-40 gap-2 shadow-lg"
        size="lg"
      >
        <Heart className="h-5 w-5" />
        Favorites {savedLocations.length > 0 && `(${savedLocations.length})`}
      </Button>

      <FavoritesPanel 
        isOpen={isFavoritesPanelOpen} 
        onClose={() => setIsFavoritesPanelOpen(false)} 
      />

      <DestinationDetailPopup 
        location={selectedDestination}
        isOpen={isDetailPopupOpen}
        onClose={() => setIsDetailPopupOpen(false)}
      />
      
      <div className="flex-1 overflow-auto">
        <div className="sticky top-16 bg-background/95 backdrop-blur-sm border-b border-border shadow-sm z-10">
          <div className="max-w-7xl mx-auto px-4 py-6">
            <div className="text-center space-y-4">
              <div className="space-y-2">
                <h2 className="text-2xl font-bold text-foreground">
                  Where do you want to go next?
                </h2>
                <p className="text-sm text-muted-foreground/80">
                  Discover beautiful destinations and add them to your trip
                </p>
              </div>

              <div className="max-w-2xl mx-auto">
                <form 
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (searchInput.trim()) {
                      performSearch(searchInput);
                    }
                  }}
                  className="relative"
                >
                  <input
                    type="text"
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                    placeholder="Search destinations..."
                    className="w-full px-6 py-3 rounded-full border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                  />
                  <button
                    type="submit"
                    disabled={!searchInput.trim()}
                    className="absolute right-2 top-1/2 -translate-y-1/2 px-6 py-2 bg-primary text-primary-foreground rounded-full font-medium hover:bg-primary/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Search
                  </button>
                </form>
              </div>

              <div className="flex items-center justify-center flex-wrap gap-3">
                {categoryTags.map((tag) => (
                  <button
                    key={tag}
                    onClick={() => handleTagClick(tag)}
                    className={`px-6 py-2 rounded-full font-medium transition-all ${
                      selectedCategory === tag
                        ? 'bg-primary text-primary-foreground shadow-lg'
                        : 'bg-muted text-foreground hover:bg-muted/80'
                    }`}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 py-6">
        {isSearching ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="animate-spin text-primary" size={48} />
          </div>
        ) : displayedDestinations.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-lg text-muted-foreground">No destinations found. Try a different search.</p>
          </div>
        ) : (
          <div className="columns-2 md:columns-3 lg:columns-4 xl:columns-5 gap-4 space-y-4">
            {displayedDestinations.map((destination) => (
            <div
              key={destination.id}
              onClick={() => handleDestinationClick(destination)}
              className="break-inside-avoid mb-4 group relative overflow-hidden rounded-2xl cursor-pointer transition-all hover:shadow-xl"
            >
              <img
                src={destination.image}
                alt={destination.name}
                className="w-full h-auto object-cover transition-transform duration-300 group-hover:scale-105"
              />
              <div className="absolute top-2 right-2 z-10">
                <HeartButton 
                  isSaved={isDestinationSaved(destination.id)}
                  onClick={(e) => handleSaveLocation(destination, e)}
                />
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
                  <h3 className="font-bold text-lg mb-1">{destination.name}</h3>
                  <p className="text-sm flex items-center gap-1">
                    <MapPin size={14} />
                    {destination.location}
                  </p>
                </div>
              </div>
            </div>
            ))}
          </div>
        )}
        </div>
      </div>
    </div>
  );
};

export default Explore;
