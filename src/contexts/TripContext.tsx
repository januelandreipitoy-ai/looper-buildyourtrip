import React, { createContext, useContext, useState, useEffect } from 'react';

export interface SavedLocation {
  id: string;
  name: string;
  image: string;
  description: string;
  tags: string[];
  lat: number;
  lng: number;
  type: string;
  city?: string;
  country?: string;
  nearby?: Array<{
    name: string;
    type: string;
    distance: string;
  }>;
}

export interface TimeSlot {
  time: string;
  location: SavedLocation;
  activities: string[];
  duration: string;
  travelTime?: string;
  transportMode?: string;
  notes?: string;
}

export interface DayItinerary {
  dayNumber: number;
  date: string;
  timeSlots: {
    morning: TimeSlot;
    afternoon: TimeSlot;
    evening: TimeSlot;
  };
  meals: {
    breakfast: string;
    lunch: string;
    dinner: string;
  };
}

export interface AIItinerary {
  days: DayItinerary[];
  tips: string[];
  estimatedCosts: {
    dailyBudget: number;
    totalBudget: number;
  };
}

export interface ItineraryStop {
  location: SavedLocation;
  order: number;
  duration: string;
  travelTime: string;
  transportMode: string;
  activities: string[];
  day: number;
}

export interface TripSearchParams {
  destination: string;
  city?: string;
  country?: string;
  startDate?: Date;
  endDate?: Date;
  days: number;
  adults: number;
  children: number;
  infants: number;
  pets: number;
}

export interface TripSuggestions {
  locations: SavedLocation[];
  itinerary: AIItinerary;
}

interface TripContextType {
  savedLocations: SavedLocation[];
  itinerary: ItineraryStop[];
  aiItinerary: AIItinerary | null;
  searchParams: TripSearchParams | null;
  tripSuggestions: TripSuggestions | null;
  addLocation: (location: SavedLocation) => void;
  removeLocation: (id: string) => void;
  isLocationSaved: (id: string) => boolean;
  setItinerary: (itinerary: ItineraryStop[]) => void;
  setAIItinerary: (itinerary: AIItinerary | null) => void;
  clearItinerary: () => void;
  setSearchParams: (params: TripSearchParams) => void;
  setTripSuggestions: (suggestions: TripSuggestions | null) => void;
}

const TripContext = createContext<TripContextType | undefined>(undefined);

export const TripProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [savedLocations, setSavedLocations] = useState<SavedLocation[]>(() => {
    const saved = localStorage.getItem('savedLocations');
    return saved ? JSON.parse(saved) : [];
  });

  const [itinerary, setItineraryState] = useState<ItineraryStop[]>(() => {
    const saved = localStorage.getItem('itinerary');
    return saved ? JSON.parse(saved) : [];
  });

  const [aiItinerary, setAIItineraryState] = useState<AIItinerary | null>(() => {
    const saved = localStorage.getItem('aiItinerary');
    return saved ? JSON.parse(saved) : null;
  });

  const [searchParams, setSearchParamsState] = useState<TripSearchParams | null>(() => {
    const saved = localStorage.getItem('tripSearchParams');
    return saved ? JSON.parse(saved) : null;
  });

  const [tripSuggestions, setTripSuggestionsState] = useState<TripSuggestions | null>(() => {
    const saved = localStorage.getItem('tripSuggestions');
    return saved ? JSON.parse(saved) : null;
  });

  useEffect(() => {
    localStorage.setItem('savedLocations', JSON.stringify(savedLocations));
  }, [savedLocations]);

  useEffect(() => {
    localStorage.setItem('itinerary', JSON.stringify(itinerary));
  }, [itinerary]);

  useEffect(() => {
    if (aiItinerary) {
      localStorage.setItem('aiItinerary', JSON.stringify(aiItinerary));
    }
  }, [aiItinerary]);

  useEffect(() => {
    if (searchParams) {
      localStorage.setItem('tripSearchParams', JSON.stringify(searchParams));
    }
  }, [searchParams]);

  useEffect(() => {
    if (tripSuggestions) {
      localStorage.setItem('tripSuggestions', JSON.stringify(tripSuggestions));
    }
  }, [tripSuggestions]);

  const addLocation = (location: SavedLocation) => {
    setSavedLocations(prev => {
      const idx = prev.findIndex(l => l.id === location.id);
      if (idx !== -1) {
        const merged = { ...prev[idx], ...location };
        const next = [...prev];
        next[idx] = merged;
        return next;
      }
      return [...prev, location];
    });
  };

  const removeLocation = (id: string) => {
    setSavedLocations(prev => prev.filter(l => l.id !== id));
  };

  const isLocationSaved = (id: string) => {
    return savedLocations.some(l => l.id === id);
  };

  const setItinerary = (newItinerary: ItineraryStop[]) => {
    setItineraryState(newItinerary);
  };

  const setAIItinerary = (newItinerary: AIItinerary | null) => {
    setAIItineraryState(newItinerary);
  };

  const clearItinerary = () => {
    setItineraryState([]);
    setAIItineraryState(null);
  };

  const setSearchParams = (params: TripSearchParams) => {
    setSearchParamsState(params);
  };

  const setTripSuggestions = (suggestions: TripSuggestions | null) => {
    setTripSuggestionsState(suggestions);
  };

  return (
    <TripContext.Provider
      value={{
        savedLocations,
        itinerary,
        aiItinerary,
        searchParams,
        tripSuggestions,
        addLocation,
        removeLocation,
        isLocationSaved,
        setItinerary,
        setAIItinerary,
        clearItinerary,
        setSearchParams,
        setTripSuggestions,
      }}
    >
      {children}
    </TripContext.Provider>
  );
};

export const useTrip = () => {
  const context = useContext(TripContext);
  if (!context) {
    throw new Error('useTrip must be used within TripProvider');
  }
  return context;
};
