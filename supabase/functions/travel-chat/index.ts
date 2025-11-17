import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages, selectedLocations, requestDayPlan } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    console.log("Processing chat request with", messages.length, "messages");
    console.log("Selected locations:", selectedLocations);
    console.log("Day plan requested:", requestDayPlan);

    let systemPrompt = `You are a Dubai travel expert AI assistant. You help users:
- Optimize their travel routes based on proximity and time efficiency
- Suggest new locations to visit in Dubai
- Provide insights about landmarks, attractions, restaurants, cafes, hotels, and activities
- Analyze inspiration images to suggest similar or related locations

Current user's selected locations: ${selectedLocations?.length > 0 ? selectedLocations.map((loc: any) => loc.name).join(", ") : "None yet"}

When suggesting locations, provide:
- Name of the location
- Brief description
- Type (hotel, restaurant, cafe, attraction, activity, photo spot)
- Why it matches their interests
- Best time to visit

Keep responses concise and actionable.`;

    if (requestDayPlan) {
      systemPrompt = `You are a Dubai travel expert AI assistant creating a complete day itinerary.

Current user's selected locations: ${selectedLocations?.length > 0 ? selectedLocations.map((loc: any) => loc.name).join(", ") : "None"}

Create a detailed day plan that includes:
1. **Morning (8:00 AM - 12:00 PM)**: Suggest 2-3 locations to visit
2. **Afternoon (12:00 PM - 6:00 PM)**: Suggest 2-3 locations to visit
3. **Evening (6:00 PM - 10:00 PM)**: Suggest 2-3 locations to visit

For EACH location provide:
- **Location Name** (use bold)
- **Time to Visit**: Specific time slot (e.g., "9:00 AM - 10:30 AM")
- **Type**: (attraction/restaurant/cafe/hotel/activity/photo spot)
- **Why Visit**: Brief compelling reason
- **Activities**: 3-4 specific things to do there
- **Travel Time**: Estimated time from previous location
- **Pro Tips**: Insider advice (best entrance, avoid crowds, etc.)

Consider:
- Logical geographic flow to minimize travel time
- Peak vs off-peak hours
- Mix of experiences (culture, food, views, activities)
- Energy levels throughout the day
- Meal times and breaks

Format your response clearly with sections for Morning, Afternoon, and Evening.
Be specific with times and activities. Make it actionable and exciting!`;
    }

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          ...messages,
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limits exceeded. Please try again later." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "Payment required. Please add credits to your Lovable workspace." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      return new Response(
        JSON.stringify({ error: "AI gateway error" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("Travel chat error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
