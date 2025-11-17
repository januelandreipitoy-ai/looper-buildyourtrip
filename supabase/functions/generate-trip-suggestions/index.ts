import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import "https://deno.land/x/xhr@0.1.0/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { searchParams } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');

    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    const destination = searchParams?.destination || 'your destination';
    const days = searchParams?.days || 3;
    const travelers = searchParams 
      ? `${searchParams.adults} adult${searchParams.adults > 1 ? 's' : ''}${searchParams.children > 0 ? `, ${searchParams.children} child${searchParams.children > 1 ? 'ren' : ''}` : ''}${searchParams.infants > 0 ? `, ${searchParams.infants} infant${searchParams.infants > 1 ? 's' : ''}` : ''}`
      : '2 travelers';

    const prompt = `You are an expert travel planner. Create a suggested ${days}-day itinerary with recommended locations for ${travelers} visiting ${destination}.

Requirements:
1. Suggest 6-9 must-visit locations in ${destination}
2. Include varied types: landmarks, restaurants, parks, museums, shopping areas, cultural sites
3. Distribute locations across ${days} days (3 locations per day)
4. For each location, provide:
   - Name
   - Type (landmark/restaurant/museum/park/shopping/cultural)
   - City and country
   - Brief description (2-3 sentences)
   - 3-5 relevant tags
   - Approximate coordinates (lat, lng)
   - Suggested activities (2-3 items)
   - Recommended visit duration
5. Order locations to minimize travel time
6. Include travel tips and estimated daily budget

Return ONLY a valid JSON object with this structure:
{
  "locations": [
    {
      "id": "loc1",
      "name": "Location Name",
      "type": "landmark",
      "city": "City Name",
      "country": "Country",
      "description": "Brief description",
      "tags": ["tag1", "tag2", "tag3"],
      "lat": 35.6762,
      "lng": 139.6503,
      "image": "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=800&auto=format&fit=crop"
    }
  ],
  "itinerary": {
    "days": [
      {
        "dayNumber": 1,
        "date": "Day 1",
        "timeSlots": {
          "morning": {
            "time": "8:00 AM - 12:00 PM",
            "locationId": "loc1",
            "activities": ["activity1", "activity2"],
            "duration": "3 hours",
            "notes": "tips"
          },
          "afternoon": {
            "time": "12:00 PM - 6:00 PM",
            "locationId": "loc2",
            "activities": ["activity1", "activity2"],
            "duration": "4 hours",
            "travelTime": "20 mins",
            "transportMode": "metro",
            "notes": "tips"
          },
          "evening": {
            "time": "6:00 PM - 10:00 PM",
            "locationId": "loc3",
            "activities": ["dinner", "activity1"],
            "duration": "3 hours",
            "travelTime": "15 mins",
            "transportMode": "taxi",
            "notes": "tips"
          }
        },
        "meals": {
          "breakfast": "Breakfast suggestion",
          "lunch": "Lunch suggestion",
          "dinner": "Dinner suggestion"
        }
      }
    ],
    "tips": ["tip1", "tip2", "tip3"],
    "estimatedCosts": {
      "dailyBudget": 150,
      "totalBudget": ${days * 150}
    }
  }
}`;

    console.log('Calling Lovable AI to generate trip suggestions...');

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          {
            role: 'system',
            content: 'You are a professional travel planner. Always respond with valid JSON only, no additional text.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Lovable AI error:', response.status, errorText);
      throw new Error(`AI request failed: ${response.status}`);
    }

    const data = await response.json();
    let aiResponse = data.choices[0].message.content;

    // Clean up response if it contains markdown code blocks
    if (aiResponse.includes('```json')) {
      aiResponse = aiResponse.split('```json')[1].split('```')[0].trim();
    } else if (aiResponse.includes('```')) {
      aiResponse = aiResponse.split('```')[1].split('```')[0].trim();
    }

    const suggestions = JSON.parse(aiResponse);

    console.log('Successfully generated trip suggestions');

    return new Response(
      JSON.stringify({ success: true, suggestions }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    );

  } catch (error) {
    console.error('Error in generate-trip-suggestions:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      },
    );
  }
});
