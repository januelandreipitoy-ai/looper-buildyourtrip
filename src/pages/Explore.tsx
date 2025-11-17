import { useState, useEffect } from 'react';
import { Heart, MapPin, Loader2 } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import { useTrip, SavedLocation } from '@/contexts/TripContext';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { TripSuggestionsSidebar } from '@/components/TripSuggestionsSidebar';

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
  const { addLocation } = useTrip();

  // Get search query from navigation state
  const searchQuery = (location.state as any)?.searchQuery || '';

  const categoryTags = [
    'Hidden Gems',
    'Shopping & Local Life',
    'Relaxation & Wellness',
    'Activities & Attractions',
    'Food & Drink'
  ];

  // Sample Japan destinations for masonry grid
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

  // Default destinations when no search
  const defaultDestinations: Destination[] = [
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

  const performSearch = async (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);

    try {
      const { data, error } = await supabase.functions.invoke('search-destinations', {
        body: { query },
      });

      if (error) throw error;

      if (data?.destinations && data.destinations.length > 0) {
        setSearchResults(data.destinations);
      } else {
        setSearchResults([]);
        toast.info(`No results found for "${query}". Try a different search.`);
      }
    } catch (error) {
      console.error('Search error:', error);
      toast.error('Failed to search destinations. Please try again.');
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  // Perform search when component mounts with query from navigation
  useEffect(() => {
    if (searchQuery) {
      performSearch(searchQuery);
    }
  }, [searchQuery]);

  const handleTagClick = (tag: string) => {
    setSelectedCategory(tag);
    performSearch(tag);
  };

  const handleSaveLocation = async (destination: any) => {
    // Ensure we have precise coordinates; fallback to Photon (OSM) if needed
    let lat = destination.lat || 0;
    let lng = destination.lng || 0;

    if ((!lat || !lng) || (lat === 0 && lng === 0)) {
      try {
        const query = destination.description || `${destination.name} ${destination.city || ''} ${destination.country || ''}`;
        const resp = await fetch(`https://photon.komoot.io/api/?q=${encodeURIComponent(query)}&limit=1`);
        if (resp.ok) {
          const gj = await resp.json();
          if (gj.features && gj.features.length > 0) {
            const [plng, plat] = gj.features[0].geometry.coordinates;
            lat = plat;
            lng = plng;
          }
        }
      } catch (e) {
        console.error('Client geocoding failed', e);
      }
    }

    const savedLocation: SavedLocation = {
      id: destination.id,
      name: destination.name,
      image: destination.image,
      description: destination.description || destination.location || "",
      tags: destination.tags || [destination.category || destination.type || 'attraction'],
      lat,
      lng,
      type: destination.type || destination.category || 'attraction',
      city: destination.city || destination.location?.split(',')[0],
      country: destination.country || destination.location?.split(',').pop()?.trim() || '',
    };

    if ((savedLocation.lat === 0 && savedLocation.lng === 0)) {
      toast.error('Could not locate this place on the map. Try a more specific search.');
      return;
    }

    addLocation(savedLocation);
    toast.success(`${destination.name} added to your trip!`);
  };

  const displayedDestinations = searchResults.length > 0 ? searchResults : defaultDestinations;

  return (
    <div className="min-h-screen bg-background flex">
      <div className="flex-1 overflow-auto">
        {/* Header with Category Filters */}
        <div className="sticky top-16 bg-background/95 backdrop-blur-sm border-b border-border shadow-sm z-10">
          <div className="max-w-7xl mx-auto px-4 py-6">
            <div className="text-center space-y-4">
              <div className="space-y-2">
                <h2 className="text-2xl font-bold text-foreground">
                  Where do you want to go next?
                </h2>
                <p className="text-sm text-muted-foreground/80">
                  Discover places, experiences, and hidden gems waiting for you
                </p>
              </div>

              {/* Category Filter Buttons */}
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

        {/* Masonry Grid */}
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
              className="break-inside-avoid mb-4 group relative overflow-hidden rounded-2xl cursor-pointer transition-all hover:shadow-xl"
            >
              <img
                src={destination.image}
                alt={destination.name}
                className="w-full h-auto object-cover transition-transform duration-300 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
                  <h3 className="font-bold text-lg mb-1">{destination.name}</h3>
                  <p className="text-sm flex items-center gap-1 mb-2">
                    <MapPin size={14} />
                    {destination.location}
                  </p>
                  <button
                    onClick={() => handleSaveLocation(destination)}
                    className="w-full bg-white/90 hover:bg-white text-gray-900 font-semibold py-2 px-4 rounded-full flex items-center justify-center gap-2 transition-colors"
                  >
                    <Heart size={16} />
                    Save
                  </button>
                </div>
              </div>
            </div>
          ))}
          </div>
          )}
        </div>
      </div>
      
      <TripSuggestionsSidebar />
    </div>
  );
};

export default Explore;
