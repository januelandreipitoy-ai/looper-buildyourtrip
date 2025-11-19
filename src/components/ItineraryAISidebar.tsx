import { useState, useRef, useEffect } from 'react';
import { useTrip } from '@/contexts/TripContext';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { 
  Sheet, 
  SheetContent, 
  SheetHeader, 
  SheetTitle 
} from '@/components/ui/sheet';
import { 
  MessageCircle, 
  Send, 
  Loader2, 
  MapPin, 
  Clock, 
  DollarSign, 
  Lightbulb,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface ItineraryAISidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ItineraryAISidebar = ({ isOpen, onClose }: ItineraryAISidebarProps) => {
  const { tripSuggestions, aiItinerary } = useTrip();
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: "Hi! I'm Loopi, your travel assistant. I can help optimize your itinerary based on timing, budget, and flow."
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    
    const newMessages: Message[] = [
      ...messages,
      { role: 'user', content: userMessage }
    ];
    setMessages(newMessages);
    setIsLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke('loopi-chat', {
        body: {
          message: userMessage,
          conversationHistory: messages
        }
      });

      if (error) throw error;

      if (data?.success && data.response) {
        setMessages([
          ...newMessages,
          { role: 'assistant', content: data.response }
        ]);
      } else {
        throw new Error('Invalid response from AI');
      }
    } catch (error) {
      console.error('Chat error:', error);
      toast.error('Failed to get response. Please try again.');
      setMessages(newMessages);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent side="right" className="w-[400px] sm:w-[500px] p-0 flex flex-col">
        <SheetHeader className="p-4 border-b">
          <SheetTitle className="flex items-center gap-2">
            <MessageCircle className="h-5 w-5 text-primary" />
            AI Travel Assistant
          </SheetTitle>
        </SheetHeader>

        <div className="flex border-b">
          <Button
            variant={showSuggestions ? 'default' : 'ghost'}
            className="flex-1 rounded-none"
            onClick={() => setShowSuggestions(true)}
          >
            <Lightbulb className="h-4 w-4 mr-2" />
            Suggestions
          </Button>
          <Button
            variant={!showSuggestions ? 'default' : 'ghost'}
            className="flex-1 rounded-none"
            onClick={() => setShowSuggestions(false)}
          >
            <MessageCircle className="h-4 w-4 mr-2" />
            Chat
          </Button>
        </div>

        {showSuggestions ? (
          <ScrollArea className="flex-1 p-4">
            {tripSuggestions ? (
              <div className="space-y-4">
                {/* Budget Summary */}
                <Card className="p-4 bg-primary/5 border-primary/20">
                  <div className="flex items-center gap-2 mb-2">
                    <DollarSign className="h-5 w-5 text-primary" />
                    <h4 className="font-semibold">Estimated Budget</h4>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <p className="text-muted-foreground">Daily</p>
                      <p className="font-semibold">${tripSuggestions.itinerary.estimatedCosts.dailyBudget}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Total</p>
                      <p className="font-semibold text-primary">${tripSuggestions.itinerary.estimatedCosts.totalBudget}</p>
                    </div>
                  </div>
                </Card>

                {/* Day by Day Plan */}
                <div className="space-y-3">
                  <h4 className="font-semibold flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    Daily Itinerary
                  </h4>
                  {tripSuggestions.itinerary.days.map((day) => (
                    <Card key={day.dayNumber} className="p-3 border-l-4 border-l-primary">
                      <h5 className="font-semibold mb-2">Day {day.dayNumber}</h5>
                      <div className="space-y-2 text-sm">
                        {['morning', 'afternoon', 'evening'].map((slot) => {
                          const timeSlot = day.timeSlots[slot as keyof typeof day.timeSlots];
                          if (!timeSlot?.location) return null;
                          
                          return (
                            <div key={slot} className="flex items-start gap-2">
                              <MapPin className="h-3 w-3 mt-1 text-muted-foreground flex-shrink-0" />
                              <div className="flex-1 min-w-0">
                                <p className="font-medium capitalize">{slot}</p>
                                <p className="text-xs text-muted-foreground truncate">{timeSlot.location.name}</p>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </Card>
                  ))}
                </div>

                {/* Travel Tips */}
                {tripSuggestions.itinerary.tips && tripSuggestions.itinerary.tips.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="font-semibold flex items-center gap-2">
                      <Lightbulb className="h-4 w-4" />
                      Travel Tips
                    </h4>
                    <div className="space-y-2">
                      {tripSuggestions.itinerary.tips.map((tip, index) => (
                        <Card key={index} className="p-3 text-sm">
                          {tip}
                        </Card>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : aiItinerary ? (
              <div className="space-y-4">
                <Card className="p-4 bg-primary/5 border-primary/20">
                  <div className="flex items-center gap-2 mb-2">
                    <DollarSign className="h-5 w-5 text-primary" />
                    <h4 className="font-semibold">Estimated Budget</h4>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <p className="text-muted-foreground">Daily</p>
                      <p className="font-semibold">${aiItinerary.estimatedCosts.dailyBudget}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Total</p>
                      <p className="font-semibold text-primary">${aiItinerary.estimatedCosts.totalBudget}</p>
                    </div>
                  </div>
                </Card>

                {aiItinerary.tips && aiItinerary.tips.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="font-semibold flex items-center gap-2">
                      <Lightbulb className="h-4 w-4" />
                      Travel Tips
                    </h4>
                    <div className="space-y-2">
                      {aiItinerary.tips.map((tip, index) => (
                        <Card key={index} className="p-3 text-sm">
                          {tip}
                        </Card>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                <Lightbulb className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No trip suggestions yet</p>
                <p className="text-sm">Generate an itinerary to see AI suggestions</p>
              </div>
            )}
          </ScrollArea>
        ) : (
          <>
            <ScrollArea className="flex-1 p-4">
              <div className="space-y-4">
                {messages.map((message, index) => (
                  <div
                    key={index}
                    className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[85%] rounded-lg p-3 ${
                        message.role === 'user'
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted'
                      }`}
                    >
                      <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                    </div>
                  </div>
                ))}
                {isLoading && (
                  <div className="flex justify-start">
                    <div className="bg-muted rounded-lg p-3">
                      <Loader2 className="h-5 w-5 animate-spin" />
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>

            <div className="p-4 border-t">
              <div className="flex gap-2">
                <Input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Ask about your itinerary..."
                  disabled={isLoading}
                />
                <Button onClick={handleSend} disabled={isLoading || !input.trim()} size="icon">
                  {isLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
};