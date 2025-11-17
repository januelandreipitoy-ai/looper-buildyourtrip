import { useRef, useState, useEffect } from 'react';
import { Canvas, useFrame, useLoader } from '@react-three/fiber';
import { OrbitControls, Sphere, shaderMaterial } from '@react-three/drei';
import * as THREE from 'three';
import { useTrip } from '@/contexts/TripContext';
import { extend } from '@react-three/fiber';

// Declare the custom material types
declare global {
  namespace JSX {
    interface IntrinsicElements {
      atmosphereMaterial: any;
    }
  }
}

// Atmospheric glow shader
const AtmosphereMaterial = shaderMaterial(
  { glowColor: new THREE.Color(0x88ccff) },
  // Vertex shader
  `
    varying vec3 vNormal;
    void main() {
      vNormal = normalize(normalMatrix * normal);
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  // Fragment shader
  `
    uniform vec3 glowColor;
    varying vec3 vNormal;
    void main() {
      float intensity = pow(0.6 - dot(vNormal, vec3(0.0, 0.0, 1.0)), 2.0);
      gl_FragColor = vec4(glowColor, 1.0) * intensity;
    }
  `
);

extend({ AtmosphereMaterial });

function RotatingGlobe() {
  const meshRef = useRef<THREE.Mesh>(null);
  const atmosphereRef = useRef<THREE.Mesh>(null);

  // Load Earth textures
  const earthTexture = useLoader(
    THREE.TextureLoader,
    'https://raw.githubusercontent.com/turban/webgl-earth/master/images/2_no_clouds_4k.jpg'
  );
  
  const bumpMap = useLoader(
    THREE.TextureLoader,
    'https://raw.githubusercontent.com/turban/webgl-earth/master/images/elev_bump_4k.jpg'
  );

  useFrame(() => {
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.001;
    }
    if (atmosphereRef.current) {
      atmosphereRef.current.rotation.y += 0.0005;
    }
  });

  return (
    <group>
      {/* Main Earth sphere */}
      <Sphere ref={meshRef} args={[2, 64, 64]}>
        <meshStandardMaterial
          map={earthTexture}
          bumpMap={bumpMap}
          bumpScale={0.05}
          roughness={0.8}
          metalness={0.1}
        />
      </Sphere>

      {/* Atmospheric glow */}
      <Sphere ref={atmosphereRef} args={[2.1, 64, 64]}>
        <atmosphereMaterial transparent glowColor={new THREE.Color(0x88ccff)} />
      </Sphere>
    </group>
  );
}

function ImageCluster({ 
  position, 
  images, 
  name,
  onClick
}: { 
  position: [number, number, number]; 
  images: string[]; 
  name: string;
  onClick?: () => void;
}) {
  const [hovered, setHovered] = useState(false);
  const groupRef = useRef<THREE.Group>(null);
  const [scale, setScale] = useState(1);

  useFrame(() => {
    if (groupRef.current) {
      groupRef.current.lookAt(0, 0, 0);
      groupRef.current.rotateY(Math.PI);
      
      // Cute bounce animation on hover
      if (hovered && scale < 1.2) {
        setScale(scale + 0.02);
      } else if (!hovered && scale > 1) {
        setScale(scale - 0.02);
      }
    }
  });

  const displayImages = images.slice(0, 3);

  return (
    <group ref={groupRef} position={position} scale={scale}>
      {/* Stacked polaroid-style images with cute tilt */}
      {displayImages.map((img, idx) => {
        const offset = (idx - 1) * 0.15; // Reduced offset for tighter cluster
        const rotation = (idx - 1) * 0.2 + (Math.random() - 0.5) * 0.1; // Random slight tilt
        const zOffset = idx * 0.02; // Stack them slightly
        
        return (
          <group
            key={idx}
            position={[offset, -idx * 0.05, zOffset]}
            rotation={[0, 0, rotation]}
            onPointerOver={() => setHovered(true)}
            onPointerOut={() => setHovered(false)}
            onClick={onClick}
          >
            {/* Cute shadow effect */}
            <mesh position={[0.02, -0.02, -0.03]}>
              <planeGeometry args={[0.42, 0.52]} />
              <meshBasicMaterial color="#000000" opacity={0.3} transparent />
            </mesh>
            
            {/* White polaroid frame with rounded edges feel */}
            <mesh position={[0, 0, -0.01]}>
              <planeGeometry args={[0.42, 0.52]} />
              <meshBasicMaterial color="#ffffff" />
            </mesh>
            
            {/* Image */}
            <mesh>
              <planeGeometry args={[0.36, 0.36]} />
              <meshBasicMaterial transparent opacity={hovered ? 1 : 0.95}>
                <primitive attach="map" object={new THREE.TextureLoader().load(img)} />
              </meshBasicMaterial>
            </mesh>

            {/* Cute sticker-like count badge */}
            {idx === 0 && displayImages.length > 1 && (
              <mesh position={[0.15, 0.2, 0.01]}>
                <circleGeometry args={[0.08, 32]} />
                <meshBasicMaterial color="#f0a868" opacity={0.95} transparent />
              </mesh>
            )}
          </group>
        );
      })}

      {/* Cute location name tag with palette colors */}
      <mesh position={[0, -0.4, 0]}>
        <planeGeometry args={[1.0, 0.25]} />
        <meshBasicMaterial color="#ffffff" opacity={0.95} transparent />
      </mesh>
      
      {/* Decorative border for name tag */}
      <mesh position={[0, -0.4, -0.01]}>
        <planeGeometry args={[1.05, 0.3]} />
        <meshBasicMaterial color="#f0a868" opacity={0.9} transparent />
      </mesh>
    </group>
  );
}

export default function Globe3D() {
  const { savedLocations } = useTrip();
  const [locationImages, setLocationImages] = useState<Record<string, string[]>>({});
  const [selectedLocation, setSelectedLocation] = useState<string | null>(null);

  // Specific locations requested by user
  const defaultLocations = [
    { id: 'dubai', name: 'Dubai', lat: 25.2048, lng: 55.2708, query: 'dubai+burj+khalifa' },
    { id: 'paris', name: 'Paris', lat: 48.8566, lng: 2.3522, query: 'paris+eiffel+tower' },
    { id: 'tokyo', name: 'Tokyo', lat: 35.6762, lng: 139.6503, query: 'tokyo+japan' },
    { id: 'nyc', name: 'New York', lat: 40.7128, lng: -74.0060, query: 'new+york+city' },
    { id: 'toronto', name: 'Toronto', lat: 43.6532, lng: -79.3832, query: 'toronto+canada' },
    { id: 'berlin', name: 'Berlin', lat: 52.5200, lng: 13.4050, query: 'berlin+germany' },
    { id: 'beijing', name: 'Beijing', lat: 39.9042, lng: 116.4074, query: 'beijing+china' },
  ];

  // Combine saved locations with default locations
  const allLocations = savedLocations.length > 0 ? savedLocations : defaultLocations;

  // Fetch multiple images for each location using direct Unsplash URLs
  useEffect(() => {
    const imageMap: Record<string, string[]> = {};
    
    for (const location of allLocations) {
      if (location.lat !== 0 && location.lng !== 0) {
        // Use direct Unsplash photo URLs for reliable loading
        const query = 'query' in location ? location.query : location.name.toLowerCase().replace(/\s+/g, '+');
        
        imageMap[location.id] = [
          `https://images.unsplash.com/photo-1${Math.floor(Math.random() * 600000000)}?w=400&h=400&fit=crop&q=80&auto=format`,
          `https://images.unsplash.com/photo-1${Math.floor(Math.random() * 600000000)}?w=400&h=400&fit=crop&q=80&auto=format`,
          `https://images.unsplash.com/photo-1${Math.floor(Math.random() * 600000000)}?w=400&h=400&fit=crop&q=80&auto=format`,
        ];
      }
    }
    
    setLocationImages(imageMap);
  }, []);

  const locationClusters = allLocations
    .filter(loc => loc.lat !== 0 && loc.lng !== 0)
    .map(loc => {
      const lat = (loc.lat * Math.PI) / 180;
      const lng = (loc.lng * Math.PI) / 180;
      const radius = 2.4;

      // Fallback images using specific Unsplash photo IDs for each location
      const fallbackImages: Record<string, string[]> = {
        dubai: [
          'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=400&h=400&fit=crop',
          'https://images.unsplash.com/photo-1582672060674-bc2bd808a8b5?w=400&h=400&fit=crop',
          'https://images.unsplash.com/photo-1518684079-3c830dcef090?w=400&h=400&fit=crop'
        ],
        paris: [
          'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=400&h=400&fit=crop',
          'https://images.unsplash.com/photo-1511739001486-6bfe10ce785f?w=400&h=400&fit=crop',
          'https://images.unsplash.com/photo-1509439581779-6298f75bf6e5?w=400&h=400&fit=crop'
        ],
        tokyo: [
          'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=400&h=400&fit=crop',
          'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?w=400&h=400&fit=crop',
          'https://images.unsplash.com/photo-1513407030348-c983a97b98d8?w=400&h=400&fit=crop'
        ],
        nyc: [
          'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=400&h=400&fit=crop',
          'https://images.unsplash.com/photo-1485871981521-5b1fd3805eee?w=400&h=400&fit=crop',
          'https://images.unsplash.com/photo-1499092346589-b9b6be3e94b2?w=400&h=400&fit=crop'
        ],
        toronto: [
          'https://images.unsplash.com/photo-1517935706615-2717063c2225?w=400&h=400&fit=crop',
          'https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9?w=400&h=400&fit=crop',
          'https://images.unsplash.com/photo-1519178511508-8e7c3c665e7f?w=400&h=400&fit=crop'
        ],
        berlin: [
          'https://images.unsplash.com/photo-1560969184-10fe8719e047?w=400&h=400&fit=crop',
          'https://images.unsplash.com/photo-1528728329032-2972f65dfb3f?w=400&h=400&fit=crop',
          'https://images.unsplash.com/photo-1599946347371-68eb71b16afc?w=400&h=400&fit=crop'
        ],
        beijing: [
          'https://images.unsplash.com/photo-1508804185872-d7badad00f7d?w=400&h=400&fit=crop',
          'https://images.unsplash.com/photo-1547981609-4b6bfe67ca0b?w=400&h=400&fit=crop',
          'https://images.unsplash.com/photo-1559590234-8c8c86e5df6d?w=400&h=400&fit=crop'
        ]
      };

      return {
        id: loc.id,
        position: [
          radius * Math.cos(lat) * Math.cos(lng),
          radius * Math.sin(lat),
          radius * Math.cos(lat) * Math.sin(lng)
        ] as [number, number, number],
        images: fallbackImages[loc.id] || locationImages[loc.id] || ['https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=400&h=400&fit=crop'],
        name: loc.name
      };
    });

  return (
    <div className="w-full h-screen bg-background">
      <Canvas camera={{ position: [0, 0, 8], fov: 45 }}>
        <ambientLight intensity={0.4} />
        <directionalLight position={[5, 3, 5]} intensity={1.5} />
        <pointLight position={[-5, -3, -5]} intensity={0.5} color="#f0a868" />
        <pointLight position={[3, 3, 3]} intensity={0.3} color="#e88d67" />
        
        <RotatingGlobe />
        
        {locationClusters.map((cluster, idx) => (
          <ImageCluster
            key={cluster.id}
            position={cluster.position}
            images={cluster.images}
            name={cluster.name}
            onClick={() => {
              setSelectedLocation(cluster.id);
              console.log('Clicked location:', cluster.name);
            }}
          />
        ))}
        
        <OrbitControls
          enableZoom={true}
          enablePan={false}
          minDistance={5}
          maxDistance={12}
          autoRotate
          autoRotateSpeed={0.3}
        />
      </Canvas>

      {/* Cute location info popup when cluster is clicked */}
      {selectedLocation && (
        <div className="absolute top-20 right-8 bg-white rounded-3xl shadow-2xl p-6 max-w-sm border-4 border-primary/20 animate-in fade-in slide-in-from-right">
          <button
            onClick={() => setSelectedLocation(null)}
            className="absolute top-3 right-3 text-muted-foreground hover:text-foreground"
          >
            ✕
          </button>
          <h3 className="text-2xl font-bold text-foreground mb-2">
            {allLocations.find(l => l.id === selectedLocation)?.name}
          </h3>
          <p className="text-muted-foreground mb-4">Click to explore this destination!</p>
          <div className="grid grid-cols-3 gap-2">
            {(locationImages[selectedLocation] || []).map((img, idx) => (
              <img
                key={idx}
                src={img}
                alt=""
                className="w-full h-20 object-cover rounded-lg border-2 border-white shadow-md"
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
