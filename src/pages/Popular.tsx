import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MapPin, Heart, Share2 } from 'lucide-react';
import { SimpleSearchBar } from '@/components/SimpleSearchBar';

interface CommunityItinerary {
  id: string;
  title: string;
  heroImage: string;
  days: number;
  location: string;
  author: string;
  likes: number;
  vibe?: string;
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
    vibe: 'cute',
  },
  {
    id: '2',
    title: 'Japan Food Lover Route',
    heroImage: 'https://images.unsplash.com/photo-1528360983277-13d401cdc186?w=800',
    days: 7,
    location: 'Tokyo, Osaka, Kyoto',
    author: 'Foodie Traveler',
    likes: 445,
    vibe: 'fun',
  },
  {
    id: '3',
    title: 'Kyoto Culture Path',
    heroImage: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=800',
    days: 4,
    location: 'Kyoto, Japan',
    author: 'Culture Enthusiast',
    likes: 332,
    vibe: 'chill',
  },
  {
    id: '4',
    title: 'Hidden Gems of Osaka',
    heroImage: 'https://images.unsplash.com/photo-1590559899731-a382839e5549?w=800',
    days: 2,
    location: 'Osaka, Japan',
    author: 'Local Guide',
    likes: 189,
    vibe: 'mysterious',
  },
  {
    id: '5',
    title: 'Romantic Paris Getaway',
    heroImage: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=800',
    days: 5,
    location: 'Paris, France',
    author: 'Romance Planner',
    likes: 567,
    vibe: 'romantic',
  },
  {
    id: '6',
    title: 'Luxury Dubai Experience',
    heroImage: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=800',
    days: 4,
    location: 'Dubai, UAE',
    author: 'Luxury Traveler',
    likes: 423,
    vibe: 'fancy',
  },
];

export default function Popular() {
  const [activeTab, setActiveTab] = useState<'forYou' | 'trending' | 'templates'>('forYou');
  const [activeVibe, setActiveVibe] = useState<string>('all');

  const vibes = ['all', 'fun', 'mysterious', 'chill', 'vibe', 'cute', 'fancy', 'romantic'];

  const filteredItineraries = activeVibe === 'all' 
    ? mockItineraries 
    : mockItineraries.filter(it => it.vibe === activeVibe);

  return (
    <div className="min-h-screen bg-background pb-24 md:pl-20">
      <div className="container mx-auto px-4 pt-6">
        {/* Search Bar */}
        <div className="mb-6">
          <SimpleSearchBar placeholder="Search community itineraries..." />
        </div>
        <h1 className="text-3xl font-bold text-foreground mb-6">Popular</h1>

        {/* Main Tabs */}
        <div className="flex gap-2 mb-4 overflow-x-auto scrollbar-hide">
          <Button
            onClick={() => setActiveTab('forYou')}
            variant={activeTab === 'forYou' ? 'default' : 'outline'}
            className="rounded-2xl whitespace-nowrap"
          >
            For You
          </Button>
          <Button
            onClick={() => setActiveTab('trending')}
            variant={activeTab === 'trending' ? 'default' : 'outline'}
            className="rounded-2xl whitespace-nowrap"
          >
            Trending
          </Button>
          <Button
            onClick={() => setActiveTab('templates')}
            variant={activeTab === 'templates' ? 'default' : 'outline'}
            className="rounded-2xl whitespace-nowrap"
          >
            Templates
          </Button>
        </div>

        {/* Vibe Subcategory Tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto scrollbar-hide pb-2">
          {vibes.map((vibe) => (
            <Badge
              key={vibe}
              variant={activeVibe === vibe ? 'default' : 'outline'}
              className="cursor-pointer whitespace-nowrap px-4 py-2 rounded-2xl capitalize"
              onClick={() => setActiveVibe(vibe)}
            >
              {vibe}
            </Badge>
          ))}
        </div>

        {/* Masonry Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredItineraries.map((itinerary) => (
            <Card
              key={itinerary.id}
              className="overflow-hidden hover:shadow-lg transition-all duration-300 cursor-pointer rounded-2xl group"
            >
              <div className="relative">
                <img
                  src={itinerary.heroImage}
                  alt={itinerary.title}
                  className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <Badge className="absolute top-3 right-3 bg-secondary text-secondary-foreground rounded-full">
                  {itinerary.days} Days
                </Badge>
                <div className="absolute top-3 left-3 flex gap-2">
                  <Button
                    size="icon"
                    variant="secondary"
                    className="h-8 w-8 rounded-full"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <Heart className="h-4 w-4" />
                  </Button>
                  <Button
                    size="icon"
                    variant="secondary"
                    className="h-8 w-8 rounded-full"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <Share2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <div className="p-4">
                <h3 className="font-semibold text-lg mb-2">{itinerary.title}</h3>
                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
                  <MapPin className="h-4 w-4" />
                  <span>{itinerary.location}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">by {itinerary.author}</span>
                  <div className="flex items-center gap-1 text-[hsl(var(--soft-coral))]">
                    <Heart className="h-4 w-4 fill-current" />
                    <span className="font-medium">{itinerary.likes}</span>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
