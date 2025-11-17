import React, { useState, useRef, useEffect } from 'react';
import { Send, Image as ImageIcon, X, Loader2, Sparkles, Calendar, Camera, Hotel, UtensilsCrossed, Coffee, Car, MapPin } from 'lucide-react';
import { toast } from 'sonner';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  imageUrl?: string;
}

interface TravelChatboxProps {
  selectedLocations: any[];
  onLocationsExtracted?: (locations: any[]) => void;
}

const TravelChatbox = ({ selectedLocations, onLocationsExtracted }: TravelChatboxProps) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Image must be less than 5MB');
        return;
      }

      const reader = new FileReader();
      reader.onload = (event) => {
        setUploadedImage(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const streamChat = async (userMessages: Message[], isDayPlan: boolean = false) => {
    const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/travel-chat`;
    
    const messagesToSend = userMessages.map(msg => {
      if (msg.imageUrl) {
        return {
          role: msg.role,
          content: [
            { type: 'text', text: msg.content },
            { type: 'image_url', image_url: { url: msg.imageUrl } }
          ]
        };
      }
      return { role: msg.role, content: msg.content };
    });

    const resp = await fetch(CHAT_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
      },
      body: JSON.stringify({ 
        messages: messagesToSend,
        selectedLocations,
        requestDayPlan: isDayPlan
      }),
    });

    if (!resp.ok) {
      const errorData = await resp.json().catch(() => ({}));
      if (resp.status === 429) {
        toast.error('Rate limit exceeded. Please try again later.');
      } else if (resp.status === 402) {
        toast.error('AI credits exhausted. Please add credits to continue.');
      } else {
        toast.error(errorData.error || 'Failed to get AI response');
      }
      throw new Error('Failed to start stream');
    }

    if (!resp.body) throw new Error('No response body');

    const reader = resp.body.getReader();
    const decoder = new TextDecoder();
    let textBuffer = '';
    let streamDone = false;
    let assistantContent = '';

    while (!streamDone) {
      const { done, value } = await reader.read();
      if (done) break;
      textBuffer += decoder.decode(value, { stream: true });

      let newlineIndex: number;
      while ((newlineIndex = textBuffer.indexOf('\n')) !== -1) {
        let line = textBuffer.slice(0, newlineIndex);
        textBuffer = textBuffer.slice(newlineIndex + 1);

        if (line.endsWith('\r')) line = line.slice(0, -1);
        if (line.startsWith(':') || line.trim() === '') continue;
        if (!line.startsWith('data: ')) continue;

        const jsonStr = line.slice(6).trim();
        if (jsonStr === '[DONE]') {
          streamDone = true;
          break;
        }

        try {
          const parsed = JSON.parse(jsonStr);
          const content = parsed.choices?.[0]?.delta?.content as string | undefined;
          if (content) {
            assistantContent += content;
            setMessages(prev => {
              const last = prev[prev.length - 1];
              if (last?.role === 'assistant') {
                return prev.map((m, i) => 
                  i === prev.length - 1 ? { ...m, content: assistantContent } : m
                );
              }
              return [...prev, { role: 'assistant', content: assistantContent }];
            });
          }
        } catch {
          textBuffer = line + '\n' + textBuffer;
          break;
        }
      }
    }

    // After streaming is complete, extract locations if it was a day plan
    if (isDayPlan && assistantContent && onLocationsExtracted) {
      console.log('Extracting locations from day plan...');
      extractAndDisplayLocations(assistantContent);
    }
  };

  const handleSend = async () => {
    if (!input.trim() && !uploadedImage) return;

    const userMessage: Message = {
      role: 'user',
      content: input || 'What locations would you suggest based on this image?',
      imageUrl: uploadedImage || undefined,
    };

    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput('');
    setUploadedImage(null);
    setIsLoading(true);

    try {
      await streamChat(newMessages, false);
    } catch (error) {
      console.error('Chat error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePlanMyDay = async () => {
    const userMessage: Message = {
      role: 'user',
      content: 'Create a complete day itinerary for me in Dubai with specific locations, times, and activities for each spot.',
    };

    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setIsLoading(true);

    try {
      await streamChat(newMessages, true);
      toast.success('Day plan generated and displayed on map!');
    } catch (error) {
      console.error('Day plan error:', error);
      toast.error('Failed to generate day plan');
    } finally {
      setIsLoading(false);
    }
  };

  const extractAndDisplayLocations = (planContent: string) => {
    console.log('Plan content received:', planContent.substring(0, 200));
    
    // Common Dubai landmarks with more variations
    const knownLocations = [
      { name: 'Burj Khalifa', id: 'burj-khalifa', lat: 25.1972, lng: 55.2744, variations: ['burj khalifa', 'khalifa tower'], type: 'attraction' },
      { name: 'Dubai Fountain', id: 'dubai-fountain', lat: 25.1953, lng: 55.2744, variations: ['dubai fountain', 'fountain'], type: 'photo' },
      { name: 'Palm Jumeirah', id: 'palm-jumeirah', lat: 25.1124, lng: 55.1390, variations: ['palm jumeirah', 'the palm', 'palm'], type: 'attraction' },
      { name: 'Burj Al Arab', id: 'burj-al-arab', lat: 25.1412, lng: 55.1853, variations: ['burj al arab', 'al arab'], type: 'hotel' },
      { name: 'Dubai Marina', id: 'dubai-marina', lat: 25.0805, lng: 55.1410, variations: ['dubai marina', 'marina'], type: 'attraction' },
      { name: 'Museum of the Future', id: 'museum-future', lat: 25.2195, lng: 55.2802, variations: ['museum of the future', 'future museum'], type: 'attraction' },
      { name: 'Dubai Mall', id: 'dubai-mall', lat: 25.1972, lng: 55.2796, variations: ['dubai mall', 'the dubai mall'], type: 'activity' },
      { name: 'Gold Souk', id: 'gold-souk', lat: 25.2697, lng: 55.3020, variations: ['gold souk', 'souk'], type: 'activity' },
      { name: 'Jumeirah Beach', id: 'jumeirah-beach', lat: 25.2048, lng: 55.2708, variations: ['jumeirah beach', 'jbr beach'], type: 'photo' },
      { name: 'Atlantis', id: 'atlantis', lat: 25.1304, lng: 55.1174, variations: ['atlantis', 'atlantis the palm'], type: 'hotel' },
      { name: 'La Mer', id: 'la-mer', lat: 25.2317, lng: 55.2633, variations: ['la mer', 'lamer'], type: 'photo' },
      { name: 'Global Village', id: 'global-village', lat: 25.0758, lng: 55.3089, variations: ['global village'], type: 'activity' },
    ];

    // Icon mappings
    const iconMapping: any = {
      hotel: { Icon: Hotel, color: '#4F46E5', gradient: 'from-indigo-500 to-purple-600', label: 'Hotel' },
      restaurant: { Icon: UtensilsCrossed, color: '#EF4444', gradient: 'from-red-500 to-orange-500', label: 'Restaurant' },
      cafe: { Icon: Coffee, color: '#F59E0B', gradient: 'from-amber-500 to-yellow-500', label: 'Cafe' },
      attraction: { Icon: Camera, color: '#8B5CF6', gradient: 'from-purple-500 to-pink-500', label: 'Attraction' },
      activity: { Icon: Car, color: '#10B981', gradient: 'from-emerald-500 to-teal-500', label: 'Activity' },
      photo: { Icon: MapPin, color: '#EC4899', gradient: 'from-pink-500 to-rose-500', label: 'Photo Spot' },
    };

    const extractedLocations: any[] = [];
    const lowerContent = planContent.toLowerCase();
    
    // Find mentioned locations in the plan
    knownLocations.forEach(location => {
      const isFound = location.variations.some(variation => 
        lowerContent.includes(variation.toLowerCase())
      );
      
      if (isFound) {
        console.log('Found location:', location.name);
        const iconInfo = iconMapping[location.type] || iconMapping.attraction;
        
        extractedLocations.push({
          id: location.id,
          name: location.name,
          lat: location.lat,
          lng: location.lng,
          type: location.type,
          rating: 4.8,
          price: '$$',
          vibe: 'AI Suggested',
          area: location.name,
          image: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=800&auto=format&fit=crop',
          icon: iconInfo.Icon,
          color: iconInfo.color,
          gradient: iconInfo.gradient,
          iconLabel: iconInfo.label,
          visitDuration: 60,
          peakHours: '10:00 AM - 2:00 PM',
          offPeakHours: '4:00 PM - 6:00 PM',
        });
      }
    });

    // Remove duplicates
    const uniqueLocations = extractedLocations.filter((loc, index, self) =>
      index === self.findIndex((t) => t.id === loc.id)
    );

    console.log('Extracted locations:', uniqueLocations.length);

    if (uniqueLocations.length > 0 && onLocationsExtracted) {
      onLocationsExtracted(uniqueLocations);
      toast.success(`${uniqueLocations.length} locations added to map!`);
    } else {
      toast.info('No recognizable Dubai landmarks found in the plan');
    }
  };

  const renderMessage = (content: string) => {
    return content.split('\n').map((line, i) => {
      if (line.includes('**')) {
        const parts = line.split('**');
        return (
          <p key={i} className="mb-2">
            {parts.map((part, j) => 
              j % 2 === 1 ? <strong key={j} className="font-bold">{part}</strong> : part
            )}
          </p>
        );
      }
      if (line.trim().startsWith('-')) {
        return <li key={i} className="ml-4 mb-1">{line.substring(line.indexOf('-') + 1).trim()}</li>;
      }
      if (line.trim().endsWith(':') && line.length < 50 && !line.includes('http')) {
        return <h4 key={i} className="font-bold text-base mt-3 mb-1">{line}</h4>;
      }
      return line.trim() ? <p key={i} className="mb-2">{line}</p> : <br key={i} />;
    });
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 left-6 bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-4 rounded-full shadow-2xl hover:shadow-3xl transition-all transform hover:scale-110"
        style={{ zIndex: 10000 }}
        aria-label="Open AI Travel Assistant"
      >
        <Sparkles size={24} />
      </button>
    );
  }

  return (
    <div 
      className="fixed bottom-6 left-6 w-96 bg-background border-2 border-border rounded-2xl shadow-2xl flex flex-col"
      style={{ zIndex: 10000, maxHeight: '500px', height: '500px' }}
    >
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-4 rounded-t-2xl flex items-center justify-between flex-shrink-0">
        <div className="flex items-center space-x-2">
          <Sparkles size={20} />
          <h3 className="font-bold">AI Travel Assistant</h3>
        </div>
        <button onClick={() => setIsOpen(false)} className="p-1 hover:bg-white/20 rounded-lg transition-all">
          <X size={20} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-muted/30 min-h-0">
        {messages.length === 0 && (
          <div className="text-center text-muted-foreground mt-12">
            <Sparkles size={40} className="mx-auto mb-4 text-primary" />
            <p className="font-semibold text-foreground mb-2">Plan Your Perfect Day!</p>
            <p className="text-sm mb-4">Get route suggestions, discover locations, or create a complete itinerary</p>
            
            <button
              onClick={handlePlanMyDay}
              disabled={isLoading}
              className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-3 rounded-xl font-semibold hover:shadow-xl transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2 mx-auto"
            >
              <Calendar size={20} />
              <span>Plan My Day</span>
            </button>
          </div>
        )}

        {messages.map((message, idx) => (
          <div key={idx} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] rounded-2xl p-3 ${
              message.role === 'user' 
                ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white' 
                : 'bg-card border border-border text-foreground'
            }`}>
              {message.imageUrl && (
                <img src={message.imageUrl} alt="Uploaded" className="rounded-lg mb-2 max-w-full" />
              )}
              <div className="text-sm">
                {renderMessage(message.content)}
              </div>
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-card border border-border rounded-2xl p-3 flex items-center space-x-2">
              <Loader2 size={16} className="animate-spin text-primary" />
              <span className="text-sm text-muted-foreground">Creating your plan...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      <div className="p-4 border-t border-border bg-background flex-shrink-0">
        {messages.length > 0 && (
          <button
            onClick={handlePlanMyDay}
            disabled={isLoading}
            className="w-full mb-3 bg-gradient-to-r from-emerald-600 to-teal-600 text-white px-4 py-2.5 rounded-xl font-semibold hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
          >
            <Calendar size={18} />
            <span>Generate Day Plan</span>
          </button>
        )}

        {uploadedImage && (
          <div className="mb-2 relative inline-block">
            <img src={uploadedImage} alt="Upload preview" className="h-20 rounded-lg" />
            <button
              onClick={() => setUploadedImage(null)}
              className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground rounded-full p-1"
            >
              <X size={14} />
            </button>
          </div>
        )}

        <div className="flex items-center space-x-2">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            className="hidden"
          />
          
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={isLoading}
            className="p-2 hover:bg-accent rounded-lg transition-all"
          >
            <ImageIcon size={20} className="text-muted-foreground" />
          </button>

          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && !isLoading && handleSend()}
            placeholder="Ask about routes, locations..."
            disabled={isLoading}
            className="flex-1 px-4 py-2 bg-muted border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-foreground placeholder:text-muted-foreground"
          />

          <button
            onClick={handleSend}
            disabled={isLoading || (!input.trim() && !uploadedImage)}
            className="p-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send size={20} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default TravelChatbox;
