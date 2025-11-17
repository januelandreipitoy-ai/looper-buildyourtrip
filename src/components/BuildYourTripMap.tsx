import React, { useState, useEffect, useRef } from 'react';
import { MapPin, Coffee, UtensilsCrossed, Camera, Hotel, Car, Share2, Download, X, Navigation, Clock, TrendingUp, Route as RouteIcon } from 'lucide-react';
import TravelChatbox from './TravelChatbox';

declare global {
  interface Window {
    L: any;
  }
}

interface Location {
  id: string;
  name: string;
  lat: number;
  lng: number;
  type: string;
  rating: number;
  price: string;
  vibe: string;
  area: string;
  image: string;
  icon: any;
  color: string;
  gradient: string;
  iconLabel: string;
  visitDuration?: number;
  peakHours?: string;
  offPeakHours?: string;
}

interface RouteStep {
  from: string;
  to: string;
  distance: number;
  duration: number;
  order: number;
}

const BuildYourTripMap = () => {
  const [draggedIcon, setDraggedIcon] = useState<any>(null);
  const [selectedLocations, setSelectedLocations] = useState<Location[]>([]);
  const [map, setMap] = useState<any>(null);
  const [visibleClusters, setVisibleClusters] = useState<string[]>([]);
  const [clusterMarkers, setClusterMarkers] = useState<any[]>([]);
  const [travelMode, setTravelMode] = useState<'driving' | 'walking'>('driving');
  const [optimizedRoute, setOptimizedRoute] = useState<RouteStep[]>([]);
  const [routePolyline, setRoutePolyline] = useState<any>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const [roadRoute, setRoadRoute] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showDiscoveryPrompt, setShowDiscoveryPrompt] = useState(true);

  const iconTypes = [
    { id: 'hotel', label: 'Hotel', Icon: Hotel, color: '#4F46E5', gradient: 'from-indigo-500 to-purple-600' },
    { id: 'restaurant', label: 'Restaurant', Icon: UtensilsCrossed, color: '#EF4444', gradient: 'from-red-500 to-orange-500' },
    { id: 'cafe', label: 'Cafe', Icon: Coffee, color: '#F59E0B', gradient: 'from-amber-500 to-yellow-500' },
    { id: 'attraction', label: 'Attraction', Icon: Camera, color: '#8B5CF6', gradient: 'from-purple-500 to-pink-500' },
    { id: 'activity', label: 'Activity', Icon: Car, color: '#10B981', gradient: 'from-emerald-500 to-teal-500' },
    { id: 'photo', label: 'Photo Spot', Icon: MapPin, color: '#EC4899', gradient: 'from-pink-500 to-rose-500' },
  ];

  const landmarkClusters = [
    {
      id: 'burj-khalifa',
      name: 'BURJ KHALIFA',
      tag: 'Iconic Tower',
      lat: 25.1972,
      lng: 55.2744,
      type: 'attraction',
      visitDuration: 120,
      peakHours: '10:00 AM - 2:00 PM',
      offPeakHours: '6:00 PM - 9:00 PM',
      momentCount: 47,
      photos: [
        { url: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=800&auto=format&fit=crop', caption: 'At the Top' },
        { url: 'https://images.unsplash.com/photo-1582672060674-bc2bd808a8b5?w=800&auto=format&fit=crop', caption: 'Sunset Views' },
        { url: 'https://images.unsplash.com/photo-1518684079-3c830dcef090?w=800&auto=format&fit=crop', caption: 'Night Lights' },
      ]
    },
    {
      id: 'dubai-fountain',
      name: 'DUBAI FOUNTAIN',
      tag: 'Water Show',
      lat: 25.1953,
      lng: 55.2744,
      type: 'photo',
      visitDuration: 30,
      peakHours: '7:00 PM - 9:00 PM',
      offPeakHours: '1:00 PM - 4:00 PM',
      momentCount: 23,
      photos: [
        { url: 'https://images.unsplash.com/photo-1512632578888-169bbbc64f33?w=800&auto=format&fit=crop', caption: 'Water Dance' },
        { url: 'https://images.unsplash.com/photo-1580674285054-bed31e145f59?w=800&auto=format&fit=crop', caption: 'Evening Show' },
      ]
    },
    {
      id: 'palm-jumeirah',
      name: 'PALM JUMEIRAH',
      tag: 'Island Paradise',
      lat: 25.1124,
      lng: 55.1390,
      type: 'attraction',
      visitDuration: 180,
      peakHours: '11:00 AM - 3:00 PM',
      offPeakHours: '8:00 AM - 10:00 AM',
      momentCount: 35,
      photos: [
        { url: 'https://images.unsplash.com/photo-1512543286618-98d4d35e4e0f?w=800&auto=format&fit=crop', caption: 'Aerial View' },
        { url: 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800&auto=format&fit=crop', caption: 'Atlantis' },
      ]
    },
    {
      id: 'burj-al-arab',
      name: 'BURJ AL ARAB',
      tag: 'Luxury Hotel',
      lat: 25.1412,
      lng: 55.1853,
      type: 'hotel',
      visitDuration: 90,
      peakHours: '12:00 PM - 3:00 PM',
      offPeakHours: '4:00 PM - 6:00 PM',
      momentCount: 31,
      photos: [
        { url: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800&auto=format&fit=crop', caption: 'Sail Icon' },
        { url: 'https://images.unsplash.com/photo-1549294413-26f195200c16?w=800&auto=format&fit=crop', caption: 'Beach View' },
      ]
    },
    {
      id: 'dubai-marina',
      name: 'DUBAI MARINA',
      tag: 'Waterfront',
      lat: 25.0805,
      lng: 55.1410,
      type: 'activity',
      visitDuration: 120,
      peakHours: '6:00 PM - 10:00 PM',
      offPeakHours: '10:00 AM - 2:00 PM',
      momentCount: 28,
      photos: [
        { url: 'https://images.unsplash.com/photo-1512632578888-169bbbc64f33?w=800&auto=format&fit=crop', caption: 'Marina Walk' },
        { url: 'https://images.unsplash.com/photo-1518684079-3c830dcef090?w=800&auto=format&fit=crop', caption: 'Night Scene' },
      ]
    },
    {
      id: 'museum-future',
      name: 'MUSEUM OF THE FUTURE',
      tag: 'Innovation Hub',
      lat: 25.2195,
      lng: 55.2802,
      type: 'attraction',
      visitDuration: 150,
      peakHours: '11:00 AM - 4:00 PM',
      offPeakHours: '9:00 AM - 10:00 AM',
      momentCount: 19,
      photos: [
        { url: 'https://images.unsplash.com/photo-1677495596024-b01d69c1e02e?w=800&auto=format&fit=crop', caption: 'Futuristic Design' },
      ]
    },
  ];

  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.css';
    document.head.appendChild(link);

    const script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.js';
    script.onload = () => {
      const L = window.L;
      
      const mapInstance = L.map(mapContainerRef.current, {
        zoomControl: false,
        attributionControl: true,
      }).setView([25.2048, 55.2708], 12);

      L.control.zoom({ position: 'bottomright' }).addTo(mapInstance);

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
        maxZoom: 19,
      }).addTo(mapInstance);

      mapInstanceRef.current = mapInstance;
      
      // Wait for map to be fully ready before setting state
      mapInstance.whenReady(() => {
        setMap(mapInstance);
      });
    };
    document.body.appendChild(script);

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (map && mapContainerRef.current && visibleClusters.length > 0) {
      createLandmarkClusters(map);
    }
  }, [map, visibleClusters]);

  useEffect(() => {
    if (selectedLocations.length >= 2) {
      optimizeRoute();
      fetchRoadRoute();
    } else {
      setOptimizedRoute([]);
      if (routePolyline) {
        routePolyline.remove();
        setRoutePolyline(null);
      }
      if (roadRoute) {
        roadRoute.remove();
        setRoadRoute(null);
      }
    }
  }, [selectedLocations, travelMode]);

  const createLandmarkClusters = (mapInstance: any) => {
    if (!mapInstance || !mapContainerRef.current || !window.L) return;
    
    clusterMarkers.forEach((m: any) => m.remove());
    
    const L = window.L;
    const newClusterMarkers: any[] = [];

    const clustersToShow = landmarkClusters.filter(c => visibleClusters.includes(c.id));

    clustersToShow.forEach((cluster) => {
      const clusterHtml = `
        <div class="landmark-cluster" data-cluster-id="${cluster.id}">
          <div class="photo-stack">
            ${cluster.photos.slice(0, 3).map((photo, idx) => `
              <div class="photo-card" style="
                transform: rotate(${idx === 0 ? -8 : idx === 1 ? 3 : -5}deg) translateY(${idx * 4}px);
                z-index: ${3 - idx};
              ">
                <img src="${photo.url}" alt="${cluster.name}" />
              </div>
            `).join('')}
            <div class="moment-badge">${cluster.momentCount}</div>
          </div>
          <div class="cluster-label">${cluster.name}</div>
        </div>
      `;

      const clusterIcon = L.divIcon({
        html: clusterHtml,
        className: 'custom-cluster-marker',
        iconSize: [120, 140],
        iconAnchor: [60, 70],
      });

      const marker = L.marker([cluster.lat, cluster.lng], { 
        icon: clusterIcon,
        interactive: true
      }).addTo(mapInstance);

      marker.clusterId = cluster.id;
      marker.clusterData = cluster;

      newClusterMarkers.push(marker);
    });

    setClusterMarkers(newClusterMarkers);

    setTimeout(() => {
      document.querySelectorAll('.landmark-cluster').forEach(el => {
        el.addEventListener('mouseenter', (e: any) => {
          e.currentTarget.classList.add('expanded');
        });

        el.addEventListener('mouseleave', (e: any) => {
          e.currentTarget.classList.remove('expanded');
        });

        el.addEventListener('click', (e: any) => {
          const clusterId = e.currentTarget.getAttribute('data-cluster-id');
          const cluster = landmarkClusters.find(c => c.id === clusterId);
          if (cluster) {
            handleClusterClick(cluster);
          }
        });
      });
    }, 100);
  };

  const handleClusterClick = (cluster: any) => {
    const iconType = iconTypes.find(t => t.id === cluster.type) || iconTypes[3];
    
    const location: Location = {
      id: cluster.id,
      name: cluster.name,
      lat: cluster.lat,
      lng: cluster.lng,
      type: cluster.type,
      rating: 4.8,
      price: '$$',
      vibe: cluster.tag,
      area: cluster.name,
      image: cluster.photos[0].url,
      icon: iconType.Icon,
      color: iconType.color,
      gradient: iconType.gradient,
      iconLabel: iconType.label,
      visitDuration: cluster.visitDuration,
      peakHours: cluster.peakHours,
      offPeakHours: cluster.offPeakHours,
    };

    const isSelected = selectedLocations.some(loc => loc.id === cluster.id);
    if (isSelected) {
      setSelectedLocations(selectedLocations.filter(loc => loc.id !== cluster.id));
    } else {
      setSelectedLocations([...selectedLocations, location]);
    }
  };

  const handleDragStart = (e: React.DragEvent, iconType: any) => {
    e.dataTransfer.effectAllowed = 'move';
    setDraggedIcon(iconType);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (!draggedIcon || !map || !mapContainerRef.current) return;

    const L = window.L;
    const rect = mapContainerRef.current.getBoundingClientRect();
    const point = L.point(e.clientX - rect.left, e.clientY - rect.top);
    const latLng = map.containerPointToLatLng(point);

    const nearbyClusters = landmarkClusters.filter((cluster: any) => {
      const distance = map.distance(latLng, [cluster.lat, cluster.lng]);
      return distance < 8000 && cluster.type === draggedIcon.id;
    });

    if (nearbyClusters.length > 0) {
      const newVisibleClusters = [...new Set([...visibleClusters, ...nearbyClusters.map(c => c.id)])];
      setVisibleClusters(newVisibleClusters);
    }

    const circle = L.circle(latLng, {
      radius: 8000,
      color: draggedIcon.color,
      fillColor: draggedIcon.color,
      fillOpacity: 0.1,
      weight: 2,
      dashArray: '10, 10',
    }).addTo(map);

    setTimeout(() => circle.remove(), 2000);
    setDraggedIcon(null);
  };

  const optimizeRoute = () => {
    if (selectedLocations.length < 2) return;

    const start = selectedLocations[0];
    const unvisited = [...selectedLocations.slice(1)];
    const route: RouteStep[] = [];
    let current = start;
    let order = 1;

    while (unvisited.length > 0) {
      let nearest = unvisited[0];
      let minDistance = getDistance(current, nearest);

      for (const loc of unvisited) {
        const distance = getDistance(current, loc);
        if (distance < minDistance) {
          minDistance = distance;
          nearest = loc;
        }
      }

      const duration = calculateDuration(minDistance);
      route.push({
        from: current.name,
        to: nearest.name,
        distance: minDistance,
        duration,
        order: order++,
      });

      unvisited.splice(unvisited.indexOf(nearest), 1);
      current = nearest;
    }

    setOptimizedRoute(route);
    drawRoute();
  };

  const getDistance = (loc1: Location, loc2: Location) => {
    const R = 6371;
    const dLat = toRad(loc2.lat - loc1.lat);
    const dLon = toRad(loc2.lng - loc1.lng);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(toRad(loc1.lat)) * Math.cos(toRad(loc2.lat)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  const toRad = (deg: number) => deg * (Math.PI / 180);

  const calculateDuration = (distance: number) => {
    const speed = travelMode === 'driving' ? 40 : 5;
    return Math.round((distance / speed) * 60);
  };

  const fetchRoadRoute = async () => {
    if (!map || selectedLocations.length < 2) return;

    try {
      // Build coordinates string for OSRM API
      const coordinates = selectedLocations
        .map(loc => `${loc.lng},${loc.lat}`)
        .join(';');

      // Use OSRM for routing (free, no API key required)
      const profile = travelMode === 'driving' ? 'car' : 'foot';
      const url = `https://router.project-osrm.org/route/v1/${profile}/${coordinates}?overview=full&geometries=geojson`;

      const response = await fetch(url);
      const data = await response.json();

      if (data.code === 'Ok' && data.routes && data.routes[0]) {
        drawRoadRoute(data.routes[0].geometry.coordinates);
      } else {
        console.error('Failed to fetch route:', data);
        drawRoute(); // Fallback to simple route
      }
    } catch (error) {
      console.error('Error fetching road route:', error);
      drawRoute(); // Fallback to simple route
    }
  };

  const drawRoadRoute = (coordinates: number[][]) => {
    if (!map) return;

    try {
      // Ensure map container exists
      const container = map.getContainer();
      if (!container) {
        console.warn('Map container not ready');
        return;
      }

      // Remove existing road route
      if (roadRoute) {
        roadRoute.remove();
      }

      // Remove simple polyline if it exists
      if (routePolyline) {
        routePolyline.remove();
        setRoutePolyline(null);
      }

      const L = window.L;
      
      // Convert coordinates from [lng, lat] to [lat, lng] for Leaflet
      const latLngs = coordinates.map(coord => [coord[1], coord[0]]);
      
      const route = L.polyline(latLngs, {
        color: '#4F46E5',
        weight: 5,
        opacity: 0.8,
        smoothFactor: 1,
      }).addTo(map);

      // Add animated dash effect
      let offset = 0;
      const animate = () => {
        offset = (offset + 1) % 20;
        route.setStyle({ dashArray: `10, 10`, dashOffset: offset.toString() });
        requestAnimationFrame(animate);
      };
      animate();

      setRoadRoute(route);
      
      // Fit map to show entire route
      map.fitBounds(route.getBounds(), { padding: [50, 50] });

      // Add markers with numbers for each stop - use setTimeout to ensure DOM is ready
      setTimeout(() => {
        if (!map) return;
        
        selectedLocations.forEach((loc, idx) => {
          try {
            const markerHtml = `
              <div style="
                width: 40px;
                height: 40px;
                background: linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%);
                border: 4px solid white;
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                box-shadow: 0 4px 12px rgba(79, 70, 229, 0.4);
                font-weight: bold;
                color: white;
                font-size: 16px;
              ">
                ${idx + 1}
              </div>
            `;

            const markerIcon = L.divIcon({
              html: markerHtml,
              className: 'custom-route-marker',
              iconSize: [40, 40],
              iconAnchor: [20, 20],
            });

            L.marker([loc.lat, loc.lng], { icon: markerIcon })
              .addTo(map)
              .bindPopup(`
                <div style="font-family: -apple-system, system-ui; padding: 4px;">
                  <div style="font-weight: 700; font-size: 14px; margin-bottom: 4px;">Stop ${idx + 1}</div>
                  <div style="font-size: 13px; color: #374151;">${loc.name}</div>
                </div>
              `);
          } catch (markerError) {
            console.error('Error creating marker:', markerError);
          }
        });
      }, 100);
    } catch (error) {
      console.error('Error drawing road route:', error);
    }
  };

  const drawRoute = () => {
    if (!map || selectedLocations.length < 2) return;

    if (routePolyline) {
      routePolyline.remove();
    }

    const L = window.L;
    const coordinates = selectedLocations.map(loc => [loc.lat, loc.lng]);
    
    const polyline = L.polyline(coordinates, {
      color: '#4F46E5',
      weight: 4,
      opacity: 0.7,
      dashArray: '10, 10',
    }).addTo(map);

    setRoutePolyline(polyline);
    map.fitBounds(polyline.getBounds(), { padding: [50, 50] });
  };

  const formatDuration = (minutes: number) => {
    if (minutes < 60) return `${minutes} min`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  const getTotalDuration = () => {
    const travelTime = optimizedRoute.reduce((sum, step) => sum + step.duration, 0);
    const visitTime = selectedLocations.reduce((sum, loc) => sum + (loc.visitDuration || 60), 0);
    return travelTime + visitTime;
  };

  const categoryTags = [
    { name: 'Cafés', image: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=100&h=100&fit=crop', color: 'from-amber-100 to-orange-100' },
    { name: 'Restaurants', image: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=100&h=100&fit=crop', color: 'from-red-100 to-pink-100' },
    { name: 'Adventure', image: 'https://images.unsplash.com/photo-1551632811-561732d1e306?w=100&h=100&fit=crop', color: 'from-blue-100 to-indigo-100' },
    { name: 'Outdoors', image: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=100&h=100&fit=crop', color: 'from-green-100 to-emerald-100' },
    { name: 'Hiking', image: 'https://images.unsplash.com/photo-1551632811-561732d1e306?w=100&h=100&fit=crop', color: 'from-teal-100 to-cyan-100' },
    { name: 'Gardens', image: 'https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?w=100&h=100&fit=crop', color: 'from-lime-100 to-green-100' },
    { name: 'Parks', image: 'https://images.unsplash.com/photo-1564760055775-d63b17a55c44?w=100&h=100&fit=crop', color: 'from-emerald-100 to-teal-100' },
    { name: 'Beaches', image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=100&h=100&fit=crop', color: 'from-sky-100 to-blue-100' },
    { name: 'Museums', image: 'https://images.unsplash.com/photo-1565952913149-d6b8b7a31dd1?w=100&h=100&fit=crop', color: 'from-purple-100 to-violet-100' },
    { name: 'Malls', image: 'https://images.unsplash.com/photo-1519567241046-7f570eee3ce6?w=100&h=100&fit=crop', color: 'from-pink-100 to-rose-100' },
    { name: 'Nightlife', image: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=100&h=100&fit=crop', color: 'from-fuchsia-100 to-purple-100' },
    { name: 'Nature', image: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=100&h=100&fit=crop', color: 'from-green-100 to-lime-100' },
    { name: 'Road Trips', image: 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=100&h=100&fit=crop', color: 'from-orange-100 to-amber-100' },
    { name: 'Landmarks', image: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=100&h=100&fit=crop', color: 'from-slate-100 to-gray-100' },
    { name: 'Markets', image: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=100&h=100&fit=crop', color: 'from-yellow-100 to-orange-100' }
  ];

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    setShowDiscoveryPrompt(value.trim() === '');
  };

  const handleTagClick = (tag: string) => {
    setSearchQuery(tag);
    setShowDiscoveryPrompt(false);
  };

  return (
    <>
    <div className="flex flex-col h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="bg-background border-b border-border shadow-sm z-20">
        <div className="flex flex-col px-6 py-4 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-bold text-foreground">Moments</h1>
              <div className="flex flex-col">
                <span className="text-sm font-semibold text-foreground">📍 Dubai, UAE</span>
                <span className="text-xs text-muted-foreground">{selectedLocations.length} locations selected</span>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <div className="flex bg-muted rounded-lg p-1">
                <button
                  onClick={() => setTravelMode('driving')}
                  className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                    travelMode === 'driving' 
                      ? 'bg-background text-foreground shadow-sm' 
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  🚗 Driving
                </button>
                <button
                  onClick={() => setTravelMode('walking')}
                  className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                    travelMode === 'walking' 
                      ? 'bg-background text-foreground shadow-sm' 
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  🚶 Walking
                </button>
              </div>
              <button className="p-2 bg-muted rounded-full hover:bg-accent transition-all">
                <Share2 size={18} className="text-foreground" />
              </button>
              <button className="p-2 bg-muted rounded-full hover:bg-accent transition-all">
                <Download size={18} className="text-foreground" />
              </button>
            </div>
          </div>

          {/* Search Bar */}
          <div className="w-full max-w-2xl mx-auto">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
              placeholder="Search a country, city, or experience..."
              className="w-full px-6 py-3 rounded-full bg-muted border border-border focus:outline-none focus:ring-2 focus:ring-primary/50 text-foreground placeholder:text-muted-foreground"
            />
          </div>

          {/* Discovery Prompt Section */}
          <div 
            className={`transition-all duration-300 ${
              showDiscoveryPrompt ? 'opacity-100 max-h-96' : 'opacity-0 max-h-0 overflow-hidden'
            }`}
          >
            <div className="text-center space-y-4">
              <div className="space-y-2">
                <h2 className="text-2xl font-bold text-foreground">
                  Where do you want to go next?
                </h2>
                <p className="text-sm text-muted-foreground/80">
                  Discover places, experiences, and hidden gems waiting for you
                </p>
              </div>

              {/* Scrollable Category Tags - Pinterest Style */}
              <div className="flex items-center justify-center">
                <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide max-w-5xl px-4">
                  {categoryTags.map((tag) => (
                    <button
                      key={tag.name}
                      onClick={() => handleTagClick(tag.name)}
                      className={`flex items-center gap-2 pl-1 pr-4 py-1 rounded-full bg-gradient-to-r ${tag.color} hover:shadow-lg text-sm font-semibold text-gray-800 whitespace-nowrap transition-all hover:scale-105`}
                    >
                      <img 
                        src={tag.image} 
                        alt={tag.name}
                        className="w-8 h-8 rounded-full object-cover"
                      />
                      {tag.name}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        <div className="w-24 bg-background border-r border-border flex flex-col items-center py-6 space-y-3 shadow-sm z-10">
          <div className="text-xs font-bold text-muted-foreground uppercase tracking-wide mb-2">Icons</div>
          {iconTypes.map((iconType) => {
            const Icon = iconType.Icon;
            return (
              <div
                key={iconType.id}
                draggable
                onDragStart={(e) => handleDragStart(e, iconType)}
                className={`w-16 h-16 flex flex-col items-center justify-center bg-gradient-to-br ${iconType.gradient} rounded-2xl cursor-move hover:scale-110 transition-all shadow-md hover:shadow-xl`}
              >
                <Icon size={24} color="white" strokeWidth={2.5} />
                <span className="text-xs mt-1 text-white font-semibold">{iconType.label.split(' ')[0]}</span>
              </div>
            );
          })}
        </div>

        <div className="flex-1 relative z-0">
          <div 
            ref={mapContainerRef} 
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            className="w-full h-full"
          />

          {visibleClusters.length === 0 && (
            <div className="absolute top-6 left-1/2 transform -translate-x-1/2 bg-background px-8 py-4 rounded-2xl shadow-2xl border-2 border-primary/20 z-[1000] pointer-events-none">
              <p className="text-base font-semibold text-foreground flex items-center space-x-2">
                <span className="text-2xl">🎯</span>
                <span>Drag an icon to the map to discover locations</span>
              </p>
            </div>
          )}
        </div>

        <div className="w-96 bg-background border-l border-border flex flex-col shadow-xl z-10">
          <div className="p-6 border-b border-border bg-gradient-to-br from-primary/5 to-primary/10">
            <h2 className="text-xl font-bold text-foreground flex items-center space-x-2">
              <RouteIcon size={22} className="text-primary" />
              <span>Trip Planner</span>
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              {selectedLocations.length} location{selectedLocations.length !== 1 ? 's' : ''} • 
              {optimizedRoute.length > 0 && ` ${formatDuration(getTotalDuration())} total`}
            </p>
          </div>

          {optimizedRoute.length > 0 && (
            <div className="p-4 bg-primary/5 border-b border-border">
              <h3 className="text-sm font-bold text-foreground mb-3 flex items-center space-x-2">
                <Navigation size={16} className="text-primary" />
                <span>Optimized Route</span>
              </h3>
              <div className="space-y-2">
                {optimizedRoute.map((step, idx) => (
                  <div key={idx} className="flex items-center space-x-2 text-sm">
                    <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold">
                      {step.order}
                    </div>
                    <div className="flex-1">
                      <div className="font-medium text-foreground">{step.to}</div>
                      <div className="text-xs text-muted-foreground">
                        {step.distance.toFixed(1)} km • {formatDuration(step.duration)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex-1 overflow-y-auto p-6 space-y-3">
            {selectedLocations.length === 0 ? (
              <div className="text-center text-muted-foreground mt-20">
                <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-primary/10 to-primary/20 rounded-full flex items-center justify-center">
                  <Camera size={40} className="opacity-50 text-primary" />
                </div>
                <p className="font-semibold text-foreground">No locations selected</p>
                <p className="text-sm mt-2">Click on photo clusters to add them!</p>
              </div>
            ) : (
              selectedLocations.map((item, idx) => {
                const Icon = item.icon;
                return (
                  <div
                    key={item.id}
                    className="bg-card rounded-xl p-4 border-2 border-border hover:border-primary/30 transition-all shadow-sm hover:shadow-md"
                  >
                    <div className="flex items-start space-x-3">
                      <div
                        className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 bg-gradient-to-br ${item.gradient} shadow-md`}
                      >
                        <Icon size={20} color="white" strokeWidth={2.5} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2">
                          <h3 className="font-bold text-sm text-foreground">{item.name}</h3>
                          {optimizedRoute.length > 0 && (
                            <span className="text-xs bg-primary text-primary-foreground px-2 py-0.5 rounded-full font-bold">
                              #{idx + 1}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">{item.vibe}</p>
                        
                        {item.visitDuration && (
                          <div className="flex items-center space-x-1 mt-2 text-xs text-muted-foreground">
                            <Clock size={12} />
                            <span>{formatDuration(item.visitDuration)} visit</span>
                          </div>
                        )}
                        
                        {item.peakHours && (
                          <div className="mt-2 space-y-1">
                            <div className="flex items-center space-x-1 text-xs">
                              <TrendingUp size={12} className="text-destructive" />
                              <span className="text-destructive font-medium">Peak: {item.peakHours}</span>
                            </div>
                            <div className="flex items-center space-x-1 text-xs">
                              <TrendingUp size={12} className="text-green-600" />
                              <span className="text-green-600 font-medium">Off-peak: {item.offPeakHours}</span>
                            </div>
                          </div>
                        )}
                      </div>
                      <button
                        onClick={() => setSelectedLocations(selectedLocations.filter(l => l.id !== item.id))}
                        className="p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg transition-all"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {selectedLocations.length > 0 && (
            <div className="p-6 border-t border-border space-y-3 bg-gradient-to-br from-muted/50 to-background">
              <button className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-3 rounded-xl font-bold hover:shadow-xl transition-all transform hover:scale-105 flex items-center justify-center space-x-2">
                <Download size={18} />
                <span>Download Itinerary</span>
              </button>
              <button className="w-full bg-gradient-to-r from-pink-500 to-orange-500 text-white py-3 rounded-xl font-bold hover:shadow-xl transition-all transform hover:scale-105 flex items-center justify-center space-x-2">
                <Share2 size={18} />
                <span>Share Trip</span>
              </button>
            </div>
          )}
        </div>
      </div>

      <style>{`
        .custom-route-marker {
          background: transparent !important;
          border: none !important;
        }

        .custom-cluster-marker {
          background: transparent !important;
          border: none !important;
        }

        .landmark-cluster {
          cursor: pointer;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          position: relative;
        }

        .landmark-cluster:hover {
          transform: scale(1.1);
        }

        .photo-stack {
          position: relative;
          width: 100px;
          height: 120px;
          transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .landmark-cluster.expanded .photo-stack {
          width: 220px;
          height: 140px;
        }

        .photo-card {
          position: absolute;
          width: 90px;
          height: 110px;
          background: white;
          border-radius: 12px;
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
          overflow: hidden;
          transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
          left: 5px;
          top: 0;
          border: 3px solid white;
        }

        .landmark-cluster.expanded .photo-card {
          width: 70px;
          height: 85px;
          position: relative !important;
          display: inline-block;
          margin: 0 5px;
          transform: rotate(0deg) translateY(0px) !important;
        }

        .photo-card img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .moment-badge {
          position: absolute;
          bottom: 8px;
          right: 8px;
          background: linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%);
          color: white;
          padding: 4px 10px;
          border-radius: 20px;
          font-size: 11px;
          font-weight: 700;
          box-shadow: 0 4px 12px rgba(79, 70, 229, 0.4);
          z-index: 10;
          border: 2px solid white;
        }

        .cluster-label {
          position: absolute;
          bottom: -32px;
          left: 50%;
          transform: translateX(-50%);
          background: white;
          padding: 6px 14px;
          border-radius: 20px;
          font-size: 11px;
          font-weight: 800;
          color: #1f2937;
          white-space: nowrap;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
          border: 2px solid #f3f4f6;
          letter-spacing: 0.5px;
        }
       `}</style>
    </div>

    <TravelChatbox 
      selectedLocations={selectedLocations}
      onLocationsExtracted={(locations) => {
        setSelectedLocations(locations);
        // Make clusters visible for extracted locations
        const clusterIds = locations.map((loc: any) => loc.id);
        setVisibleClusters((prev) => [...new Set([...prev, ...clusterIds])]);
      }}
    />
    </>
  );
};

export default BuildYourTripMap;
