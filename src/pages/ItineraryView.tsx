import React, { useState, useEffect } from 'react';
import { useTrip } from '@/contexts/TripContext';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MapPin, Clock, DollarSign, Calendar, Utensils, Camera, ChevronDown, Sparkles, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import ItineraryFlatMap from '@/components/ItineraryFlatMap';
import { SavedLocation } from '@/contexts/TripContext';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';

const ItineraryView = () => {
  const { aiItinerary, savedLocations, searchParams } = useTrip();
  const navigate = useNavigate();
  const [currency, setCurrency] = useState('AED');
  const [currencySymbol, setCurrencySymbol] = useState('د.إ');
  const [totalBudget, setTotalBudget] = useState({
    accommodation: 0,
    transport: 0,
    food: 0,
    activities: 0,
    total: 0,
  });
  const [highlightedLocation, setHighlightedLocation] = useState<SavedLocation | null>(null);
  const [isMobileSheetOpen, setIsMobileSheetOpen] = useState(false);
  const [selectedDay, setSelectedDay] = useState<number | null>(null);

  useEffect(() => {
    if (!aiItinerary) return;

    // Detect currency
    const firstLocation = aiItinerary.days[0]?.timeSlots.morning.location;
    if (firstLocation?.country) {
      const currencyMap: Record<string, { code: string; symbol: string }> = {
        'UAE': { code: 'AED', symbol: 'د.إ' },
        'Japan': { code: 'JPY', symbol: '¥' },
        'Philippines': { code: 'PHP', symbol: '₱' },
        'Greece': { code: 'EUR', symbol: '€' },
        'Italy': { code: 'EUR', symbol: '€' },
        'France': { code: 'EUR', symbol: '€' },
        'USA': { code: 'USD', symbol: '$' },
        'China': { code: 'CNY', symbol: '¥' },
        'Peru': { code: 'PEN', symbol: 'S/' },
      };
      const currencyInfo = currencyMap[firstLocation.country] || { code: 'USD', symbol: '$' };
      setCurrency(currencyInfo.code);
      setCurrencySymbol(currencyInfo.symbol);
    }

    // Calculate budget
    const guestMultiplier = searchParams 
      ? (searchParams.adults + searchParams.children * 0.7 + searchParams.infants * 0.3) 
      : 2;
    
    const totalDays = aiItinerary.days.length;
    const accommodationPerNight = Math.round(150 * guestMultiplier);
    const totalAccommodation = accommodationPerNight * totalDays;
    const totalFood = Math.round(50 * guestMultiplier * totalDays);
    const totalActivities = Math.round(40 * guestMultiplier * totalDays);
    const totalTransport = 20 * totalDays;

    setTotalBudget({
      accommodation: totalAccommodation,
      transport: totalTransport,
      food: totalFood,
      activities: totalActivities,
      total: totalAccommodation + totalTransport + totalFood + totalActivities,
    });
  }, [aiItinerary, searchParams]);

  if (savedLocations.length === 0) {
    return (
      <div className="min-h-screen pt-20 px-4">
        <div className="max-w-4xl mx-auto text-center py-20">
          <Calendar className="h-20 w-20 mx-auto mb-6 text-muted-foreground" />
          <h2 className="text-3xl font-bold mb-4">No Itinerary Yet</h2>
          <p className="text-muted-foreground mb-8">
            Start by saving some locations from the Explore page, then generate your itinerary from the Map page.
          </p>
          <Button onClick={() => navigate('/explore')}>
            Explore Destinations
          </Button>
        </div>
      </div>
    );
  }

  if (!aiItinerary) {
    return (
      <div className="min-h-screen pt-20 px-4">
        <div className="max-w-4xl mx-auto text-center py-20">
          <MapPin className="h-20 w-20 mx-auto mb-6 text-muted-foreground" />
          <h2 className="text-3xl font-bold mb-4">Generate Your Itinerary</h2>
          <p className="text-muted-foreground mb-8">
            You have {savedLocations.length} saved location{savedLocations.length !== 1 ? 's' : ''}. Go to the Map page to generate your AI-powered itinerary.
          </p>
          <Button onClick={() => navigate('/map')}>
            Go to Map
          </Button>
        </div>
      </div>
    );
  }

  const TimeSlotCard = ({ 
    slot, 
    color, 
    timeLabel, 
    meal 
  }: { 
    slot: any; 
    color: string; 
    timeLabel: string; 
    meal?: string;
  }) => (
    <div 
      className={`border-l-4 border-${color}-500/30 pl-6 cursor-pointer hover:bg-muted/50 rounded-r-lg p-4 transition-all`}
      onClick={() => setHighlightedLocation(slot.location)}
      onMouseEnter={() => setHighlightedLocation(slot.location)}
    >
      <div className="flex items-center gap-2 mb-3">
        <div className={`w-2 h-2 rounded-full bg-${color}-500`}></div>
        <h3 className="text-lg font-semibold">{timeLabel}</h3>
        <Badge variant="outline" className="text-xs">{slot.time}</Badge>
      </div>
      {slot.travelTime && (
        <div className="mb-3 text-sm text-muted-foreground flex items-center gap-2">
          <Badge variant="secondary" className="text-xs">
            {slot.transportMode}: {slot.travelTime}
          </Badge>
        </div>
      )}
      <div className="flex gap-4 mb-4">
        <img 
          src={slot.location.image} 
          alt={slot.location.name}
          className="w-40 h-40 rounded-lg object-cover shadow-lg"
        />
        <div className="flex-1">
          <h4 className="text-xl font-semibold mb-1">{slot.location.name}</h4>
          <p className="text-sm text-muted-foreground flex items-center gap-1 mb-2">
            <MapPin className="h-3 w-3" />
            {slot.location.city}, {slot.location.country}
          </p>
          <p className="text-sm mb-2 line-clamp-2">{slot.location.description}</p>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <span className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {slot.duration}
            </span>
          </div>
        </div>
      </div>
      <div>
        <h5 className="text-sm font-semibold mb-2 flex items-center gap-2">
          <Camera className="h-4 w-4" />
          Activities
        </h5>
        <ul className="space-y-1">
          {slot.activities.map((activity: string, i: number) => (
            <li key={i} className={`text-sm text-muted-foreground flex items-center gap-2`}>
              <span className={`w-1.5 h-1.5 rounded-full bg-${color}-500`}></span>
              {activity}
            </li>
          ))}
        </ul>
        {slot.notes && (
          <p className="text-sm text-muted-foreground mt-3 italic">{slot.notes}</p>
        )}
      </div>
      {meal && (
        <div className="mt-3 p-3 bg-muted/50 rounded-lg">
          <p className="text-sm font-medium flex items-center gap-2">
            <Utensils className="h-4 w-4" />
            {meal}
          </p>
        </div>
      )}
    </div>
  );

  return (
    <div className="min-h-screen pt-16">
      {/* Desktop: Vertical Layout (Map above, Details below) */}
      <div className="hidden md:block">
        {/* Map Section - Full Width */}
        <div className="h-[50vh] w-full">
          <ItineraryFlatMap 
            days={aiItinerary.days}
            highlightedLocation={highlightedLocation}
            onLocationClick={setHighlightedLocation}
          />
        </div>

        {/* Itinerary Details Section */}
        <div className="overflow-y-auto bg-background">
          <div className="max-w-7xl mx-auto p-6 space-y-6">
            {/* Header */}
            <div>
              <h1 className="text-3xl font-bold mb-2">Your AI Itinerary</h1>
              <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
                <span>{aiItinerary.days.length} days</span>
                {searchParams && (
                  <>
                    <span>•</span>
                    <span>
                      {searchParams.adults + searchParams.children + searchParams.infants} travelers
                    </span>
                  </>
                )}
              </div>
            </div>

            {/* Budget Card */}
            <Card className="p-4 bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
              <div className="flex items-center gap-2 mb-3">
                <DollarSign className="h-4 w-4 text-primary" />
                <h3 className="font-semibold">Total Budget</h3>
              </div>
              <p className="text-2xl font-bold text-primary mb-2">
                {currencySymbol}{totalBudget.total.toLocaleString()}
              </p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
                <div>
                  <p className="text-muted-foreground">Accommodation</p>
                  <p className="font-medium">{currencySymbol}{totalBudget.accommodation.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Food</p>
                  <p className="font-medium">{currencySymbol}{totalBudget.food.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Activities</p>
                  <p className="font-medium">{currencySymbol}{totalBudget.activities.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Transport</p>
                  <p className="font-medium">{currencySymbol}{totalBudget.transport.toLocaleString()}</p>
                </div>
              </div>
            </Card>

            {/* Days */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {aiItinerary.days.map((day) => (
                <Card key={day.dayNumber} className="overflow-hidden">
                  <div className="bg-primary text-primary-foreground p-4">
                    <h2 className="text-xl font-bold">Day {day.dayNumber}</h2>
                    <p className="text-sm text-primary-foreground/80">{day.date}</p>
                  </div>
                  <div className="p-4 space-y-4">
                    <TimeSlotCard 
                      slot={day.timeSlots.morning} 
                      color="amber" 
                      timeLabel="Morning"
                      meal={day.meals.breakfast}
                    />
                    <TimeSlotCard 
                      slot={day.timeSlots.afternoon} 
                      color="blue" 
                      timeLabel="Afternoon"
                      meal={day.meals.lunch}
                    />
                    <TimeSlotCard 
                      slot={day.timeSlots.evening} 
                      color="purple" 
                      timeLabel="Evening"
                      meal={day.meals.dinner}
                    />
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Mobile: Map with Draggable Sheet */}
      <div className="md:hidden h-[calc(100vh-4rem)] relative">
        {/* Full Screen Map */}
        <div className="absolute inset-0">
          <ItineraryFlatMap 
            days={aiItinerary.days}
            highlightedLocation={highlightedLocation}
            onLocationClick={setHighlightedLocation}
          />
        </div>

        {/* Floating Button to Open Itinerary */}
        <Button
          onClick={() => setIsMobileSheetOpen(true)}
          className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10 gap-2 shadow-lg"
          size="lg"
        >
          <Calendar className="h-4 w-4" />
          View Itinerary
          <ChevronDown className="h-4 w-4" />
        </Button>

        {/* Draggable Sheet */}
        <Sheet open={isMobileSheetOpen} onOpenChange={setIsMobileSheetOpen}>
          <SheetContent side="bottom" className="h-[85vh] p-0">
            <div className="h-full overflow-y-auto">
              <SheetHeader className="p-6 pb-4 border-b sticky top-0 bg-background z-10">
                <div className="flex items-center justify-between">
                  <div>
                    <SheetTitle className="text-2xl">Your AI Itinerary</SheetTitle>
                    <p className="text-sm text-muted-foreground mt-1">
                      {aiItinerary.days.length} days • {currencySymbol}{totalBudget.total.toLocaleString()}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setIsMobileSheetOpen(false)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </SheetHeader>

              <div className="p-4 space-y-4">
                {aiItinerary.days.map((day) => (
                  <Card key={day.dayNumber} className="overflow-hidden">
                    <div className="bg-primary text-primary-foreground p-4">
                      <h2 className="text-xl font-bold">Day {day.dayNumber}</h2>
                      <p className="text-sm text-primary-foreground/80">{day.date}</p>
                    </div>
                    <div className="p-4 space-y-4">
                      <TimeSlotCard 
                        slot={day.timeSlots.morning} 
                        color="amber" 
                        timeLabel="Morning"
                        meal={day.meals.breakfast}
                      />
                      <TimeSlotCard 
                        slot={day.timeSlots.afternoon} 
                        color="blue" 
                        timeLabel="Afternoon"
                        meal={day.meals.lunch}
                      />
                      <TimeSlotCard 
                        slot={day.timeSlots.evening} 
                        color="purple" 
                        timeLabel="Evening"
                        meal={day.meals.dinner}
                      />
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </div>
  );
};

export default ItineraryView;
