import React, { useState } from 'react';
import { Copy, Check, Share2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface CallCodeDisplayProps {
  code: string;
  onCopy?: () => void;
  onShare?: () => void;
}

export const CallCodeDisplay: React.FC<CallCodeDisplayProps> = ({ code, onCopy, onShare }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    onCopy?.();
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex flex-col items-center gap-4 rounded-lg border-2 border-dashed border-[#E2725B] bg-[#F5F1E6] p-6">
      <div className="text-center">
        <p className="mb-2 text-sm font-medium text-gray-600">Call Code</p>
        <p className="font-mono text-3xl font-bold tracking-widest text-[#E2725B]">{code}</p>
      </div>

      <div className="flex gap-3">
        <Button
          onClick={handleCopy}
          variant="outline"
          className="border-[#E2725B] text-[#E2725B] hover:bg-[#F5F1E6]"
        >
          {copied ? (
            <>
              <Check className="mr-2 h-4 w-4" />
              Copied!
            </>
          ) : (
            <>
              <Copy className="mr-2 h-4 w-4" />
              Copy Code
            </>
          )}
        </Button>

        {onShare && (
          <Button
            onClick={onShare}
            className="bg-[#E2725B] text-white hover:bg-[#D1654A]"
          >
            <Share2 className="mr-2 h-4 w-4" />
            Share
          </Button>
        )}
      </div>

      <p className="text-center text-xs text-gray-500">
        Share this code with others to join your call
      </p>
    </div>
  );
};
