import { useState } from 'react';
import { useTrip } from '@/contexts/TripContext';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { MapPin, Clock, DollarSign, Lightbulb, X, Check } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

export const TripSuggestionsSidebar = () => {
  const { tripSuggestions, setTripSuggestions, setAIItinerary, savedLocations, addLocation } = useTrip();
  const navigate = useNavigate();
  const [isConfirming, setIsConfirming] = useState(false);

  if (!tripSuggestions) return null;

  const handleConfirm = async () => {
    setIsConfirming(true);
    
    try {
      // Add all suggested locations to saved locations
      tripSuggestions.locations.forEach(location => {
        if (!savedLocations.find(loc => loc.id === location.id)) {
          addLocation(location);
        }
      });

      // Set the AI itinerary
      setAIItinerary(tripSuggestions.itinerary);

      toast.success('Trip confirmed! Redirecting to your itinerary...');
      
      // Navigate to itinerary page
      setTimeout(() => {
        navigate('/itinerary');
      }, 500);
    } catch (error) {
      console.error('Error confirming trip:', error);
      toast.error('Failed to confirm trip. Please try again.');
    } finally {
      setIsConfirming(false);
    }
  };

  const handleClose = () => {
    setTripSuggestions(null);
  };

  return (
    <Card className="w-96 h-full bg-background border-l shadow-lg flex flex-col">
      <div className="p-4 border-b flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">AI Trip Suggestions</h3>
          <p className="text-sm text-muted-foreground">{tripSuggestions.locations.length} locations suggested</p>
        </div>
        <Button variant="ghost" size="icon" onClick={handleClose}>
          <X className="h-4 w-4" />
        </Button>
      </div>

      <ScrollArea className="flex-1 p-4">
        <div className="space-y-6">
          {/* Budget Summary */}
          <Card className="p-4 bg-primary/5 border-primary/20">
            <div className="flex items-center gap-2 mb-2">
              <DollarSign className="h-5 w-5 text-primary" />
              <h4 className="font-semibold">Estimated Budget</h4>
            </div>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>
                <p className="text-muted-foreground">Daily</p>
                <p className="font-semibold">${tripSuggestions.itinerary.estimatedCosts.dailyBudget}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Total</p>
                <p className="font-semibold text-primary">${tripSuggestions.itinerary.estimatedCosts.totalBudget}</p>
              </div>
            </div>
          </Card>

          {/* Day by Day Plan */}
          <div className="space-y-3">
            <h4 className="font-semibold flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Daily Itinerary
            </h4>
            {tripSuggestions.itinerary.days.map((day) => (
              <Card key={day.dayNumber} className="p-3 border-l-4 border-l-primary">
                <h5 className="font-semibold mb-2">Day {day.dayNumber}</h5>
                <div className="space-y-2 text-sm">
                  {['morning', 'afternoon', 'evening'].map((slot) => {
                    const timeSlot = day.timeSlots[slot as keyof typeof day.timeSlots];
                    if (!timeSlot?.location) return null;
                    
                    return (
                      <div key={slot} className="flex items-start gap-2">
                        <MapPin className="h-3 w-3 mt-1 text-muted-foreground flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="font-medium truncate">{timeSlot.location.name}</p>
                          <p className="text-xs text-muted-foreground">{timeSlot.time}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </Card>
            ))}
          </div>

          {/* Suggested Locations */}
          <div className="space-y-3">
            <h4 className="font-semibold flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              Locations to Visit
            </h4>
            {tripSuggestions.locations.map((location) => (
              <Card key={location.id} className="p-3 overflow-hidden">
                <div className="aspect-video rounded-md overflow-hidden mb-2">
                  <img 
                    src={location.image} 
                    alt={location.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <h5 className="font-semibold mb-1">{location.name}</h5>
                <p className="text-xs text-muted-foreground mb-2">{location.description}</p>
                <div className="flex flex-wrap gap-1">
                  {location.tags.slice(0, 3).map((tag) => (
                    <Badge key={tag} variant="secondary" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </Card>
            ))}
          </div>

          {/* Travel Tips */}
          {tripSuggestions.itinerary.tips && tripSuggestions.itinerary.tips.length > 0 && (
            <Card className="p-4 bg-accent/50">
              <div className="flex items-center gap-2 mb-2">
                <Lightbulb className="h-4 w-4 text-primary" />
                <h4 className="font-semibold">Travel Tips</h4>
              </div>
              <ul className="space-y-1 text-sm">
                {tripSuggestions.itinerary.tips.map((tip, idx) => (
                  <li key={idx} className="text-muted-foreground">• {tip}</li>
                ))}
              </ul>
            </Card>
          )}
        </div>
      </ScrollArea>

      <div className="p-4 border-t bg-background">
        <Button 
          className="w-full" 
          size="lg"
          onClick={handleConfirm}
          disabled={isConfirming}
        >
          <Check className="h-4 w-4 mr-2" />
          {isConfirming ? 'Confirming...' : 'Confirm Trip Plan'}
        </Button>
      </div>
    </Card>
  );
};
