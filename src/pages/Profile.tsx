import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { User, MapPin, Calendar, Settings, Moon, Sun } from 'lucide-react';
import { useTheme } from '@/components/ThemeProvider';
import { useIsMobile } from '@/hooks/use-mobile';

export default function Profile() {
  const [showSettings, setShowSettings] = useState(false);
  const { theme, setTheme } = useTheme();
  const isMobile = useIsMobile();

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="container mx-auto px-4 pt-6 max-w-2xl">
        {/* Profile Header */}
        <div className="flex items-center gap-4 mb-6">
          <Avatar className="h-20 w-20">
            <AvatarImage src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200" />
            <AvatarFallback>JD</AvatarFallback>
          </Avatar>
          <div>
            <h1 className="text-2xl font-bold text-foreground">John Doe</h1>
            <p className="text-muted-foreground">Travel Enthusiast</p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <Card className="p-4 text-center rounded-2xl">
            <p className="text-2xl font-bold text-foreground">12</p>
            <p className="text-sm text-muted-foreground">Saved Trips</p>
          </Card>
          <Card className="p-4 text-center rounded-2xl">
            <p className="text-2xl font-bold text-foreground">8</p>
            <p className="text-sm text-muted-foreground">Countries</p>
          </Card>
          <Card className="p-4 text-center rounded-2xl">
            <p className="text-2xl font-bold text-foreground">24</p>
            <p className="text-sm text-muted-foreground">Journals</p>
          </Card>
        </div>

        {/* Settings Section - Show on Mobile */}
        {isMobile && (
          <Card className="p-6 mb-6 rounded-2xl">
            <div 
              className="flex items-center justify-between cursor-pointer"
              onClick={() => setShowSettings(!showSettings)}
            >
              <div className="flex items-center gap-3">
                <Settings className="h-5 w-5 text-muted-foreground" />
                <h2 className="text-lg font-semibold">Settings</h2>
              </div>
              <Button variant="ghost" size="icon">
                {showSettings ? '▲' : '▼'}
              </Button>
            </div>

            {showSettings && (
              <div className="mt-4 space-y-4">
                <Separator />
                
                {/* Theme Toggle */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {theme === 'dark' ? (
                      <Moon className="h-5 w-5 text-muted-foreground" />
                    ) : (
                      <Sun className="h-5 w-5 text-muted-foreground" />
                    )}
                    <span className="text-sm font-medium">Appearance</span>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setTheme(theme === "light" ? "dark" : "light")}
                    className="rounded-2xl"
                  >
                    {theme === 'dark' ? 'Dark Mode' : 'Light Mode'}
                  </Button>
                </div>

                <Separator />

                {/* Other Settings Placeholders */}
                <div className="space-y-3">
                  <div className="text-sm text-muted-foreground">
                    <p>• Account Settings</p>
                    <p>• Privacy & Security</p>
                    <p>• Notifications</p>
                    <p>• Help & Support</p>
                  </div>
                </div>
              </div>
            )}
          </Card>
        )}

        {/* Saved Content Sections */}
        <div className="space-y-4">
          <Card className="p-6 rounded-2xl">
            <div className="flex items-center gap-3 mb-4">
              <MapPin className="h-5 w-5 text-primary" />
              <h2 className="text-lg font-semibold">Saved Trips</h2>
            </div>
            <p className="text-sm text-muted-foreground">
              Your saved itineraries and trip plans will appear here
            </p>
          </Card>

          <Card className="p-6 rounded-2xl">
            <div className="flex items-center gap-3 mb-4">
              <Calendar className="h-5 w-5 text-primary" />
              <h2 className="text-lg font-semibold">Travel Journals</h2>
            </div>
            <p className="text-sm text-muted-foreground">
              Your travel memories and journal entries will appear here
            </p>
          </Card>
        </div>
      </div>
    </div>
  );
}

