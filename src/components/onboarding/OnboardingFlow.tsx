import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { MoodSelector } from './MoodSelector';
import { InterestPicker } from './InterestPicker';
import { ProfileSetup } from './ProfileSetup';
import { ArrowLeft, ArrowRight, Sparkles } from 'lucide-react';

interface OnboardingFlowProps {
  onComplete: (userData: {
    mood: string;
    interests: string[];
    name: string;
    avatar: string;
  }) => void;
  onBack: () => void;
}

export const OnboardingFlow = ({ onComplete, onBack }: OnboardingFlowProps) => {
  const [step, setStep] = useState(1);
  const [mood, setMood] = useState('');
  const [interests, setInterests] = useState<string[]>([]);
  const [name, setName] = useState('');
  const [avatar, setAvatar] = useState('😊');

  const toggleInterest = (interest: string) => {
    setInterests(prev => 
      prev.includes(interest) 
        ? prev.filter(i => i !== interest)
        : [...prev, interest]
    );
  };

  const canProceed = () => {
    if (step === 1) return !!mood;
    if (step === 2) return interests.length >= 2;
    if (step === 3) return name.trim().length >= 2;
    return false;
  };

  const handleNext = () => {
    if (step < 3) {
      setStep(step + 1);
    } else {
      onComplete({ mood, interests, name, avatar });
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    } else {
      onBack();
    }
  };

  return (
    <div className="min-h-screen bg-atmosphere flex flex-col">
      {/* Progress indicator */}
      <div className="fixed top-0 left-0 right-0 h-1 bg-muted z-50">
        <div 
          className="h-full bg-primary transition-all duration-500 ease-out"
          style={{ width: `${(step / 3) * 100}%` }}
        />
      </div>

      {/* Header */}
      <header className="p-4 flex items-center justify-between">
        <Button
          variant="ghost"
          size="sm"
          onClick={handleBack}
          className="font-display"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
        <span className="font-display text-sm text-muted-foreground">
          Step {step} of 3
        </span>
      </header>

      {/* Main content */}
      <main className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-lg animate-fade-in-up" key={step}>
          {step === 1 && (
            <MoodSelector selected={mood} onSelect={setMood} />
          )}
          {step === 2 && (
            <InterestPicker selected={interests} onToggle={toggleInterest} />
          )}
          {step === 3 && (
            <ProfileSetup 
              name={name} 
              onNameChange={setName}
              avatar={avatar}
              onAvatarChange={setAvatar}
            />
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="p-6 flex justify-center">
        <Button
          onClick={handleNext}
          disabled={!canProceed()}
          size="lg"
          className="px-8 py-6 font-display font-semibold rounded-organic-lg shadow-warm hover-lift disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {step === 3 ? (
            <>
              <Sparkles className="w-5 h-5 mr-2" />
              Start your first conversation
            </>
          ) : (
            <>
              Continue
              <ArrowRight className="w-5 h-5 ml-2" />
            </>
          )}
        </Button>
      </footer>
    </div>
  );
};
