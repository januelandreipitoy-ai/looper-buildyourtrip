import { SavedLocation } from '@/contexts/TripContext';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Badge } from '@/components/ui/badge';
import { MapPin, Clock, Tag } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';

interface DestinationDetailPopupProps {
  location: SavedLocation | null;
  isOpen: boolean;
  onClose: () => void;
}

export const DestinationDetailPopup = ({ location, isOpen, onClose }: DestinationDetailPopupProps) => {
  if (!location) return null;

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent side="right" className="w-[400px] sm:w-[540px] animate-slide-in-right">
        <SheetHeader>
          <SheetTitle className="text-2xl font-bold">{location.name}</SheetTitle>
        </SheetHeader>
        
        <ScrollArea className="h-[calc(100vh-8rem)] mt-6">
          <div className="space-y-6">
            {/* Image */}
            {location.image && (
              <div className="relative aspect-video w-full overflow-hidden rounded-2xl">
                <img 
                  src={location.image} 
                  alt={location.name}
                  className="w-full h-full object-cover"
                />
              </div>
            )}

            {/* Location */}
            <div className="flex items-start gap-2 text-muted-foreground">
              <MapPin className="h-5 w-5 mt-0.5 flex-shrink-0" />
              <p>{location.description}</p>
            </div>

            {/* Type/Category */}
            <div className="flex items-center gap-2">
              <Tag className="h-5 w-5 text-muted-foreground" />
              <Badge variant="secondary" className="rounded-full">
                {location.type}
              </Badge>
            </div>

            {/* Tags */}
            {location.tags && location.tags.length > 0 && (
              <div>
                <h3 className="font-semibold mb-2 flex items-center gap-2">
                  <Tag className="h-4 w-4" />
                  Tags
                </h3>
                <div className="flex flex-wrap gap-2">
                  {location.tags.map((tag, index) => (
                    <Badge key={index} variant="outline" className="rounded-full">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Coordinates */}
            <div className="p-4 bg-muted/50 rounded-2xl space-y-2">
              <h3 className="font-semibold">Location Details</h3>
              <p className="text-sm text-muted-foreground">
                Latitude: {location.lat.toFixed(6)}
              </p>
              <p className="text-sm text-muted-foreground">
                Longitude: {location.lng.toFixed(6)}
              </p>
            </div>
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
};
