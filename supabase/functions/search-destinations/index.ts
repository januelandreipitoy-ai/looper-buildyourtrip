import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { query } = await req.json();
    
    if (!query || query.trim() === '') {
      return new Response(
        JSON.stringify({ error: 'Query parameter is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const SERPER_API_KEY = Deno.env.get('SERPER_API_KEY');
    const PEXELS_API_KEY = Deno.env.get('PEXELS_API_KEY');
    
    if (!SERPER_API_KEY) {
      console.error('SERPER_API_KEY not configured');
      return new Response(
        JSON.stringify({ error: 'Search service not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!PEXELS_API_KEY) {
      console.error('PEXELS_API_KEY not configured');
      return new Response(
        JSON.stringify({ error: 'Image service not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Searching for:', query);

    // Call Serper API for Places results to get actual locations
    const response = await fetch('https://google.serper.dev/places', {
      method: 'POST',
      headers: {
        'X-API-KEY': SERPER_API_KEY,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        q: `tourist attractions in ${query}`,
        limit: 20,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Serper API error:', response.status, errorText);
      return new Response(
        JSON.stringify({ error: 'Search service error', details: errorText }),
        { status: response.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const data = await response.json();
    console.log('Serper places count:', data.places?.length || 0);

    // Fetch images from Pexels for each destination with more specific queries
    const fetchImageForDestination = async (destinationName: string, city: string) => {
      try {
        // Create a more specific search query combining destination name and city
        const specificQuery = `${destinationName} ${city}`;
        
        const pexelsResponse = await fetch(
          `https://api.pexels.com/v1/search?query=${encodeURIComponent(specificQuery)}&per_page=1&orientation=landscape`,
          {
            headers: {
              'Authorization': PEXELS_API_KEY,
            },
          }
        );
        
        if (pexelsResponse.ok) {
          const pexelsData = await pexelsResponse.json();
          if (pexelsData.photos && pexelsData.photos.length > 0) {
            return pexelsData.photos[0].src.large;
          }
        }
        
        // Fallback: try with just the city
        const fallbackResponse = await fetch(
          `https://api.pexels.com/v1/search?query=${encodeURIComponent(city + ' landmark')}&per_page=1&orientation=landscape`,
          {
            headers: {
              'Authorization': PEXELS_API_KEY,
            },
          }
        );
        
        if (fallbackResponse.ok) {
          const fallbackData = await fallbackResponse.json();
          if (fallbackData.photos && fallbackData.photos.length > 0) {
            return fallbackData.photos[0].src.large;
          }
        }
      } catch (error) {
        console.error('Error fetching Pexels image:', error);
      }
      // Final fallback with a generic travel/landmark image from Pexels
      return `https://images.pexels.com/photos/1128678/pexels-photo-1128678.jpeg?auto=compress&cs=tinysrgb&w=800`;
    };

    // Function to geocode using Photon API if coordinates are missing
    const geocodeWithPhoton = async (placeName: string, address: string) => {
      try {
        const query = address || placeName;
        const photonResponse = await fetch(
          `https://photon.komoot.io/api/?q=${encodeURIComponent(query)}&limit=1`
        );
        
        if (photonResponse.ok) {
          const photonData = await photonResponse.json();
          if (photonData.features && photonData.features.length > 0) {
            const coords = photonData.features[0].geometry.coordinates;
            return {
              lng: coords[0],
              lat: coords[1]
            };
          }
        }
      } catch (error) {
        console.error('Photon geocoding error:', error);
      }
      return null;
    };

    // Transform Serper places into destination format with coordinates
    const places = (data.places || []).slice(0, 20);
    const destinationsWithImages = await Promise.all(
      places.map(async (place: any, index: number) => {
        const cityName = place.city || query;
        const image = await fetchImageForDestination(place.title, cityName);
        
        let lat = place.gps_coordinates?.latitude || 0;
        let lng = place.gps_coordinates?.longitude || 0;
        
        // If coordinates are missing or invalid, use Photon API to geocode
        if (lat === 0 && lng === 0 && (place.address || place.title)) {
          console.log(`Geocoding ${place.title} with Photon API`);
          const coords = await geocodeWithPhoton(place.title, place.address);
          if (coords) {
            lat = coords.lat;
            lng = coords.lng;
            console.log(`Found coordinates: ${lat}, ${lng}`);
          }
        }
        
        return {
          id: `place-${place.position || index}`,
          name: place.title,
          description: place.address || place.type || `Attraction in ${query}`,
          image,
          lat,
          lng,
          type: place.type || 'attraction',
          tags: place.type ? [place.type] : ['attraction'],
          city: cityName,
          country: place.country || '',
          rating: place.rating,
          reviews: place.reviews,
          source: 'serper-places',
        };
      })
    );

    const destinations = destinationsWithImages;

    return new Response(
      JSON.stringify({ 
        destinations,
        searchInformation: data.searchInformation 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );

  } catch (error) {
    console.error('Error in search-destinations function:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
