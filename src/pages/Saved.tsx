import React, { useState } from 'react';
import { Heart, Trash2, ChevronLeft, ChevronRight, MapPin, Navigation } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useTrip } from '@/contexts/TripContext';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { GenerateItineraryButton } from '@/components/GenerateItineraryButton';

const ITEMS_PER_PAGE = 12;

const Saved = () => {
  const { savedLocations, removeLocation } = useTrip();
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(1);

  const totalPages = Math.ceil(savedLocations.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const currentItems = savedLocations.slice(startIndex, endIndex);

  const handleRemoveLocation = (id: string, name: string) => {
    removeLocation(id);
    toast.success(`Removed ${name} from favorites`);
    
    // If we removed the last item on a page, go to previous page
    if (currentItems.length === 1 && currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handleGenerateItinerary = () => {
    if (savedLocations.length === 0) {
      toast.error('Please save at least one location first');
      return;
    }
    toast.success('Generating optimal itinerary...');
    navigate('/map');
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-pink-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
                Saved Locations
              </h1>
              <p className="text-muted-foreground mt-1">
                Manage your favorite destinations
              </p>
            </div>
            <Badge variant="secondary" className="text-lg px-4 py-2">
              <Heart className="h-4 w-4 mr-2 fill-red-500 text-red-500" />
              {savedLocations.length} Saved
            </Badge>
          </div>
        </div>
      </div>

      {/* Empty State */}
      {savedLocations.length === 0 ? (
        <div className="container mx-auto px-4 py-20">
          <div className="max-w-md mx-auto text-center">
            <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-pink-100 to-purple-100 flex items-center justify-center">
              <Heart className="h-12 w-12 text-purple-600" />
            </div>
            <h2 className="text-2xl font-bold text-foreground mb-3">No saved locations yet</h2>
            <p className="text-muted-foreground mb-6">
              Start exploring destinations and save your favorites to build your dream itinerary
            </p>
            <Button
              onClick={() => navigate('/explore')}
              className="bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700"
            >
              <MapPin className="h-4 w-4 mr-2" />
              Explore Destinations
            </Button>
          </div>
        </div>
      ) : (
        <>
          {/* Masonry Grid */}
          <div className="container mx-auto px-4 py-8">
            <div className="columns-1 md:columns-2 lg:columns-3 xl:columns-4 gap-6 space-y-6">
              {currentItems.map((location, index) => (
                <div
                  key={location.id}
                  className="break-inside-avoid group relative"
                  style={{
                    animation: `fadeIn 0.6s ease-out ${index * 0.05}s both`
                  }}
                >
                  <div className="relative overflow-hidden rounded-2xl bg-card border border-border shadow-lg hover:shadow-2xl transition-all duration-500 hover:scale-[1.02]">
                    {/* Image */}
                    <div className="relative overflow-hidden aspect-[4/5] bg-muted">
                      <img
                        src={location.image}
                        alt={location.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      
                      {/* Remove Button */}
                      <button
                        onClick={() => handleRemoveLocation(location.id, location.name)}
                        className="absolute top-3 right-3 p-2 rounded-full bg-red-500/90 backdrop-blur-sm shadow-lg hover:bg-red-600 hover:scale-110 transition-all duration-200 group/btn"
                      >
                        <Trash2 className="h-5 w-5 text-white" />
                      </button>
                    </div>

                    {/* Content */}
                    <div className="p-4">
                      <h3 className="font-bold text-lg text-foreground mb-2 line-clamp-2">
                        {location.name}
                      </h3>
                      <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                        {location.description}
                      </p>
                      
                      {location.city && location.country && (
                        <div className="flex items-center gap-2 text-xs text-muted-foreground mb-3">
                          <MapPin className="h-3 w-3" />
                          <span>{location.city}, {location.country}</span>
                        </div>
                      )}

                      <div className="flex flex-wrap gap-2">
                        {location.tags.map((tag, idx) => (
                          <Badge key={idx} variant="secondary" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="container mx-auto px-4 py-8">
              <div className="flex items-center justify-center gap-4">
                <Button
                  onClick={handlePrevPage}
                  disabled={currentPage === 1}
                  variant="outline"
                  className="gap-2"
                >
                  <ChevronLeft className="h-4 w-4" />
                  Previous
                </Button>
                
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">
                    Page {currentPage} of {totalPages}
                  </span>
                </div>

                <Button
                  onClick={handleNextPage}
                  disabled={currentPage === totalPages}
                  variant="outline"
                  className="gap-2"
                >
                  Next
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}

          {/* Generate Itinerary Button */}
          <div className="fixed bottom-6 right-6 z-40">
            <GenerateItineraryButton />
          </div>
        </>
      )}

      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
};

export default Saved;
