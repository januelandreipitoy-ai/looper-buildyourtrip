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
    const { locations, searchParams } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');

    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    // Build context from search parameters
    const destination = searchParams?.destination || 'your destination';
    const days = searchParams?.days || Math.ceil(locations.length / 3);
    const travelers = searchParams 
      ? `${searchParams.adults} adult${searchParams.adults > 1 ? 's' : ''}${searchParams.children > 0 ? `, ${searchParams.children} child${searchParams.children > 1 ? 'ren' : ''}` : ''}${searchParams.infants > 0 ? `, ${searchParams.infants} infant${searchParams.infants > 1 ? 's' : ''}` : ''}`
      : '2 travelers';

    // Create prompt for AI
    const locationsText = locations.map((loc: any, idx: number) => 
      `${idx + 1}. ${loc.name} (${loc.type}) - ${loc.city}, ${loc.country}
   Description: ${loc.description}
   Tags: ${loc.tags.join(', ')}
   Coordinates: lat ${loc.lat}, lng ${loc.lng}
   Image: ${loc.image || 'N/A'}`
    ).join('\n\n');

    const prompt = `You are an expert travel planner. Create an optimized ${days}-day itinerary for ${travelers} visiting ${destination}.

Available locations to visit:
${locationsText}

Requirements:
1. Distribute locations across ${days} days
2. For each day, create Morning, Afternoon, and Evening time slots
3. Group nearby locations together to minimize travel time
4. Include varied activities (mix of ${locations.map((l: any) => l.type).filter((v: string, i: number, a: string[]) => a.indexOf(v) === i).join(', ')})
5. Suggest 2-3 specific activities for each location visit
6. Estimate realistic visit durations
7. Calculate travel times between locations
8. Recommend best transport mode (walk, taxi, metro, bus)
9. Suggest meal times and restaurant types

IMPORTANT: For each location in the time slots, you MUST include the complete location object with ALL these fields:
- name: location name
- country: country name
- city: city name
- description: location description
- tags: array of tags
- lat: latitude (number)
- lng: longitude (number)
- image: image URL if available

Return ONLY a valid JSON object with this structure:
{
  "days": [
    {
      "dayNumber": 1,
      "date": "Day 1",
      "timeSlots": {
        "morning": {
          "time": "8:00 AM - 12:00 PM",
          "location": {
            "name": "Location Name",
            "country": "Country",
            "city": "City",
            "description": "Description",
            "tags": "Type",
            "lat": 0.0,
            "lng": 0.0,
            "image": "image-url"
          },
          "activities": ["activity1", "activity2"],
          "duration": "3 hours",
          "notes": "tips or recommendations"
        },
        "afternoon": {
          "time": "12:00 PM - 6:00 PM",
          "location": { /* same structure as morning */ },
          "activities": ["activity1", "activity2"],
          "duration": "4 hours",
          "travelTime": "20 mins",
          "transportMode": "metro",
          "notes": "tips"
        },
        "evening": {
          "time": "6:00 PM - 10:00 PM",
          "location": { /* same structure as morning */ },
          "activities": ["dinner", "activity1"],
          "duration": "3 hours",
          "travelTime": "15 mins",
          "transportMode": "taxi",
          "notes": "tips"
        }
      },
      "meals": {
        "breakfast": "Local café near first location",
        "lunch": "Restaurant suggestion",
        "dinner": "Dinner recommendation"
      }
    }
  ],
  "tips": ["general tip 1", "general tip 2"],
  "estimatedCosts": {
    "dailyBudget": 150,
    "totalBudget": ${days * 150}
  }
}`;

    console.log('Calling Lovable AI to generate itinerary...');

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
            content: 'You are an expert travel planner who creates detailed, optimized itineraries. Always respond with valid JSON only, no markdown formatting.'
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
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();
    const aiResponse = data.choices[0].message.content;
    
    console.log('AI Response received');
    
    // Parse the JSON response
    let itinerary;
    try {
      // Remove markdown code blocks if present
      const cleanedResponse = aiResponse.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      itinerary = JSON.parse(cleanedResponse);
    } catch (parseError) {
      console.error('Failed to parse AI response:', aiResponse);
      throw new Error('Failed to parse AI-generated itinerary');
    }

    return new Response(JSON.stringify({ 
      success: true,
      itinerary 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in generate-ai-itinerary:', error);
    return new Response(JSON.stringify({ 
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error' 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
