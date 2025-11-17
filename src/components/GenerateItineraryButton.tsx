import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useTrip } from '@/contexts/TripContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Loader2, Route, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const GenerateItineraryButton = () => {
  const { savedLocations, setAIItinerary, searchParams } = useTrip();
  const [isGenerating, setIsGenerating] = useState(false);
  const navigate = useNavigate();

  const handleGenerateItinerary = async () => {
    if (savedLocations.length < 2) {
      toast.error('Add at least 2 locations to generate an itinerary');
      return;
    }

    setIsGenerating(true);
    
    try {
      toast.info('Generating AI-powered itinerary...', { duration: 3000 });

      const { data, error } = await supabase.functions.invoke('generate-ai-itinerary', {
        body: { 
          locations: savedLocations,
          searchParams 
        },
      });

      if (error) throw error;

      if (data?.success && data.itinerary) {
        setAIItinerary(data.itinerary);
        const totalDays = data.itinerary.days.length;
        toast.success(
          `✨ AI-powered ${totalDays}-day itinerary created with personalized scheduling!`,
          { duration: 5000 }
        );
        navigate('/itinerary');
      } else {
        throw new Error('Invalid response from AI');
      }
    } catch (error) {
      console.error('Error generating itinerary:', error);
      toast.error('Failed to generate itinerary. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  if (savedLocations.length === 0) return null;

  return (
    <Button
      onClick={handleGenerateItinerary}
      disabled={isGenerating || savedLocations.length < 2}
      className="gap-2"
      size="lg"
    >
      {isGenerating ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin" />
          AI Planning...
        </>
      ) : (
        <>
          <Sparkles className="h-4 w-4" />
          Generate AI Itinerary
          {savedLocations.length > 0 && ` (${savedLocations.length} places)`}
        </>
      )}
    </Button>
  );
};
