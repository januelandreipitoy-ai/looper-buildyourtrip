import { useState } from 'react';
import { useTrip, SavedLocation } from '@/contexts/TripContext';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Heart, Trash2, Plus, ChevronDown, ChevronRight, Edit2, Check, X, Sparkles } from 'lucide-react';
import { toast } from 'sonner';
import { GenerateItineraryButton } from '@/components/GenerateItineraryButton';
import { HeartButton } from '@/components/HeartButton';
import { DestinationDetailPopup } from '@/components/DestinationDetailPopup';
import { useIsMobile } from '@/hooks/use-mobile';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface FavoritesPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export const FavoritesPanel = ({ isOpen, onClose }: FavoritesPanelProps) => {
  const { 
    savedLocations, 
    removeLocation, 
    bookmarks, 
    addBookmark, 
    removeBookmark, 
    renameBookmark,
    addLocationToBookmark,
    removeLocationFromBookmark,
    clearAllSavedLocations
  } = useTrip();
  
  const isMobile = useIsMobile();
  const [expandedBookmarks, setExpandedBookmarks] = useState<Set<string>>(new Set());
  const [editingBookmarkId, setEditingBookmarkId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');
  const [newBookmarkName, setNewBookmarkName] = useState('');
  const [showClearDialog, setShowClearDialog] = useState(false);
  const [draggedLocation, setDraggedLocation] = useState<SavedLocation | null>(null);
  const [selectedLocation, setSelectedLocation] = useState<SavedLocation | null>(null);
  const [isDetailPopupOpen, setIsDetailPopupOpen] = useState(false);
  const [showAddToBookmark, setShowAddToBookmark] = useState<string | null>(null);

  const toggleBookmark = (id: string) => {
    const newExpanded = new Set(expandedBookmarks);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedBookmarks(newExpanded);
  };

  const handleAddBookmark = () => {
    if (newBookmarkName.trim()) {
      addBookmark(newBookmarkName.trim());
      setNewBookmarkName('');
      toast.success('Bookmark created');
    }
  };

  const handleRenameBookmark = (id: string) => {
    if (editingName.trim()) {
      renameBookmark(id, editingName.trim());
      setEditingBookmarkId(null);
      setEditingName('');
      toast.success('Bookmark renamed');
    }
  };

  const handleDeleteBookmark = (id: string) => {
    removeBookmark(id);
    toast.success('Bookmark deleted');
  };

  const handleDragStart = (location: SavedLocation) => {
    setDraggedLocation(location);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDropOnBookmark = (bookmarkId: string) => {
    if (draggedLocation) {
      const bookmark = bookmarks.find(b => b.id === bookmarkId);
      if (bookmark && !bookmark.locationIds.includes(draggedLocation.id)) {
        addLocationToBookmark(bookmarkId, draggedLocation.id);
        toast.success('Added to bookmark');
      }
      setDraggedLocation(null);
    }
  };

  const handleClearAll = () => {
    clearAllSavedLocations();
    setShowClearDialog(false);
    toast.success('All favorites cleared');
  };

  const unbookmarkedLocations = savedLocations.filter(
    loc => !bookmarks.some(b => b.locationIds.includes(loc.id))
  );

  return (
    <>
      <Sheet open={isOpen} onOpenChange={onClose}>
        <SheetContent side="right" className="w-[400px] sm:w-[540px]">
          <SheetHeader>
            <SheetTitle className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Heart className="h-5 w-5 text-primary" />
                Favorites ({savedLocations.length})
              </div>
              <Button 
                variant="destructive" 
                size="sm"
                onClick={() => setShowClearDialog(true)}
                disabled={savedLocations.length === 0}
              >
                Clear All
              </Button>
            </SheetTitle>
          </SheetHeader>

          <ScrollArea className="h-[calc(100vh-8rem)] mt-4">
            <div className="space-y-4 pr-4">
              {/* Add Bookmark Section */}
              <Card className="p-4">
                <div className="flex gap-2">
                  <Input
                    placeholder="New bookmark name..."
                    value={newBookmarkName}
                    onChange={(e) => setNewBookmarkName(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleAddBookmark()}
                  />
                  <Button onClick={handleAddBookmark} size="icon">
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </Card>

              {/* Bookmarks */}
              {bookmarks.map(bookmark => (
                <Card 
                  key={bookmark.id} 
                  className="p-4"
                  onDragOver={handleDragOver}
                  onDrop={() => handleDropOnBookmark(bookmark.id)}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2 flex-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={() => toggleBookmark(bookmark.id)}
                      >
                        {expandedBookmarks.has(bookmark.id) ? (
                          <ChevronDown className="h-4 w-4" />
                        ) : (
                          <ChevronRight className="h-4 w-4" />
                        )}
                      </Button>
                      
                      {editingBookmarkId === bookmark.id ? (
                        <div className="flex items-center gap-2 flex-1">
                          <Input
                            value={editingName}
                            onChange={(e) => setEditingName(e.target.value)}
                            className="h-8"
                            autoFocus
                            onKeyPress={(e) => e.key === 'Enter' && handleRenameBookmark(bookmark.id)}
                          />
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6"
                            onClick={() => handleRenameBookmark(bookmark.id)}
                          >
                            <Check className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6"
                            onClick={() => {
                              setEditingBookmarkId(null);
                              setEditingName('');
                            }}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                       ) : (
                        <>
                          <h3 className="font-semibold">{bookmark.name}</h3>
                          <span className="text-sm text-muted-foreground">
                            ({bookmark.locationIds.length})
                          </span>
                        </>
                      )}
                    </div>
                    
                    {editingBookmarkId !== bookmark.id && (
                      <div className="flex gap-1">
                        {/* Generate Itinerary for Bookmark */}
                        {bookmark.locationIds.length >= 2 && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6"
                            onClick={() => {
                              const bookmarkLocations = savedLocations.filter(loc => bookmark.locationIds.includes(loc.id));
                              // Trigger generate itinerary with bookmark locations
                            }}
                            title="Generate itinerary for this bookmark"
                          >
                            <Sparkles className="h-3 w-3" />
                          </Button>
                        )}
                        
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6"
                          onClick={() => {
                            setEditingBookmarkId(bookmark.id);
                            setEditingName(bookmark.name);
                          }}
                        >
                          <Edit2 className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6"
                          onClick={() => handleDeleteBookmark(bookmark.id)}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    )}
                  </div>

                    <div className="space-y-2 mt-2 ml-8">
                      {bookmark.locationIds.map(locId => {
                        const location = savedLocations.find(l => l.id === locId);
                        if (!location) return null;
                        return (
                          <Card 
                            key={location.id} 
                            className="p-2 cursor-pointer hover:shadow-md transition-all"
                            onClick={() => {
                              setSelectedLocation(location);
                              setIsDetailPopupOpen(true);
                            }}
                          >
                            <div className="flex items-center gap-2">
                              <img
                                src={location.image}
                                alt={location.name}
                                className="w-12 h-12 rounded object-cover"
                              />
                              <div className="flex-1 min-w-0">
                                <p className="font-medium text-sm truncate">{location.name}</p>
                                <p className="text-xs text-muted-foreground truncate">{location.description}</p>
                              </div>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6 flex-shrink-0"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  removeLocationFromBookmark(bookmark.id, location.id);
                                }}
                              >
                                <X className="h-3 w-3" />
                              </Button>
                            </div>
                          </Card>
                        );
                      })}
                    </div>
                </Card>
              ))}

              {/* Unbookmarked Locations */}
              {unbookmarkedLocations.length > 0 && (
                <div className="space-y-2">
                  <h3 className="font-semibold text-sm text-muted-foreground">Unsorted</h3>
                  {unbookmarkedLocations.map(location => (
                    <Card
                      key={location.id}
                      className="p-3 cursor-pointer hover:shadow-md transition-all"
                      draggable
                      onDragStart={() => handleDragStart(location)}
                      onClick={() => {
                        setSelectedLocation(location);
                        setIsDetailPopupOpen(true);
                      }}
                    >
                      <div className="flex items-center gap-3">
                        <img
                          src={location.image}
                          alt={location.name}
                          className="w-16 h-16 rounded-lg object-cover"
                        />
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold truncate">{location.name}</h4>
                          <p className="text-sm text-muted-foreground truncate">{location.description}</p>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {location.tags.slice(0, 2).map((tag, i) => (
                              <span key={i} className="text-xs bg-muted px-2 py-0.5 rounded">
                                {tag}
                              </span>
                            ))}
                          </div>
                        </div>
                        <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
                          {isMobile && bookmarks.length > 0 && (
                            <div className="relative">
                              <Button
                                size="icon"
                                variant="outline"
                                className="h-8 w-8 rounded-full"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setShowAddToBookmark(showAddToBookmark === location.id ? null : location.id);
                                }}
                              >
                                <Plus className="h-4 w-4" />
                              </Button>
                              {showAddToBookmark === location.id && (
                                <div className="absolute right-0 top-10 bg-popover border rounded-lg shadow-lg p-2 z-50 min-w-[150px]">
                                  {bookmarks.map(bookmark => (
                                    <Button
                                      key={bookmark.id}
                                      variant="ghost"
                                      size="sm"
                                      className="w-full justify-start"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        addLocationToBookmark(bookmark.id, location.id);
                                        setShowAddToBookmark(null);
                                        toast.success('Added to bookmark');
                                      }}
                                    >
                                      {bookmark.name}
                                    </Button>
                                  ))}
                                </div>
                              )}
                            </div>
                          )}
                          <HeartButton 
                            isSaved={true}
                            onClick={() => removeLocation(location.id)}
                          />
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              )}

              {savedLocations.length === 0 && (
                <div className="text-center py-12 text-muted-foreground">
                  <Heart className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No saved locations yet</p>
                  <p className="text-sm">Start exploring to add favorites</p>
                </div>
              )}
              
              {/* Generate Itinerary Button */}
              {savedLocations.length > 0 && (
                <div className="sticky bottom-0 bg-background border-t border-border p-4 mt-4">
                  <GenerateItineraryButton fullWidth />
                </div>
              )}
            </div>
          </ScrollArea>
        </SheetContent>
      </Sheet>

      <AlertDialog open={showClearDialog} onOpenChange={setShowClearDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Clear all favorites?</AlertDialogTitle>
            <AlertDialogDescription>
              This will remove all saved locations and bookmarks. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleClearAll}>Clear All</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <DestinationDetailPopup 
        location={selectedLocation}
        isOpen={isDetailPopupOpen}
        onClose={() => setIsDetailPopupOpen(false)}
      />
    </>
  );
};