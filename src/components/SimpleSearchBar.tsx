import { useState, useEffect } from 'react';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';

interface SearchSuggestion {
  id: string;
  name: string;
  city: string;
  category: string;
  image: string;
}

interface SimpleSearchBarProps {
  onSelectLocation?: (location: SearchSuggestion) => void;
  placeholder?: string;
}

// Mock data for search suggestions
const mockSuggestions: SearchSuggestion[] = [
  {
    id: '1',
    name: 'Tokyo Tower',
    city: 'Tokyo, Japan',
    category: 'Landmarks',
    image: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=300',
  },
  {
    id: '2',
    name: 'Shibuya Crossing',
    city: 'Tokyo, Japan',
    category: 'City Life',
    image: 'https://images.unsplash.com/photo-1526481280693-3bfa7568e0f3?w=300',
  },
  {
    id: '3',
    name: 'Fushimi Inari',
    city: 'Kyoto, Japan',
    category: 'Temples',
    image: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=300',
  },
  {
    id: '4',
    name: 'Arashiyama Bamboo',
    city: 'Kyoto, Japan',
    category: 'Nature',
    image: 'https://images.unsplash.com/photo-1478436127897-769e1b3f0f36?w=300',
  },
  {
    id: '5',
    name: 'Osaka Castle',
    city: 'Osaka, Japan',
    category: 'Landmarks',
    image: 'https://images.unsplash.com/photo-1590559899731-a382839e5549?w=300',
  },
];

export function SimpleSearchBar({ onSelectLocation, placeholder = "Search destinations..." }: SimpleSearchBarProps) {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  useEffect(() => {
    if (query.length > 0) {
      // Filter suggestions based on query
      const filtered = mockSuggestions.filter(
        (s) =>
          s.name.toLowerCase().includes(query.toLowerCase()) ||
          s.city.toLowerCase().includes(query.toLowerCase()) ||
          s.category.toLowerCase().includes(query.toLowerCase())
      );
      setSuggestions(filtered);
      setShowSuggestions(true);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  }, [query]);

  const handleSelect = (suggestion: SearchSuggestion) => {
    setQuery('');
    setShowSuggestions(false);
    onSelectLocation?.(suggestion);
  };

  return (
    <div className="relative w-full max-w-2xl mx-auto">
      <div className="relative">
        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
        <Input
          type="text"
          placeholder={placeholder}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => query.length > 0 && setShowSuggestions(true)}
          onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
          className="pl-12 pr-4 py-6 rounded-3xl border-2 border-border focus:border-[hsl(var(--soft-coral))] transition-colors text-base"
        />
      </div>

      {/* Suggestions dropdown */}
      {showSuggestions && suggestions.length > 0 && (
        <Card className="absolute top-full mt-2 w-full max-h-96 overflow-y-auto rounded-2xl shadow-lg z-50">
          {suggestions.map((suggestion) => (
            <button
              key={suggestion.id}
              onClick={() => handleSelect(suggestion)}
              className="w-full flex items-center gap-4 p-3 hover:bg-muted transition-colors border-b border-border last:border-0"
            >
              <img
                src={suggestion.image}
                alt={suggestion.name}
                className="w-16 h-16 object-cover rounded-xl flex-shrink-0"
              />
              <div className="flex-1 text-left">
                <p className="font-semibold text-foreground">{suggestion.name}</p>
                <p className="text-sm text-muted-foreground">{suggestion.city}</p>
                <p className="text-xs text-[hsl(var(--soft-coral))]">{suggestion.category}</p>
              </div>
            </button>
          ))}
        </Card>
      )}
    </div>
  );
}
