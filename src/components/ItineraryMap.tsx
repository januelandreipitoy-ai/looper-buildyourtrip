import React, { useEffect, useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Sphere, Line } from '@react-three/drei';
import * as THREE from 'three';
import { SavedLocation, TimeSlot } from '@/contexts/TripContext';

interface ItineraryMapProps {
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

// Convert lat/lng to 3D coordinates on sphere
const latLngToVector3 = (lat: number, lng: number, radius: number = 5) => {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lng + 180) * (Math.PI / 180);
  
  const x = -radius * Math.sin(phi) * Math.cos(theta);
  const z = radius * Math.sin(phi) * Math.sin(theta);
  const y = radius * Math.cos(phi);
  
  return new THREE.Vector3(x, y, z);
};

const LocationMarker = ({ 
  location, 
  isHighlighted, 
  onClick 
}: { 
  location: SavedLocation; 
  isHighlighted: boolean;
  onClick: () => void;
}) => {
  const position = latLngToVector3(location.lat, location.lng);
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (meshRef.current && isHighlighted) {
      meshRef.current.scale.setScalar(1 + Math.sin(state.clock.elapsedTime * 3) * 0.2);
    }
  });

  return (
    <mesh
      ref={meshRef}
      position={position}
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
    >
      <sphereGeometry args={[isHighlighted ? 0.15 : 0.08, 16, 16]} />
      <meshStandardMaterial 
        color={isHighlighted ? '#ff6b6b' : '#4a90e2'} 
        emissive={isHighlighted ? '#ff6b6b' : '#4a90e2'}
        emissiveIntensity={0.5}
      />
    </mesh>
  );
};

const RouteLines = ({ locations }: { locations: SavedLocation[] }) => {
  const points = useMemo(() => {
    const pts: THREE.Vector3[] = [];
    for (let i = 0; i < locations.length - 1; i++) {
      const start = latLngToVector3(locations[i].lat, locations[i].lng);
      const end = latLngToVector3(locations[i + 1].lat, locations[i + 1].lng);
      
      // Create curved path between points
      const curve = new THREE.QuadraticBezierCurve3(
        start,
        start.clone().lerp(end, 0.5).multiplyScalar(1.1), // Control point above surface
        end
      );
      
      const curvePoints = curve.getPoints(20);
      pts.push(...curvePoints);
    }
    return pts;
  }, [locations]);

  if (points.length === 0) return null;

  return (
    <Line
      points={points}
      color="#4a90e2"
      lineWidth={2}
      opacity={0.6}
      transparent
    />
  );
};

const Globe = ({ 
  locations, 
  highlightedLocation,
  onLocationClick 
}: {
  locations: SavedLocation[];
  highlightedLocation: SavedLocation | null;
  onLocationClick: (location: SavedLocation) => void;
}) => {
  const globeRef = useRef<THREE.Mesh>(null);

  useFrame(() => {
    if (globeRef.current) {
      globeRef.current.rotation.y += 0.001;
    }
  });

  return (
    <>
      {/* Globe */}
      <Sphere ref={globeRef} args={[5, 64, 64]}>
        <meshStandardMaterial
          color="#1a1f35"
          roughness={0.9}
          metalness={0.1}
        />
      </Sphere>

      {/* Location markers */}
      {locations.map((location) => (
        <LocationMarker
          key={location.id}
          location={location}
          isHighlighted={highlightedLocation?.id === location.id}
          onClick={() => onLocationClick(location)}
        />
      ))}

      {/* Route lines */}
      <RouteLines locations={locations} />
    </>
  );
};

const ItineraryMap: React.FC<ItineraryMapProps> = ({ 
  days, 
  highlightedLocation, 
  onLocationClick 
}) => {
  const allLocations = useMemo(() => {
    const locs: SavedLocation[] = [];
    days.forEach(day => {
      if (day.timeSlots.morning?.location) locs.push(day.timeSlots.morning.location);
      if (day.timeSlots.afternoon?.location) locs.push(day.timeSlots.afternoon.location);
      if (day.timeSlots.evening?.location) locs.push(day.timeSlots.evening.location);
    });
    return locs;
  }, [days]);

  return (
    <div className="w-full h-full bg-gradient-to-b from-slate-900 to-slate-800">
      <Canvas camera={{ position: [0, 0, 15], fov: 45 }}>
        <ambientLight intensity={0.3} />
        <pointLight position={[10, 10, 10]} intensity={1} />
        <pointLight position={[-10, -10, -10]} intensity={0.5} />
        
        <Globe 
          locations={allLocations}
          highlightedLocation={highlightedLocation}
          onLocationClick={onLocationClick}
        />
        
        <OrbitControls 
          enableZoom={true}
          enablePan={false}
          minDistance={10}
          maxDistance={25}
          autoRotate={false}
        />
        
        {/* Stars background */}
        <Stars />
      </Canvas>
    </div>
  );
};

// Simple stars component
const Stars = () => {
  const points = useMemo(() => {
    const pts: THREE.Vector3[] = [];
    for (let i = 0; i < 1000; i++) {
      const r = 50;
      const theta = 2 * Math.PI * Math.random();
      const phi = Math.acos(2 * Math.random() - 1);
      const x = r * Math.sin(phi) * Math.cos(theta);
      const y = r * Math.sin(phi) * Math.sin(theta);
      const z = r * Math.cos(phi);
      pts.push(new THREE.Vector3(x, y, z));
    }
    return pts;
  }, []);

  return (
    <points>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={points.length}
          array={new Float32Array(points.flatMap(p => [p.x, p.y, p.z]))}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial size={0.1} color="#ffffff" />
    </points>
  );
};

export default ItineraryMap;
