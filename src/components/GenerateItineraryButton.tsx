import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useTrip, SavedLocation } from '@/contexts/TripContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Loader2, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface GenerateItineraryButtonProps {
  locations?: SavedLocation[];
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  className?: string;
  fullWidth?: boolean;
  label?: string;
}

export const GenerateItineraryButton = ({ 
  locations, 
  variant = 'default',
  size = 'lg',
  className = '',
  fullWidth = false,
  label
}: GenerateItineraryButtonProps) => {
  const { savedLocations, setAIItinerary, searchParams } = useTrip();
  const [isGenerating, setIsGenerating] = useState(false);
  const navigate = useNavigate();

  const locationsToUse = locations || savedLocations;

  const handleGenerateItinerary = async () => {
    if (locationsToUse.length < 2) {
      toast.error('Add at least 2 locations to generate an itinerary');
      return;
    }

    if (!searchParams?.destination || !searchParams?.startDate || !searchParams?.endDate) {
      toast.error('Please complete your search with destination and dates first');
      return;
    }

    setIsGenerating(true);
    
    try {
      toast.info('Generating AI-powered itinerary...', { duration: 3000 });

      const { data, error } = await supabase.functions.invoke('generate-ai-itinerary', {
        body: { 
          locations: locationsToUse,
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

  if (locationsToUse.length === 0) return null;

  const buttonLabel = label || `Generate AI Itinerary${locationsToUse.length > 0 ? ` (${locationsToUse.length} places)` : ''}`;

  return (
    <Button
      onClick={handleGenerateItinerary}
      disabled={isGenerating || locationsToUse.length < 2}
      className={`gap-2 ${fullWidth ? 'w-full' : ''} ${className}`}
      variant={variant}
      size={size}
    >
      {isGenerating ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin" />
          AI Planning...
        </>
      ) : (
        <>
          <Sparkles className="h-4 w-4" />
          {buttonLabel}
        </>
      )}
    </Button>
  );
};
