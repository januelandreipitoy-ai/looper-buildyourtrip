import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Compass } from 'lucide-react';

declare global {
  interface Window {
    L: any;
  }
}

interface PhotoCluster {
  id: string;
  name: string;
  lat: number;
  lng: number;
  photos: string[];
}

const tokyoClusters: PhotoCluster[] = [
  {
    id: 'shibuya',
    name: 'Shibuya Crossing',
    lat: 35.6595,
    lng: 139.7004,
    photos: [
      'https://images.unsplash.com/photo-1542051841857-5f90071e7989?w=400&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=400&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1513407030348-c983a97b98d8?w=400&auto=format&fit=crop',
    ]
  },
  {
    id: 'tokyo-tower',
    name: 'Tokyo Tower',
    lat: 35.6586,
    lng: 139.7454,
    photos: [
      'https://images.unsplash.com/photo-1536098561742-ca998e48cbcc?w=400&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1549693578-d683be217e58?w=400&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1554797589-7241bb691973?w=400&auto=format&fit=crop',
    ]
  },
  {
    id: 'senso-ji',
    name: 'Sensō-ji Temple',
    lat: 35.7148,
    lng: 139.7967,
    photos: [
      'https://images.unsplash.com/photo-1528164344705-47542687000d?w=400&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1492571350019-22de08371fd3?w=400&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1545569341-9eb8b30979d9?w=400&auto=format&fit=crop',
    ]
  },
  {
    id: 'shinjuku',
    name: 'Shinjuku',
    lat: 35.6938,
    lng: 139.7034,
    photos: [
      'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?w=400&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1590559899731-a382839e5549?w=400&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1552983974-ec07bbc79480?w=400&auto=format&fit=crop',
    ]
  },
  {
    id: 'skytree',
    name: 'Tokyo Skytree',
    lat: 35.7101,
    lng: 139.8107,
    photos: [
      'https://images.unsplash.com/photo-1551641506-ee5bf4cb45f1?w=400&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1587679131471-9e6c7b1f5c8a?w=400&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1555084957-db7d44daa0c5?w=400&auto=format&fit=crop',
    ]
  },
];

export default function NewHome() {
  const navigate = useNavigate();
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);
  const [hoveredCluster, setHoveredCluster] = useState<string | null>(null);
  const [tappedCluster, setTappedCluster] = useState<string | null>(null);

  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    const loadLeaflet = async () => {
      if (!window.L) {
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
        document.head.appendChild(link);

        const script = document.createElement('script');
        script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
        document.head.appendChild(script);

        await new Promise((resolve) => {
          script.onload = resolve;
        });
      }

      const L = window.L;
      
      // Initialize map centered on Tokyo
      mapRef.current = L.map(mapContainerRef.current, {
        center: [35.6762, 139.6503],
        zoom: 12,
        zoomControl: true,
        attributionControl: false,
      });

      // Use Humanitarian OpenStreetMap style (minimal, clean)
      L.tileLayer('https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png', {
        maxZoom: 19,
      }).addTo(mapRef.current);

      // Add photo clusters
      tokyoClusters.forEach((cluster) => {
        const createClusterHTML = (isExpanded: boolean) => `
          <div class="photo-cluster ${isExpanded ? 'expanded' : ''}" data-cluster="${cluster.id}">
            ${cluster.photos.map((photo, idx) => `
              <div class="cluster-photo" style="
                background-image: url(${photo});
                ${isExpanded ? `
                  transform: translate(${idx * 8}px, ${idx * 8}px) scale(1.1);
                  z-index: ${idx};
                ` : `
                  transform: translate(${idx * 3}px, ${idx * 3}px);
                  z-index: ${idx};
                `}
              "></div>
            `).join('')}
          </div>
        `;

        const icon = L.divIcon({
          html: createClusterHTML(false),
          className: 'photo-cluster-marker',
          iconSize: [80, 80],
          iconAnchor: [40, 40],
        });

        const marker = L.marker([cluster.lat, cluster.lng], { icon });
        
        marker.on('mouseover', () => {
          const expandedIcon = L.divIcon({
            html: createClusterHTML(true),
            className: 'photo-cluster-marker',
            iconSize: [100, 100],
            iconAnchor: [50, 50],
          });
          marker.setIcon(expandedIcon);
        });

        marker.on('mouseout', () => {
          marker.setIcon(icon);
        });

        marker.on('click', () => {
          // Handle cluster click - could navigate to detail view
          console.log('Clicked cluster:', cluster.name);
        });

        marker.addTo(mapRef.current);
      });
    };

    loadLeaflet();

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  return (
    <div className="relative w-full h-screen overflow-hidden">
      {/* Full-screen Map */}
      <div 
        ref={mapContainerRef} 
        className="absolute inset-0 w-full h-full"
      />

      {/* Hero Overlay */}
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center z-[1000] pointer-events-none animate-fade-in px-4">
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-3 sm:mb-4 text-foreground drop-shadow-2xl">
          Explore the World
        </h1>
        <p className="text-lg sm:text-xl md:text-2xl text-foreground/90 mb-6 sm:mb-8 drop-shadow-lg font-medium">
          your trips all in one loop
        </p>
        <Button
          size="lg"
          onClick={() => navigate('/search')}
          className="pointer-events-auto bg-gradient-to-r from-primary via-accent to-secondary hover:opacity-90 text-white border-0 shadow-2xl text-base sm:text-lg px-6 sm:px-8 py-4 sm:py-6"
        >
          <Compass className="mr-2 h-5 w-5 sm:h-6 sm:w-6" />
          Start Looping
        </Button>
      </div>

      {/* Photo Cluster Styles */}
      <style>{`
        .photo-cluster-marker {
          background: transparent;
          border: none;
        }

        .photo-cluster {
          position: relative;
          width: 80px;
          height: 80px;
          transition: all 0.3s ease;
        }

        .photo-cluster.expanded {
          width: 100px;
          height: 100px;
        }

        .cluster-photo {
          position: absolute;
          width: 60px;
          height: 60px;
          border-radius: 12px;
          background-size: cover;
          background-position: center;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          border: 3px solid white;
        }

        .photo-cluster.expanded .cluster-photo {
          width: 70px;
          height: 70px;
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.4);
        }

        /* Mobile touch states */
        @media (max-width: 768px) {
          .photo-cluster {
            width: 70px;
            height: 70px;
          }

          .cluster-photo {
            width: 50px;
            height: 50px;
          }

          .photo-cluster.expanded {
            width: 90px;
            height: 90px;
          }

          .photo-cluster.expanded .cluster-photo {
            width: 60px;
            height: 60px;
          }
        }

        /* Leaflet attribution */
        .leaflet-control-attribution {
          display: none !important;
        }

        /* Map controls positioning */
        .leaflet-control-zoom {
          margin: 20px !important;
          border: none !important;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15) !important;
        }

        .leaflet-control-zoom a {
          color: hsl(var(--foreground)) !important;
          background: hsl(var(--background)) !important;
          border: 1px solid hsl(var(--border)) !important;
        }

        .leaflet-control-zoom a:hover {
          background: hsl(var(--muted)) !important;
        }
      `}</style>
    </div>
  );
}
