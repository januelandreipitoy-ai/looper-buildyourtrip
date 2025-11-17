import React, { useEffect, useRef, useMemo } from 'react';
import { SavedLocation, TimeSlot } from '@/contexts/TripContext';

interface ItineraryFlatMapProps {
  days: Array<{
    dayNumber: number;
    timeSlots: {
      morning: TimeSlot;
      afternoon: TimeSlot;
      evening: TimeSlot;
    };
  }>;
  highlightedLocation: SavedLocation | null;
  onLocationClick: (location: SavedLocation) => void;
}

declare global {
  interface Window {
    L: any;
  }
}

const ItineraryFlatMap: React.FC<ItineraryFlatMapProps> = ({ 
  days, 
  highlightedLocation, 
  onLocationClick 
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);
  const polylineRef = useRef<any>(null);

  const allLocations = useMemo(() => {
    const locs: SavedLocation[] = [];
    days.forEach(day => {
      if (day.timeSlots.morning?.location) locs.push(day.timeSlots.morning.location);
      if (day.timeSlots.afternoon?.location) locs.push(day.timeSlots.afternoon.location);
      if (day.timeSlots.evening?.location) locs.push(day.timeSlots.evening.location);
    });
    // Filter out locations without valid coordinates
    return locs.filter(loc => loc.lat !== undefined && loc.lng !== undefined);
  }, [days]);

  // Initialize map
  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    const L = window.L;
    if (!L) {
      const script = document.createElement('script');
      script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
      script.async = true;
      document.head.appendChild(script);

      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
      document.head.appendChild(link);

      script.onload = () => {
        initMap();
      };
    } else {
      initMap();
    }

    function initMap() {
      const L = window.L;
      
      const map = L.map(mapContainerRef.current!).setView([25.2048, 55.2708], 12);

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
        maxZoom: 19,
      }).addTo(map);

      mapInstanceRef.current = map;
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Update markers when locations change
  useEffect(() => {
    if (!mapInstanceRef.current || !window.L || allLocations.length === 0) return;

    const L = window.L;
    const map = mapInstanceRef.current;

    // Clear existing markers and polyline
    markersRef.current.forEach(marker => marker.remove());
    markersRef.current = [];
    if (polylineRef.current) {
      polylineRef.current.remove();
      polylineRef.current = null;
    }

    // Create custom icons
    const createIcon = (color: string, isHighlighted: boolean) => {
      return L.divIcon({
        html: `<div style="
          background-color: ${color};
          width: ${isHighlighted ? '16px' : '12px'};
          height: ${isHighlighted ? '16px' : '12px'};
          border-radius: 50%;
          border: 2px solid white;
          box-shadow: 0 2px 8px rgba(0,0,0,0.3);
          transform: translate(-50%, -50%);
        "></div>`,
        className: '',
        iconSize: [0, 0],
      });
    };

    // Add markers with numbers and images
    const markers = allLocations.map((location, index) => {
      const isHighlighted = highlightedLocation?.id === location.id;
      const dayNumber = Math.floor(index / 3) + 1;
      const orderNumber = index + 1;
      
      // Create custom numbered icon
      const numberedIcon = L.divIcon({
        html: `
          <div style="
            position: relative;
            width: ${isHighlighted ? '40px' : '32px'};
            height: ${isHighlighted ? '40px' : '32px'};
            transform: translate(-50%, -100%);
          ">
            <div style="
              width: 100%;
              height: 100%;
              background: ${isHighlighted ? '#ff6b6b' : '#4a90e2'};
              border: 3px solid white;
              border-radius: 50% 50% 50% 0;
              transform: rotate(-45deg);
              box-shadow: 0 4px 12px rgba(0,0,0,0.3);
              display: flex;
              align-items: center;
              justify-content: center;
            ">
              <span style="
                transform: rotate(45deg);
                color: white;
                font-weight: bold;
                font-size: ${isHighlighted ? '16px' : '14px'};
              ">${orderNumber}</span>
            </div>
          </div>
        `,
        className: '',
        iconSize: [0, 0],
      });

      const marker = L.marker([location.lat, location.lng], {
        icon: numberedIcon,
        zIndexOffset: isHighlighted ? 1000 : 0
      })
        .addTo(map)
        .bindPopup(`
          <div style="min-width: 200px; max-width: 250px;">
            <div style="width: 100%; height: 120px; margin-bottom: 8px; border-radius: 8px; overflow: hidden;">
              <img 
                src="${location.image}" 
                alt="${location.name}"
                style="width: 100%; height: 100%; object-fit: cover;"
              />
            </div>
            <h3 style="margin: 0 0 4px 0; font-weight: bold; font-size: 14px;">${location.name}</h3>
            <p style="margin: 0 0 4px 0; font-size: 12px; color: #666;">
              <strong>Day ${dayNumber}</strong> - Stop ${orderNumber}
            </p>
            <p style="margin: 0; font-size: 11px; color: #888;">
              ${location.description ? location.description.substring(0, 100) + '...' : ''}
            </p>
          </div>
        `, {
          maxWidth: 250,
          className: 'custom-popup'
        })
        .on('click', () => {
          onLocationClick(location);
        });

      return marker;
    });

    markersRef.current = markers;

    // Draw route line with arrows
    if (allLocations.length > 1) {
      const routeCoords = allLocations.map(loc => [loc.lat, loc.lng] as [number, number]);
      polylineRef.current = L.polyline(routeCoords, {
        color: '#4a90e2',
        weight: 4,
        opacity: 0.8,
        dashArray: '10, 5',
        lineCap: 'round',
        lineJoin: 'round'
      }).addTo(map);

      // Add directional arrows
      const arrowSymbol = `
        <svg width="20" height="20" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
          <path d="M10 5 L15 10 L10 15 L10 11 L5 11 L5 9 L10 9 Z" fill="#4a90e2"/>
        </svg>
      `;
    }

    // Fit map to show all markers
    if (allLocations.length > 0) {
      const bounds = L.latLngBounds(allLocations.map(loc => [loc.lat, loc.lng]));
      map.fitBounds(bounds, { padding: [50, 50] });
    }
  }, [allLocations, highlightedLocation, onLocationClick]);

  // Update marker highlight when highlighted location changes
  useEffect(() => {
    if (!mapInstanceRef.current || !window.L || !highlightedLocation) return;

    const L = window.L;
    const map = mapInstanceRef.current;

    // Pan to highlighted location
    map.setView([highlightedLocation.lat, highlightedLocation.lng], 14, {
      animate: true,
      duration: 0.5
    });

    // Update markers
    markersRef.current.forEach((marker, index) => {
      const location = allLocations[index];
      const isHighlighted = location.id === highlightedLocation.id;
      
      const orderNumber = index + 1;
      
      const numberedIcon = L.divIcon({
        html: `
          <div style="
            position: relative;
            width: ${isHighlighted ? '40px' : '32px'};
            height: ${isHighlighted ? '40px' : '32px'};
            transform: translate(-50%, -100%);
          ">
            <div style="
              width: 100%;
              height: 100%;
              background: ${isHighlighted ? '#ff6b6b' : '#4a90e2'};
              border: 3px solid white;
              border-radius: 50% 50% 50% 0;
              transform: rotate(-45deg);
              box-shadow: 0 4px 12px rgba(0,0,0,0.3);
              display: flex;
              align-items: center;
              justify-content: center;
            ">
              <span style="
                transform: rotate(45deg);
                color: white;
                font-weight: bold;
                font-size: ${isHighlighted ? '16px' : '14px'};
              ">${orderNumber}</span>
            </div>
          </div>
        `,
        className: '',
        iconSize: [0, 0],
      });

      marker.setIcon(numberedIcon);
      marker.setZIndexOffset(isHighlighted ? 1000 : 0);
    });
  }, [highlightedLocation, allLocations]);

  return (
    <div 
      ref={mapContainerRef} 
      className="w-full h-full rounded-lg"
      style={{ minHeight: '400px' }}
    />
  );
};

export default ItineraryFlatMap;
