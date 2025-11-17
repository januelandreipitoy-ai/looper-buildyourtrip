import { useState, KeyboardEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import Lottie from 'lottie-react';
import { Search as SearchIcon } from 'lucide-react';
import { useTrip } from '@/contexts/TripContext';
import animationData from '@/assets/looper-animation.json';

// Famous destinations for the animated background columns
const DESTINATIONS = [
  // Column 1 (scrolls up)
  [
    'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=800&auto=format&fit=crop', // Tokyo
    'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=800&auto=format&fit=crop', // Paris
    'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=800&auto=format&fit=crop', // Bali
    'https://images.unsplash.com/photo-1572252009286-268acec5ca0a?w=800&auto=format&fit=crop', // Cairo
    'https://images.unsplash.com/photo-1517154421773-0529f29ea451?w=800&auto=format&fit=crop', // Seoul
  ],
  // Column 2 (scrolls down)
  [
    'https://images.unsplash.com/photo-1485871981521-5b1fd3805eee?w=800&auto=format&fit=crop', // New York
    'https://images.unsplash.com/photo-1539037116277-4db20889f2d4?w=800&auto=format&fit=crop', // Marrakesh
    'https://images.unsplash.com/photo-1613395877344-13d4a8e0d49e?w=800&auto=format&fit=crop', // Santorini
    'https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9?w=800&auto=format&fit=crop', // Sydney
    'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=800&auto=format&fit=crop', // Dubai
  ],
  // Column 3 (scrolls up)
  [
    'https://images.unsplash.com/photo-1513581166391-887a96ddeafd?w=800&auto=format&fit=crop', // London
    'https://images.unsplash.com/photo-1552832230-c0197dd311b5?w=800&auto=format&fit=crop', // Rome
    'https://images.unsplash.com/photo-1528127269322-539801943592?w=800&auto=format&fit=crop', // Barcelona
    'https://images.unsplash.com/photo-1501594907352-04cda38ebc29?w=800&auto=format&fit=crop', // Bali Beach
    'https://images.unsplash.com/photo-1480714378408-67cf0d13bc1b?w=800&auto=format&fit=crop', // Iceland
  ],
  // Column 4 (scrolls down)
  [
    'https://images.unsplash.com/photo-1486299267070-83823f5448dd?w=800&auto=format&fit=crop', // London Bridge
    'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=800&auto=format&fit=crop', // Food Market
    'https://images.unsplash.com/photo-1551632811-561732d1e306?w=800&auto=format&fit=crop', // Hiking
    'https://images.unsplash.com/photo-1524850011238-e3d235c7d4c9?w=800&auto=format&fit=crop', // Petra
    'https://images.unsplash.com/photo-1583330326428-f74e5449f65e?w=800&auto=format&fit=crop', // Taj Mahal
  ],
];

export default function Search() {
  const navigate = useNavigate();
  const { setSearchParams } = useTrip();
  const [destination, setDestination] = useState('');
  const [isSearching, setIsSearching] = useState(false);

  const handleSearch = () => {
    if (!destination.trim()) return;
    
    setIsSearching(true);
    setSearchParams({ 
      destination: destination.trim(), 
      days: 7,
      adults: 2, 
      children: 0, 
      infants: 0, 
      pets: 0 
    });
    
    setTimeout(() => {
      navigate('/explore', { state: { searchDestination: destination.trim() } });
    }, 800);
  };

  const handleKeyPress = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <div className="relative w-full h-screen overflow-hidden bg-background">
      {/* Animated Background Columns */}
      <div className="absolute inset-0 flex gap-4 justify-center opacity-15 px-4">
        {DESTINATIONS.map((column, colIndex) => (
          <div
            key={colIndex}
            className="flex flex-col gap-4 flex-1 max-w-[400px]"
            style={{
              animation: colIndex % 2 === 0 
                ? 'scrollUp 60s linear infinite' 
                : 'scrollDown 60s linear infinite',
            }}
          >
            {/* Double the images for seamless loop */}
            {[...column, ...column].map((img, imgIndex) => (
              <div
                key={imgIndex}
                className="w-full aspect-[3/4] flex-shrink-0 rounded-lg overflow-hidden"
              >
                <img
                  src={img}
                  alt=""
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              </div>
            ))}
          </div>
        ))}
      </div>

      {/* Lottie Animation - Full Screen Background */}
      <div className="absolute inset-0 z-0 flex items-center justify-center">
        <Lottie 
          animationData={animationData}
          loop={true}
          className="w-full h-full"
          style={{ minWidth: '100%', minHeight: '100%', objectFit: 'cover' }}
        />
      </div>

      {/* Main Content */}
      <div className="relative z-10 h-full flex flex-col items-center justify-center px-4">
        {/* Search Bar - White Design */}
        <div 
          className={`w-full max-w-4xl px-4 transition-all duration-700 ${
            isSearching ? 'opacity-0 scale-95 translate-y-20' : 'opacity-100 scale-100'
          }`}
        >
          <div className="relative">
            <div className="flex items-center bg-white dark:bg-white rounded-full shadow-2xl px-6 py-4 focus-within:shadow-2xl focus-within:ring-2 focus-within:ring-primary/20 transition-all">
              <SearchIcon className="w-5 h-5 text-muted-foreground mr-3 flex-shrink-0" />
              <input
                type="text"
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Quick search a country, city, or experience..."
                className="flex-1 bg-transparent text-base text-foreground dark:text-[#2d1b3d] placeholder:text-muted-foreground dark:placeholder:text-[#7a6b8a] focus:outline-none"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Loading Overlay */}
      {isSearching && (
        <div className="fixed inset-0 flex items-center justify-center bg-background/90 backdrop-blur-lg z-50">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-xl font-medium text-foreground">
              Discovering {destination}...
            </p>
          </div>
        </div>
      )}

      <style>{`
        @keyframes scrollUp {
          0% {
            transform: translateY(0);
          }
          100% {
            transform: translateY(-50%);
          }
        }
        
        @keyframes scrollDown {
          0% {
            transform: translateY(-50%);
          }
          100% {
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}
