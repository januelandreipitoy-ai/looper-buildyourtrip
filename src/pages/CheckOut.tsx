import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MapPin, Calendar, Users } from 'lucide-react';

interface CommunityItinerary {
  id: string;
  title: string;
  heroImage: string;
  days: number;
  location: string;
  author: string;
  likes: number;
}

const mockItineraries: CommunityItinerary[] = [
  {
    id: '1',
    title: '3 Days in Tokyo',
    heroImage: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=800',
    days: 3,
    location: 'Tokyo, Japan',
    author: 'Travel Explorer',
    likes: 234,
  },
  {
    id: '2',
    title: 'Japan Food Lover Route',
    heroImage: 'https://images.unsplash.com/photo-1528360983277-13d401cdc186?w=800',
    days: 7,
    location: 'Tokyo, Osaka, Kyoto',
    author: 'Foodie Traveler',
    likes: 445,
  },
  {
    id: '3',
    title: 'Kyoto Culture Path',
    heroImage: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=800',
    days: 4,
    location: 'Kyoto, Japan',
    author: 'Culture Enthusiast',
    likes: 332,
  },
  {
    id: '4',
    title: 'Hidden Gems of Osaka',
    heroImage: 'https://images.unsplash.com/photo-1590559899731-a382839e5549?w=800',
    days: 2,
    location: 'Osaka, Japan',
    author: 'Local Guide',
    likes: 189,
  },
];

export default function CheckOut() {
  const [activeTab, setActiveTab] = useState<'forYou' | 'trending' | 'templates'>('forYou');

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="container mx-auto px-4 pt-6">
        <h1 className="text-3xl font-bold text-foreground mb-6">Check Out</h1>

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setActiveTab('forYou')}
            className={`px-6 py-2 rounded-full font-medium transition-all ${
              activeTab === 'forYou'
                ? 'bg-primary text-primary-foreground'
                : 'bg-card text-muted-foreground hover:bg-muted'
            }`}
          >
            For You
          </button>
          <button
            onClick={() => setActiveTab('trending')}
            className={`px-6 py-2 rounded-full font-medium transition-all ${
              activeTab === 'trending'
                ? 'bg-primary text-primary-foreground'
                : 'bg-card text-muted-foreground hover:bg-muted'
            }`}
          >
            Trending
          </button>
          <button
            onClick={() => setActiveTab('templates')}
            className={`px-6 py-2 rounded-full font-medium transition-all ${
              activeTab === 'templates'
                ? 'bg-primary text-primary-foreground'
                : 'bg-card text-muted-foreground hover:bg-muted'
            }`}
          >
            Templates
          </button>
        </div>

        {/* Masonry Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {mockItineraries.map((itinerary) => (
            <Card
              key={itinerary.id}
              className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
            >
              <div className="relative">
                <img
                  src={itinerary.heroImage}
                  alt={itinerary.title}
                  className="w-full h-48 object-cover"
                />
                <Badge className="absolute top-3 right-3 bg-secondary text-secondary-foreground">
                  {itinerary.days} Days
                </Badge>
              </div>
              <div className="p-4">
                <h3 className="font-semibold text-lg mb-2">{itinerary.title}</h3>
                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
                  <MapPin className="h-4 w-4" />
                  <span>{itinerary.location}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">by {itinerary.author}</span>
                  <span className="text-primary font-medium">❤️ {itinerary.likes}</span>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
