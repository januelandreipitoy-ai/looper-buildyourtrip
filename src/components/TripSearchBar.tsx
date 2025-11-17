import { useState } from 'react';
import { Search, Calendar as CalendarIcon, Users, MapPin, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import { Button } from './ui/button';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { Calendar } from './ui/calendar';
import { cn } from '@/lib/utils';
import { format, differenceInDays } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import { useTrip } from '@/contexts/TripContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface TripSearchBarProps {
  className?: string;
}

export const TripSearchBar = ({ className }: TripSearchBarProps) => {
  const navigate = useNavigate();
  const { setSearchParams, setTripSuggestions } = useTrip();
  const [destination, setDestination] = useState('');
  const [startDate, setStartDate] = useState<Date>();
  const [endDate, setEndDate] = useState<Date>();
  const [showDestinationPopover, setShowDestinationPopover] = useState(false);
  const [showGuestPopover, setShowGuestPopover] = useState(false);
  const [adults, setAdults] = useState(2);
  const [children, setChildren] = useState(0);
  const [infants, setInfants] = useState(0);
  const [pets, setPets] = useState(0);
  const [isSearching, setIsSearching] = useState(false);

  const totalGuests = adults + children + infants + pets;
  const days = startDate && endDate ? differenceInDays(endDate, startDate) + 1 : 0;

  const handleSearch = async () => {
    if (!destination) {
      toast.error('Please enter a destination');
      return;
    }

    if (!startDate || !endDate) {
      toast.error('Please select travel dates');
      return;
    }

    if (adults === 0) {
      toast.error('At least one adult is required');
      return;
    }

    setIsSearching(true);

    try {
      const searchParamsData = {
        destination,
        startDate,
        endDate,
        days,
        adults,
        children,
        infants,
        pets,
      };

      // Save search parameters
      setSearchParams(searchParamsData);

      // Generate trip suggestions using AI
      const { data, error } = await supabase.functions.invoke('generate-trip-suggestions', {
        body: { searchParams: searchParamsData }
      });

      if (error) throw error;

      if (data?.success && data?.suggestions) {
        // Map location IDs to actual location objects in itinerary
        const itineraryWithLocations = {
          ...data.suggestions.itinerary,
          days: data.suggestions.itinerary.days.map((day: any) => ({
            ...day,
            timeSlots: {
              morning: {
                ...day.timeSlots.morning,
                location: data.suggestions.locations.find((loc: any) => loc.id === day.timeSlots.morning.locationId)
              },
              afternoon: {
                ...day.timeSlots.afternoon,
                location: data.suggestions.locations.find((loc: any) => loc.id === day.timeSlots.afternoon.locationId)
              },
              evening: {
                ...day.timeSlots.evening,
                location: data.suggestions.locations.find((loc: any) => loc.id === day.timeSlots.evening.locationId)
              }
            }
          }))
        };

        setTripSuggestions({
          locations: data.suggestions.locations,
          itinerary: itineraryWithLocations
        });

        toast.success(`Generated AI suggestions for ${destination}!`);
      }
      
      // Navigate to explore page to see results
      navigate('/explore');
    } catch (error) {
      console.error('Search error:', error);
      toast.error('Failed to generate trip suggestions. Please try again.');
    } finally {
      setIsSearching(false);
    }
  };

  const suggestedDestinations = [
    { name: 'Nearby', icon: '✈️', description: "Find what's around you" },
    { name: 'Baguio, Philippines', icon: '🏔️', description: 'Great for a weekend getaway' },
    { name: 'Makati, Philippines', icon: '🏙️', description: 'For sights like Ayala Triangle Gardens' },
    { name: 'Tagaytay, Philippines', icon: '🌄', description: 'For nature-lovers' },
    { name: 'Cebu City, Philippines', icon: '🏖️', description: 'For its bustling nightlife' },
    { name: 'San Juan Beach, Philippines', icon: '🏄', description: 'For a trip abroad' },
    { name: 'Burnham Park, Philippines', icon: '🌳', description: 'For a weekend getaway' },
  ];

  return (
    <div className={cn("w-full max-w-4xl mx-auto", className)}>
      <div className="bg-background rounded-full border-2 border-border shadow-lg flex items-center overflow-hidden">
        <Popover open={showDestinationPopover} onOpenChange={setShowDestinationPopover}>
          <PopoverTrigger asChild>
            <button className="flex-1 px-6 py-4 text-left hover:bg-muted/50 transition-colors border-r border-border">
              <div className="text-xs font-medium text-muted-foreground">Where</div>
              <input
                type="text"
                placeholder="Search destinations"
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                className="w-full bg-transparent outline-none text-sm font-medium placeholder:text-muted-foreground"
              />
            </button>
          </PopoverTrigger>
          <PopoverContent className="w-96 p-0" align="start">
            <div className="p-4">
              <h4 className="text-sm font-semibold mb-3">Suggested destinations</h4>
              <div className="space-y-2">
                {suggestedDestinations.map((dest) => (
                  <button
                    key={dest.name}
                    onClick={() => {
                      setDestination(dest.name);
                      setShowDestinationPopover(false);
                    }}
                    className="w-full flex items-center gap-3 p-3 hover:bg-muted rounded-lg transition-colors text-left"
                  >
                    <div className="text-2xl">{dest.icon}</div>
                    <div className="flex-1">
                      <div className="font-medium text-sm">{dest.name}</div>
                      <div className="text-xs text-muted-foreground">{dest.description}</div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </PopoverContent>
        </Popover>

        <Popover>
          <PopoverTrigger asChild>
            <button className="flex-1 px-6 py-4 text-left hover:bg-muted/50 transition-colors border-r border-border">
              <div className="text-xs font-medium text-muted-foreground">When</div>
              <div className="text-sm font-medium">
                {startDate && endDate
                  ? `${format(startDate, 'MMM d')} - ${format(endDate, 'MMM d')}`
                  : 'Add dates'}
              </div>
            </button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="center">
            <div className="flex gap-4 p-4">
              <div>
                <h4 className="text-sm font-semibold mb-3">Check-in</h4>
                <Calendar
                  mode="single"
                  selected={startDate}
                  onSelect={setStartDate}
                  disabled={(date) => date < new Date()}
                  initialFocus
                  className={cn("p-3 pointer-events-auto")}
                />
              </div>
              <div>
                <h4 className="text-sm font-semibold mb-3">Check-out</h4>
                <Calendar
                  mode="single"
                  selected={endDate}
                  onSelect={setEndDate}
                  disabled={(date) => !startDate || date <= startDate}
                  initialFocus
                  className={cn("p-3 pointer-events-auto")}
                />
              </div>
            </div>
          </PopoverContent>
        </Popover>

        <Popover open={showGuestPopover} onOpenChange={setShowGuestPopover}>
          <PopoverTrigger asChild>
            <button className="flex-1 px-6 py-4 text-left hover:bg-muted/50 transition-colors">
              <div className="text-xs font-medium text-muted-foreground">Who</div>
              <div className="text-sm font-medium">
                {totalGuests > 0 ? `${totalGuests} guest${totalGuests > 1 ? 's' : ''}` : 'Add guests'}
              </div>
            </button>
          </PopoverTrigger>
          <PopoverContent className="w-96" align="end">
            <div className="space-y-4 p-2">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium">Adults</div>
                  <div className="text-sm text-muted-foreground">Ages 13 or above</div>
                </div>
                <div className="flex items-center gap-3">
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8 rounded-full"
                    onClick={() => setAdults(Math.max(0, adults - 1))}
                    disabled={adults === 0}
                  >
                    -
                  </Button>
                  <span className="w-8 text-center">{adults}</span>
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8 rounded-full"
                    onClick={() => setAdults(adults + 1)}
                  >
                    +
                  </Button>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium">Children</div>
                  <div className="text-sm text-muted-foreground">Ages 2-12</div>
                </div>
                <div className="flex items-center gap-3">
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8 rounded-full"
                    onClick={() => setChildren(Math.max(0, children - 1))}
                    disabled={children === 0}
                  >
                    -
                  </Button>
                  <span className="w-8 text-center">{children}</span>
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8 rounded-full"
                    onClick={() => setChildren(children + 1)}
                  >
                    +
                  </Button>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium">Infants</div>
                  <div className="text-sm text-muted-foreground">Under 2</div>
                </div>
                <div className="flex items-center gap-3">
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8 rounded-full"
                    onClick={() => setInfants(Math.max(0, infants - 1))}
                    disabled={infants === 0}
                  >
                    -
                  </Button>
                  <span className="w-8 text-center">{infants}</span>
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8 rounded-full"
                    onClick={() => setInfants(infants + 1)}
                  >
                    +
                  </Button>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium">Pets</div>
                  <div className="text-sm text-muted-foreground">
                    <a href="#" className="underline">Bringing a service animal?</a>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8 rounded-full"
                    onClick={() => setPets(Math.max(0, pets - 1))}
                    disabled={pets === 0}
                  >
                    -
                  </Button>
                  <span className="w-8 text-center">{pets}</span>
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8 rounded-full"
                    onClick={() => setPets(pets + 1)}
                  >
                    +
                  </Button>
                </div>
              </div>
            </div>
          </PopoverContent>
        </Popover>

        <Button
          onClick={handleSearch}
          size="icon"
          className="h-14 w-14 rounded-full m-2 bg-primary hover:bg-primary/90"
          disabled={!destination || !startDate || !endDate || isSearching}
        >
          {isSearching ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <Search className="h-5 w-5" />
          )}
        </Button>
      </div>
    </div>
  );
};