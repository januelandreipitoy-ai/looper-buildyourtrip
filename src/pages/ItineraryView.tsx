import { useState, useEffect } from 'react';
import { useTrip } from '@/contexts/TripContext';
import OSRMItineraryMap from '@/components/OSRMItineraryMap';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { MapPin, Clock, Navigation, Utensils, Download, Calendar } from 'lucide-react';
import { generateItineraryPDF } from '@/utils/pdfExport';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useNavigate } from 'react-router-dom';

const ItineraryView = () => {
  const { aiItinerary, savedLocations, searchParams } = useTrip();
  const navigate = useNavigate();
  const [highlightedLocation, setHighlightedLocation] = useState<string | undefined>();
  const [isMobileSheetOpen, setIsMobileSheetOpen] = useState(false);
  const [selectedDay, setSelectedDay] = useState<number>(1);

  if (savedLocations.length === 0) {
    return (
      <div className="min-h-screen pt-20 px-4">
        <div className="max-w-4xl mx-auto text-center py-20">
          <Calendar className="h-20 w-20 mx-auto mb-6 text-muted-foreground" />
          <h2 className="text-3xl font-bold mb-4">No Locations Saved</h2>
          <p className="text-muted-foreground mb-8">
            Start by saving some locations from the Explore page.
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
            You have saved locations. Now generate your AI itinerary!
          </p>
          <Button onClick={() => navigate('/map')}>
            Go to Map
          </Button>
        </div>
      </div>
    );
  }

  const currentDay = aiItinerary.days.find(day => day.dayNumber === selectedDay) || aiItinerary.days[0];
  const timeSlots = [
    { period: 'Morning', slot: currentDay.timeSlots.morning },
    { period: 'Afternoon', slot: currentDay.timeSlots.afternoon },
    { period: 'Evening', slot: currentDay.timeSlots.evening }
  ];

  const handleDownloadPDF = () => {
    const tripTitle = searchParams?.destination || 'My Trip';
    generateItineraryPDF(aiItinerary, tripTitle);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Desktop View */}
      <div className="hidden md:block">
        {/* Day Selector Header */}
        <div className="bg-card border-b border-border p-4 sticky top-16 z-10">
          <div className="container mx-auto">
            <div className="flex items-center justify-between mb-4">
              <h1 className="text-2xl font-bold text-foreground">
                {searchParams?.destination || 'Your Itinerary'}
              </h1>
              <Button onClick={handleDownloadPDF} variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Download PDF
              </Button>
            </div>
            <ScrollArea className="w-full">
              <div className="flex gap-2 pb-2">
                {aiItinerary.days.map((day) => (
                  <Button
                    key={day.dayNumber}
                    onClick={() => setSelectedDay(day.dayNumber)}
                    variant={selectedDay === day.dayNumber ? 'default' : 'outline'}
                    size="lg"
                    className="whitespace-nowrap min-w-[120px]"
                  >
                    Day {day.dayNumber}
                  </Button>
                ))}
              </div>
            </ScrollArea>
          </div>
        </div>

        {/* Map */}
        <div className="h-[50vh] w-full">
          <OSRMItineraryMap
            day={currentDay}
            highlightedLocation={highlightedLocation}
            onLocationClick={(name) => setHighlightedLocation(name)}
          />
        </div>

        {/* Itinerary List */}
        <div className="container mx-auto px-4 py-8">
          <div className="space-y-6">
            {timeSlots.map(({ period, slot }, index) => {
              if (!slot || !slot.location) return null;

              return (
                <Card
                  key={index}
                  className="overflow-hidden cursor-pointer transition-all hover:shadow-lg"
                  onMouseEnter={() => setHighlightedLocation(slot.location.name)}
                  onMouseLeave={() => setHighlightedLocation(undefined)}
                >
                  <div className="flex flex-col md:flex-row">
                    {/* Image */}
                    {slot.location.image && (
                      <div className="md:w-48 h-48 md:h-auto overflow-hidden">
                        <img
                          src={slot.location.image}
                          alt={slot.location.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}

                    {/* Content */}
                    <div className="flex-1 p-6">
                      {/* Header */}
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-bold text-sm">
                              {index + 1}
                            </span>
                            <h3 className="text-xl font-bold text-foreground">
                              {slot.location.name}
                            </h3>
                          </div>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Clock className="h-4 w-4" />
                              {period} • {slot.time}
                            </span>
                            <span className="flex items-center gap-1">
                              <Navigation className="h-4 w-4" />
                              {slot.transportMode || 'Walk'}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Activities */}
                      {slot.activities && slot.activities.length > 0 && (
                        <div className="mb-3">
                          <h4 className="text-sm font-semibold text-foreground mb-2">Activities:</h4>
                          <ul className="list-disc list-inside space-y-1">
                            {slot.activities.map((activity, i) => (
                              <li key={i} className="text-sm text-muted-foreground">{activity}</li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {/* Duration & Travel */}
                      <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
                        {slot.duration && (
                          <span>Duration: {slot.duration}</span>
                        )}
                        {slot.travelTime && (
                          <span>Travel time: {slot.travelTime}</span>
                        )}
                      </div>

                      {/* Notes */}
                      {slot.notes && (
                        <div className="flex items-start gap-2 text-sm text-muted-foreground bg-accent/10 rounded-lg p-3">
                          <Utensils className="h-4 w-4 flex-shrink-0 mt-0.5" />
                          <span>{slot.notes}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      </div>

      {/* Mobile View */}
      <div className="md:hidden h-screen relative">
        {/* Day Selector */}
        <div className="absolute top-0 left-0 right-0 bg-card/95 backdrop-blur-sm border-b border-border p-4 z-10">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-bold text-foreground">
              {searchParams?.destination || 'Itinerary'}
            </h2>
            <Button onClick={handleDownloadPDF} variant="outline" size="sm">
              <Download className="h-4 w-4" />
            </Button>
          </div>
          <ScrollArea className="w-full">
            <div className="flex gap-2">
              {aiItinerary.days.map((day) => (
                <Button
                  key={day.dayNumber}
                  onClick={() => setSelectedDay(day.dayNumber)}
                  variant={selectedDay === day.dayNumber ? 'default' : 'outline'}
                  size="sm"
                  className="whitespace-nowrap"
                >
                  Day {day.dayNumber}
                </Button>
              ))}
            </div>
          </ScrollArea>
        </div>

        {/* Map */}
        <div className="h-full pt-28">
          <OSRMItineraryMap
            day={currentDay}
            highlightedLocation={highlightedLocation}
            onLocationClick={(name) => setHighlightedLocation(name)}
          />
        </div>

        {/* Bottom Sheet */}
        <Sheet open={isMobileSheetOpen} onOpenChange={setIsMobileSheetOpen}>
          <SheetTrigger asChild>
            <Button
              className="fixed bottom-8 left-1/2 -translate-x-1/2 z-20 shadow-xl"
              size="lg"
            >
              View Itinerary
            </Button>
          </SheetTrigger>
          <SheetContent side="bottom" className="h-[80vh]">
            <div className="overflow-y-auto h-full py-4">
              <h2 className="text-2xl font-bold mb-6">Day {selectedDay}</h2>

              {/* Itinerary for Selected Day */}
              <div className="space-y-4">
                {timeSlots.map(({ period, slot }, index) => {
                  if (!slot || !slot.location) return null;

                  return (
                    <Card
                      key={index}
                      className="overflow-hidden"
                      onClick={() => setHighlightedLocation(slot.location.name)}
                    >
                      {slot.location.image && (
                        <img
                          src={slot.location.image}
                          alt={slot.location.name}
                          className="w-full h-32 object-cover"
                        />
                      )}
                      <CardContent className="p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-bold text-xs">
                            {index + 1}
                          </span>
                          <h3 className="font-bold text-foreground">
                            {slot.location.name}
                          </h3>
                        </div>
                        <div className="flex items-center gap-3 text-xs text-muted-foreground mb-2">
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {period} • {slot.time}
                          </span>
                          <span className="flex items-center gap-1">
                            <Navigation className="h-3 w-3" />
                            {slot.transportMode || 'Walk'}
                          </span>
                        </div>
                        {slot.activities && slot.activities.length > 0 && (
                          <ul className="list-disc list-inside text-xs text-muted-foreground space-y-1">
                            {slot.activities.slice(0, 2).map((activity, i) => (
                              <li key={i}>{activity}</li>
                            ))}
                          </ul>
                        )}
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </div>
  );
};

export default ItineraryView;
