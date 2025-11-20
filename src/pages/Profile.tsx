import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Settings, MapPin, Calendar, Heart, Share2 } from 'lucide-react';

export default function Profile() {
  const savedTrips = [
    {
      id: '1',
      title: 'Tokyo Adventure',
      image: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=400',
      days: 5,
      locations: 12,
    },
    {
      id: '2',
      title: 'Kyoto Culture',
      image: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=400',
      days: 3,
      locations: 8,
    },
    {
      id: '3',
      title: 'Osaka Food Tour',
      image: 'https://images.unsplash.com/photo-1590559899731-a382839e5549?w=400',
      days: 2,
      locations: 6,
    },
  ];

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="container mx-auto px-4 pt-6">
        {/* Profile Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Avatar className="h-20 w-20">
              <AvatarImage src="https://api.dicebear.com/7.x/avataaars/svg?seed=traveler" />
              <AvatarFallback>TR</AvatarFallback>
            </Avatar>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Travel Explorer</h1>
              <p className="text-muted-foreground">@explorer_2025</p>
            </div>
          </div>
          <Button variant="outline" size="icon">
            <Settings className="h-5 w-5" />
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <Card className="p-4 text-center">
            <MapPin className="h-6 w-6 mx-auto mb-2 text-primary" />
            <p className="text-2xl font-bold text-foreground">12</p>
            <p className="text-sm text-muted-foreground">Trips</p>
          </Card>
          <Card className="p-4 text-center">
            <Calendar className="h-6 w-6 mx-auto mb-2 text-secondary" />
            <p className="text-2xl font-bold text-foreground">28</p>
            <p className="text-sm text-muted-foreground">Days</p>
          </Card>
          <Card className="p-4 text-center">
            <Heart className="h-6 w-6 mx-auto mb-2 text-burnt-orange" />
            <p className="text-2xl font-bold text-foreground">45</p>
            <p className="text-sm text-muted-foreground">Saved</p>
          </Card>
        </div>

        {/* Badges */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-foreground mb-4">Travel Badges</h2>
          <div className="flex gap-2 flex-wrap">
            <Badge variant="secondary" className="px-4 py-2">🌸 Spring Explorer</Badge>
            <Badge variant="secondary" className="px-4 py-2">🍜 Food Lover</Badge>
            <Badge variant="secondary" className="px-4 py-2">⛩️ Culture Seeker</Badge>
            <Badge variant="secondary" className="px-4 py-2">📸 Photo Master</Badge>
          </div>
        </div>

        {/* Saved Trips */}
        <div>
          <h2 className="text-xl font-semibold text-foreground mb-4">Saved Trips</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {savedTrips.map((trip) => (
              <Card key={trip.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                <div className="relative">
                  <img
                    src={trip.image}
                    alt={trip.title}
                    className="w-full h-40 object-cover"
                  />
                  <Button
                    size="icon"
                    variant="secondary"
                    className="absolute top-3 right-3"
                  >
                    <Share2 className="h-4 w-4" />
                  </Button>
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-lg mb-2">{trip.title}</h3>
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <span>{trip.days} days</span>
                    <span>{trip.locations} locations</span>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
