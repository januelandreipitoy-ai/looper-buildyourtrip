import { Check } from 'lucide-react';
import { Button } from '@/components/ui/button';

const Pricing = () => {
  const tiers = [
    {
      name: 'Free',
      price: 'Free',
      description: 'Perfect for trying out Looper',
      features: [
        'Single-city trip',
        'Basic recommendations',
        'Standard routing',
        'No multi-day itineraries',
        'No multi-city',
        'No PDF export'
      ],
      cta: 'Get Started',
      highlighted: false
    },
    {
      name: 'Plus',
      price: '$9.99',
      priceNote: 'one-time',
      description: 'Best Value',
      features: [
        'Multi-day trips',
        'Multi-city trips',
        'Multi-country support',
        'AI-optimized order & timing',
        'Full OSRM accurate routing',
        'PDF Export',
        'Offline itinerary + offline routing',
        'Priority loading of images'
      ],
      cta: 'Upgrade to Plus',
      highlighted: true
    },
    {
      name: 'Ultra',
      price: '$29.99',
      priceNote: 'one-time or annual',
      description: 'Premium experience for frequent travelers',
      features: [
        'Unlimited multi-country planning',
        'AI concierge',
        'Crowd + weather smart reordering',
        'Early access features',
        'Priority image data',
        'Premium map layers',
        'Dedicated route cache for instant loading'
      ],
      cta: 'Upgrade to Ultra',
      highlighted: false
    }
  ];

  return (
    <div className="min-h-screen bg-background py-20">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h1 className="text-4xl sm:text-5xl font-bold mb-4 text-foreground">
            Choose Your Plan
          </h1>
          <p className="text-lg text-muted-foreground">
            Select the perfect plan for your travel needs
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {tiers.map((tier) => (
            <div
              key={tier.name}
              className={`rounded-2xl p-8 transition-all duration-300 ${
                tier.highlighted
                  ? 'bg-gradient-to-br from-primary/10 to-accent/10 border-2 border-primary shadow-2xl scale-105'
                  : tier.name === 'Ultra'
                  ? 'bg-gradient-to-br from-secondary/5 to-accent/5 border-2 border-secondary shadow-lg'
                  : 'bg-card border border-border'
              }`}
            >
              {tier.highlighted && (
                <div className="text-center mb-4">
                  <span className="inline-block bg-primary text-white px-4 py-1 rounded-full text-sm font-medium">
                    Most Popular
                  </span>
                </div>
              )}
              
              <div className="text-center mb-6">
                <h3 className="text-2xl font-bold mb-2 text-foreground">{tier.name}</h3>
                <div className="mb-2">
                  <span className="text-4xl font-bold text-foreground">{tier.price}</span>
                  {tier.priceNote && (
                    <span className="text-sm text-muted-foreground ml-2">{tier.priceNote}</span>
                  )}
                </div>
                <p className="text-muted-foreground text-sm">{tier.description}</p>
              </div>

              <ul className="space-y-3 mb-8">
                {tier.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-3">
                    <Check className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                    <span className="text-foreground text-sm">{feature}</span>
                  </li>
                ))}
              </ul>

              <Button
                className={`w-full ${
                  tier.highlighted
                    ? 'bg-primary hover:bg-primary/90 text-white'
                    : 'bg-muted hover:bg-muted/80 text-foreground'
                }`}
                size="lg"
              >
                {tier.cta}
              </Button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Pricing;
