import { useEffect, useRef } from 'react';
import type { DayItinerary, TimeSlot } from '@/contexts/TripContext';

interface OSRMItineraryMapProps {
  day: DayItinerary;
  highlightedLocation?: string;
  onLocationClick?: (locationName: string) => void;
}

interface Location {
  lat: number;
  lon: number;
  name: string;
  image?: string;
}

declare global {
  interface Window {
    L: any;
  }
}

const OSRMItineraryMap = ({ day, highlightedLocation, onLocationClick }: OSRMItineraryMapProps) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);
  const polylineRef = useRef<any>(null);

  // Extract all locations from the day's time slots
  const locations: Location[] = [
    day.timeSlots.morning,
    day.timeSlots.afternoon,
    day.timeSlots.evening
  ]
    .filter((slot): slot is TimeSlot => slot !== undefined && slot.location !== undefined)
    .map(slot => ({
      lat: slot.location.lat,
      lon: slot.location.lng,
      name: slot.location.name,
      image: slot.location.image
    }))
    .filter(loc => 
      typeof loc.lat === 'number' && 
      typeof loc.lon === 'number'
    );

  useEffect(() => {
    if (!mapContainerRef.current || locations.length === 0) return;

    const initMap = async () => {
      if (!window.L) {
        const leafletCss = document.createElement('link');
        leafletCss.rel = 'stylesheet';
        leafletCss.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
        document.head.appendChild(leafletCss);

        const leafletScript = document.createElement('script');
        leafletScript.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
        await new Promise(resolve => {
          leafletScript.onload = resolve;
          document.head.appendChild(leafletScript);
        });
      }

      const L = window.L;

      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
      }

      const map = L.map(mapContainerRef.current, {
        zoomControl: true,
        scrollWheelZoom: true,
      });

      L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
        maxZoom: 19,
      }).addTo(map);

      mapInstanceRef.current = map;

      // Center on first location initially
      if (locations.length > 0) {
        map.setView([locations[0].lat, locations[0].lon], 13);
      }
    };

    initMap();

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Update markers and route when locations change
  useEffect(() => {
    if (!mapInstanceRef.current || locations.length === 0) return;

    const L = window.L;
    const map = mapInstanceRef.current;

    // Clear existing markers and polyline
    markersRef.current.forEach(marker => marker.remove());
    markersRef.current = [];
    if (polylineRef.current) {
      polylineRef.current.remove();
      polylineRef.current = null;
    }

    // Add markers for each location
    locations.forEach((location, index) => {
      const marker = L.marker([location.lat, location.lon], {
        icon: L.divIcon({
          className: 'custom-marker',
          html: `<div class="w-10 h-10 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-bold shadow-lg">${index + 1}</div>`,
          iconSize: [40, 40],
          iconAnchor: [20, 20],
        })
      }).addTo(map);

      marker.bindPopup(`
        <div class="text-center">
          ${location.image ? `<img src="${location.image}" alt="${location.name}" class="w-32 h-24 object-cover rounded-lg mb-2" />` : ''}
          <strong>${location.name}</strong>
        </div>
      `);

      if (onLocationClick) {
        marker.on('click', () => onLocationClick(location.name));
      }

      markersRef.current.push(marker);
    });

    // Fetch OSRM route and draw polyline
    const fetchRoute = async () => {
      if (locations.length < 2) return;

      const coords = locations.map(loc => `${loc.lon},${loc.lat}`).join(';');
      const osrmUrl = `https://router.project-osrm.org/route/v1/driving/${coords}?overview=full&geometries=geojson`;

      try {
        const response = await fetch(osrmUrl);
        const data = await response.json();

        if (data.code === 'Ok' && data.routes && data.routes.length > 0) {
          const route = data.routes[0];
          const coordinates = route.geometry.coordinates.map((coord: [number, number]) => [coord[1], coord[0]]);

          const polyline = L.polyline(coordinates, {
            color: 'hsl(var(--primary))',
            weight: 4,
            opacity: 0.8,
            smoothFactor: 1
          }).addTo(map);

          polylineRef.current = polyline;

          // Fit map to show all markers and route
          const bounds = L.latLngBounds(locations.map(loc => [loc.lat, loc.lon]));
          map.fitBounds(bounds, { padding: [50, 50] });
        }
      } catch (error) {
        console.error('Error fetching OSRM route:', error);
        
        // Fallback: draw simple polyline
        const simplePolyline = L.polyline(
          locations.map(loc => [loc.lat, loc.lon]),
          {
            color: 'hsl(var(--primary))',
            weight: 4,
            opacity: 0.6,
            dashArray: '10, 10'
          }
        ).addTo(map);

        polylineRef.current = simplePolyline;

        const bounds = L.latLngBounds(locations.map(loc => [loc.lat, loc.lon]));
        map.fitBounds(bounds, { padding: [50, 50] });
      }
    };

    fetchRoute();
  }, [locations, onLocationClick]);

  // Handle highlighted location
  useEffect(() => {
    if (!mapInstanceRef.current || !highlightedLocation) return;

    const L = window.L;
    const map = mapInstanceRef.current;
    const location = locations.find(loc => loc.name === highlightedLocation);

    if (location) {
      map.setView([location.lat, location.lon], 15, { animate: true, duration: 0.5 });

      // Highlight the marker
      const markerIndex = locations.findIndex(loc => loc.name === highlightedLocation);
      if (markerIndex !== -1 && markersRef.current[markerIndex]) {
        markersRef.current[markerIndex].openPopup();
      }
    }
  }, [highlightedLocation, locations]);

  return (
    <div ref={mapContainerRef} className="w-full h-full rounded-lg overflow-hidden" />
  );
};

export default OSRMItineraryMap;
