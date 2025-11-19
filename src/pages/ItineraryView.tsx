import { useState } from 'react';
import { useTrip, DayItinerary } from '@/contexts/TripContext';
import OSRMItineraryMap from '@/components/OSRMItineraryMap';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { MapPin, Clock, Navigation, Utensils, Download, Calendar, MessageCircle, ExternalLink } from 'lucide-react';
import { generateItineraryPDF } from '@/utils/pdfExport';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useNavigate } from 'react-router-dom';
import { ItineraryAISidebar } from '@/components/ItineraryAISidebar';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, useSortable, horizontalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface SortableDayButtonProps {
  day: DayItinerary;
  isSelected: boolean;
  onClick: () => void;
}

function SortableDayButton({ day, isSelected, onClick }: SortableDayButtonProps) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: day.dayNumber.toString() });
  const style = { transform: CSS.Transform.toString(transform), transition };

  return (
    <button 
      ref={setNodeRef} 
      style={style} 
      {...attributes} 
      {...listeners} 
      onClick={onClick} 
      className={`px-6 py-2 rounded-2xl font-medium transition-all duration-200 hover:scale-105 active:scale-95 min-w-[120px] cursor-grab active:cursor-grabbing ${
        isSelected 
          ? 'bg-primary text-primary-foreground shadow-lg' 
          : 'bg-muted text-foreground hover:bg-muted/80'
      }`}
    >
      Day {day.dayNumber}
    </button>
  );
}

const ItineraryView = () => {
  const { aiItinerary, setAIItinerary, savedLocations, searchParams } = useTrip();
  const navigate = useNavigate();
  const [highlightedLocation, setHighlightedLocation] = useState<string | undefined>();
  const [isMobileSheetOpen, setIsMobileSheetOpen] = useState(false);
  const [selectedDay, setSelectedDay] = useState<number>(1);
  const [isAISidebarOpen, setIsAISidebarOpen] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const sensors = useSensors(useSensor(PointerSensor), useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }));

  if (savedLocations.length === 0) {
    return (
      <div className="min-h-screen pt-20 px-4">
        <div className="max-w-4xl mx-auto text-center py-20">
          <Calendar className="h-20 w-20 mx-auto mb-6 text-muted-foreground" />
          <h2 className="text-3xl font-bold mb-4">No Locations Saved</h2>
          <p className="text-muted-foreground mb-8">Start by saving some locations from the Explore page.</p>
          <Button onClick={() => navigate('/explore')}>Explore Destinations</Button>
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
          <p className="text-muted-foreground mb-8">You have saved locations. Now generate your AI itinerary!</p>
          <Button onClick={() => navigate('/map')}>Go to Map</Button>
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

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = aiItinerary.days.findIndex(day => day.dayNumber.toString() === active.id);
      const newIndex = aiItinerary.days.findIndex(day => day.dayNumber.toString() === over.id);
      const newDays = arrayMove(aiItinerary.days, oldIndex, newIndex);
      const renumberedDays = newDays.map((day, index) => ({ ...day, dayNumber: index + 1 }));
      setAIItinerary({ ...aiItinerary, days: renumberedDays });
      const movedDay = aiItinerary.days[oldIndex];
      if (movedDay.dayNumber === selectedDay) setSelectedDay(newIndex + 1);
    }
  };

  const handleDaySelect = (dayNumber: number) => {
    if (dayNumber !== selectedDay) {
      setIsTransitioning(true);
      setTimeout(() => {
        setSelectedDay(dayNumber);
        setIsTransitioning(false);
      }, 150);
    }
  };

  const getBookingUrl = (locationName: string) => `https://www.google.com/search?q=${encodeURIComponent(locationName + ' booking')}`;
  const requiresBooking = (tags?: string[]) => tags?.some(tag => ['Activities & Attractions', 'Tours', 'Museums'].includes(tag)) || false;

  return (
    <div className="min-h-screen bg-background">
      <Button onClick={() => setIsAISidebarOpen(true)} className="fixed bottom-6 right-6 z-50 rounded-full w-14 h-14 shadow-lg" size="icon">
        <MessageCircle className="h-6 w-6" />
      </Button>
      <ItineraryAISidebar isOpen={isAISidebarOpen} onClose={() => setIsAISidebarOpen(false)} />

      <div className="hidden md:block">
        <div className="bg-card border-b p-4 sticky top-16 z-10">
          <div className="container mx-auto">
            <div className="flex items-center justify-between mb-4">
              <h1 className="text-2xl font-bold">{searchParams?.destination || 'Your Itinerary'}</h1>
              <Button onClick={handleDownloadPDF} variant="outline" size="sm"><Download className="h-4 w-4 mr-2" />Download PDF</Button>
            </div>
            <ScrollArea className="w-full">
              <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                <SortableContext items={aiItinerary.days.map(d => d.dayNumber.toString())} strategy={horizontalListSortingStrategy}>
                  <div className="flex gap-2 pb-2">{aiItinerary.days.map(day => <SortableDayButton key={day.dayNumber} day={day} isSelected={selectedDay === day.dayNumber} onClick={() => handleDaySelect(day.dayNumber)} />)}</div>
                </SortableContext>
              </DndContext>
            </ScrollArea>
          </div>
        </div>
        <div className="h-[50vh] w-full"><OSRMItineraryMap day={currentDay} highlightedLocation={highlightedLocation} onLocationClick={setHighlightedLocation} /></div>
        <div className={`container mx-auto p-6 transition-opacity duration-300 ${isTransitioning ? 'opacity-0' : 'opacity-100'}`}>
          <h2 className="text-2xl font-bold mb-6">Day {selectedDay} Itinerary</h2>
          <div className="grid gap-6">
            {timeSlots.map(({ period, slot }, index) => {
              if (!slot?.location) return null;
              return (
                <Card key={index} className="overflow-hidden hover:shadow-lg transition-shadow" onMouseEnter={() => setHighlightedLocation(slot.location.name)} onMouseLeave={() => setHighlightedLocation(undefined)}>
                  <div className="flex">{slot.location.image && <img src={slot.location.image} alt={slot.location.name} className="w-1/3 h-48 object-cover" />}
                    <CardContent className="flex-1 p-6">
                      <div className="flex items-center gap-3 mb-3">
                        <span className="w-10 h-10 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-bold">{index + 1}</span>
                        <div><h3 className="text-xl font-bold">{slot.location.name}</h3>
                          {requiresBooking(slot.location.tags) && <Button variant="link" size="sm" className="p-0 h-auto" asChild><a href={getBookingUrl(slot.location.name)} target="_blank" rel="noopener noreferrer">Book Now <ExternalLink className="h-3 w-3 ml-1" /></a></Button>}
                        </div>
                      </div>
                      <div className="flex gap-4 text-sm text-muted-foreground mb-4">
                        <span className="flex items-center gap-2"><Clock className="h-4 w-4" />{period} • {slot.time}</span>
                        {slot.transportMode && <span className="flex items-center gap-2"><Navigation className="h-4 w-4" />{slot.transportMode}</span>}
                      </div>
                      {slot.activities?.length > 0 && <div className="mb-4"><h4 className="font-semibold mb-2 flex items-center gap-2"><Utensils className="h-4 w-4" />Activities</h4><ul className="list-disc list-inside text-sm space-y-1">{slot.activities.map((activity, i) => <li key={i}>{activity}</li>)}</ul></div>}
                    </CardContent>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      </div>

      <div className="md:hidden min-h-screen flex flex-col pt-16">
        <div className="sticky top-16 bg-card border-b p-3 z-10">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-lg font-bold">{searchParams?.destination || 'Itinerary'}</h2>
            <Button onClick={handleDownloadPDF} variant="outline" size="sm"><Download className="h-4 w-4" /></Button>
          </div>
          <ScrollArea className="w-full"><div className="flex gap-2">{aiItinerary.days.map(day => <Button key={day.dayNumber} onClick={() => handleDaySelect(day.dayNumber)} variant={selectedDay === day.dayNumber ? 'default' : 'outline'} size="sm" className="whitespace-nowrap">Day {day.dayNumber}</Button>)}</div></ScrollArea>
        </div>
        <div className="flex-1"><OSRMItineraryMap day={currentDay} highlightedLocation={highlightedLocation} onLocationClick={setHighlightedLocation} /></div>
        <Sheet open={isMobileSheetOpen} onOpenChange={setIsMobileSheetOpen}>
          <SheetTrigger asChild><Button className="fixed bottom-20 left-1/2 -translate-x-1/2 z-20 shadow-xl" size="lg">View Itinerary</Button></SheetTrigger>
          <SheetContent side="bottom" className="h-[75vh]"><ScrollArea className="h-full px-4 py-4"><h2 className="text-xl font-bold mb-4">Day {selectedDay}</h2><div className="space-y-3">{timeSlots.map(({ period, slot }, index) => { if (!slot?.location) return null; return (<Card key={index} onClick={() => setHighlightedLocation(slot.location.name)}>{slot.location.image && <img src={slot.location.image} alt={slot.location.name} className="w-full h-32 object-cover" />}<CardContent className="p-4"><div className="flex items-center gap-2 mb-2"><span className="w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-xs font-bold">{index + 1}</span><h3 className="font-bold text-sm">{slot.location.name}</h3></div><div className="text-xs text-muted-foreground"><Clock className="h-3 w-3 inline mr-1" />{period} • {slot.time}</div></CardContent></Card>);})}</div></ScrollArea></SheetContent>
        </Sheet>
      </div>
    </div>
  );
};

export default ItineraryView;