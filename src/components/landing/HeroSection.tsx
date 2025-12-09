import { Button } from '@/components/ui/button';
import { LiveActivity } from './LiveActivity';
import { FloatingBubbles } from './FloatingBubbles';
import { Users, Sparkles, Heart } from 'lucide-react';

interface HeroSectionProps {
  onGetStarted: () => void;
}

export const HeroSection = ({ onGetStarted }: HeroSectionProps) => {
  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center px-6 py-12 overflow-hidden">
      <FloatingBubbles />
      
      {/* Soft decorative orbs */}
      <div className="absolute top-20 left-10 w-64 h-64 rounded-full bg-primary/10 blur-3xl animate-float" />
      <div className="absolute bottom-32 right-10 w-80 h-80 rounded-full bg-accent/10 blur-3xl animate-float-delayed" />
      <div className="absolute top-1/2 left-1/3 w-48 h-48 rounded-full bg-secondary/10 blur-3xl animate-float" />

      {/* Main content */}
      <div className="relative z-10 max-w-2xl mx-auto text-center space-y-8">
        {/* Warm tagline */}
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-warm/20 rounded-full text-sm font-display font-medium text-foreground animate-fade-in-up">
          <Sparkles className="w-4 h-4 text-primary" />
          Where real conversations bloom
        </div>

        {/* Main headline */}
        <h1 className="font-display text-4xl sm:text-5xl md:text-6xl font-bold leading-tight animate-fade-in-up stagger-1">
          A space for{' '}
          <span className="text-primary relative">
            real talk
            <svg className="absolute -bottom-2 left-0 w-full" viewBox="0 0 200 12" fill="none">
              <path d="M2 8 Q 50 2, 100 6 T 198 4" stroke="currentColor" strokeWidth="3" strokeLinecap="round" className="text-primary/30" />
            </svg>
          </span>
          .
          <br />
          <span className="text-muted-foreground">No follower counts.</span>
        </h1>

        {/* Subtext */}
        <p className="text-lg sm:text-xl text-muted-foreground max-w-lg mx-auto leading-relaxed animate-fade-in-up stagger-2">
          Join conversations that matter. Share moments that disappear. 
          Build ideas together. No metrics, no pressure—just genuine connection.
        </p>

        {/* Social proof icons */}
        <div className="flex items-center justify-center gap-6 py-4 animate-fade-in-up stagger-3">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Users className="w-4 h-4" />
            <span>Real people</span>
          </div>
          <div className="w-1 h-1 rounded-full bg-muted-foreground/40" />
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Heart className="w-4 h-4" />
            <span>Real conversations</span>
          </div>
        </div>

        {/* CTA Button */}
        <div className="animate-fade-in-up stagger-4">
          <Button 
            onClick={onGetStarted}
            size="lg"
            className="px-8 py-6 text-lg font-display font-semibold rounded-organic-lg shadow-warm hover-lift bg-primary hover:bg-primary/90 transition-all duration-300"
          >
            Find your people
          </Button>
        </div>

        {/* Live activity indicator */}
        <div className="pt-8 animate-fade-in-up stagger-5">
          <LiveActivity />
        </div>
      </div>

      {/* Illustration of people chatting */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-end gap-2 opacity-30">
        <div className="w-8 h-8 rounded-full bg-primary animate-gentle-bounce" style={{ animationDelay: '0s' }} />
        <div className="w-6 h-6 rounded-full bg-accent animate-gentle-bounce" style={{ animationDelay: '0.3s' }} />
        <div className="w-10 h-10 rounded-full bg-secondary animate-gentle-bounce" style={{ animationDelay: '0.6s' }} />
        <div className="w-7 h-7 rounded-full bg-warm animate-gentle-bounce" style={{ animationDelay: '0.9s' }} />
      </div>
    </section>
  );
};
