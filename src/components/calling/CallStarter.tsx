import React, { useState } from 'react';
import { Phone, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { formatCallCode, generateCallCode } from '@/utils/callCodeGenerator';

interface CallStarterProps {
  onStartCall?: (callCode: string) => void;
  onJoinCall?: (callCode: string) => void;
}

export const CallStarter: React.FC<CallStarterProps> = ({ onStartCall, onJoinCall }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [mode, setMode] = useState<'start' | 'join'>('start');
  const [joinCode, setJoinCode] = useState('');

  const handleStartCall = () => {
    const newCode = generateCallCode();
    onStartCall?.(newCode);
    setIsOpen(false);
  };

  const handleJoinCall = () => {
    if (joinCode.trim()) {
      onJoinCall?.(formatCallCode(joinCode));
      setJoinCode('');
      setIsOpen(false);
    }
  };

  return (
    <>
      <div className="flex gap-3">
        <Button
          onClick={() => {
            setMode('start');
            setIsOpen(true);
          }}
          className="flex-1 gap-2 bg-[#E2725B] text-white hover:bg-[#D1654A] md:flex-none"
        >
          <Plus className="h-4 w-4" />
          Start Call
        </Button>

        <Button
          onClick={() => {
            setMode('join');
            setIsOpen(true);
          }}
          variant="outline"
          className="flex-1 gap-2 border-[#E2725B] text-[#E2725B] hover:bg-[#F5F1E6] md:flex-none"
        >
          <Phone className="h-4 w-4" />
          Join Call
        </Button>
      </div>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="border-[#E2725B] bg-[#F5F1E6]">
          <DialogHeader>
            <DialogTitle className="text-[#E2725B]">
              {mode === 'start' ? 'Start a New Call' : 'Join a Call'}
            </DialogTitle>
            <DialogDescription className="text-gray-600">
              {mode === 'start'
                ? 'Generate a new call code to share with others'
                : 'Enter the call code provided by the host'}
            </DialogDescription>
          </DialogHeader>

          {mode === 'start' ? (
            <div className="flex flex-col gap-4">
              <p className="text-center text-sm text-gray-600">
                Click the button below to generate a unique call code
              </p>
              <Button
                onClick={handleStartCall}
                className="gap-2 bg-[#E2725B] text-white hover:bg-[#D1654A]"
              >
                <Plus className="h-4 w-4" />
                Generate Call Code
              </Button>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              <Input
                placeholder="Enter call code (e.g., abc-def-ghi)"
                value={joinCode}
                onChange={(e) => setJoinCode(e.target.value)}
                className="border-[#E2725B] text-lg font-mono placeholder:text-gray-400"
                onKeyPress={(e) => e.key === 'Enter' && handleJoinCall()}
              />
              <Button
                onClick={handleJoinCall}
                disabled={!joinCode.trim()}
                className="gap-2 bg-[#E2725B] text-white hover:bg-[#D1654A] disabled:bg-gray-300"
              >
                <Phone className="h-4 w-4" />
                Join Call
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};
