import React, { useState } from 'react';
import { Phone, Video, Clock, Users, Lock, Share2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CallStarter } from '@/components/calling/CallStarter';
import { CallCodeDisplay } from '@/components/calling/CallCodeDisplay';
import { useEnhancedCallManager } from '@/hooks/useEnhancedCallManager';

interface CallLandingScreenProps {
  userId: string;
  userName: string;
  recentCalls?: Array<{
    code: string;
    name: string;
    participants: number;
    lastUsed: Date;
  }>;
  onStartCall?: (callCode: string) => void;
  onJoinCall?: (callCode: string) => void;
}

const FeatureCard: React.FC<{
  icon: React.ReactNode;
  title: string;
  description: string;
}> = ({ icon, title, description }) => (
  <Card className="border-[#E2725B]/20 bg-white">
    <CardHeader className="pb-3">
      <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-lg bg-[#E2725B]/10 text-[#E2725B]">
        {icon}
      </div>
      <CardTitle className="text-lg text-gray-900">{title}</CardTitle>
    </CardHeader>
    <CardContent>
      <CardDescription className="text-sm text-gray-600">{description}</CardDescription>
    </CardContent>
  </Card>
);

export const CallLandingScreen: React.FC<CallLandingScreenProps> = ({
  userId,
  userName,
  recentCalls = [],
  onStartCall,
  onJoinCall,
}) => {
  const { startCall, joinCall } = useEnhancedCallManager(userId, userName);
  const [lastGeneratedCode, setLastGeneratedCode] = useState<string | null>(null);

  const handleStartCall = (code: string) => {
    setLastGeneratedCode(code);
    const session = startCall(`Call from ${userName}`);
    onStartCall?.(code);
  };

  const handleJoinCall = (code: string) => {
    const session = joinCall(code);
    if (session) {
      onJoinCall?.(code);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F5F1E6] to-white">
      {/* Header */}
      <div className="border-b border-[#E2725B]/20 bg-white">
        <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-[#E2725B]">etChat Calls</h1>
          <p className="mt-1 text-gray-600">Crystal clear calls, anywhere, anytime</p>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
        {/* Call Actions */}
        <div className="mb-12 rounded-lg border-2 border-dashed border-[#E2725B] bg-white p-8">
          <div className="mb-6 text-center">
            <h2 className="text-2xl font-bold text-gray-900">Start or Join a Call</h2>
            <p className="mt-2 text-gray-600">Connect with anyone using call codes like Google Meet</p>
          </div>

          <div className="mx-auto max-w-md">
            <CallStarter onStartCall={handleStartCall} onJoinCall={handleJoinCall} />
          </div>
        </div>

        {/* Last Generated Code */}
        {lastGeneratedCode && (
          <div className="mb-12">
            <h3 className="mb-4 text-lg font-semibold text-gray-900">Your Current Call</h3>
            <CallCodeDisplay code={lastGeneratedCode} />
          </div>
        )}

        {/* Recent Calls */}
        {recentCalls.length > 0 && (
          <div className="mb-12">
            <h3 className="mb-4 text-lg font-semibold text-gray-900">Recent Calls</h3>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {recentCalls.map((call) => (
                <Card key={call.code} className="border-[#E2725B]/20 hover:border-[#E2725B]">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base text-gray-900">{call.name}</CardTitle>
                    <CardDescription className="font-mono text-sm text-[#E2725B]">
                      {call.code}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Users className="h-4 w-4" />
                        {call.participants} participant{call.participants !== 1 ? 's' : ''}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Clock className="h-4 w-4" />
                        {call.lastUsed.toLocaleDateString()}
                      </div>
                      <Button
                        onClick={() => handleJoinCall(call.code)}
                        className="mt-3 w-full bg-[#E2725B] text-white hover:bg-[#D1654A]"
                        size="sm"
                      >
                        Rejoin
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Features */}
        <div>
          <h3 className="mb-6 text-lg font-semibold text-gray-900">Why etChat Calls?</h3>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <FeatureCard
              icon={<Video className="h-6 w-6" />}
              title="Crystal Clear Video"
              description="HD video with adaptive bitrate for any connection quality"
            />
            <FeatureCard
              icon={<Phone className="h-6 w-6" />}
              title="Easy Call Codes"
              description="Share simple call codes like Google Meet to let anyone join"
            />
            <FeatureCard
              icon={<Users className="h-6 w-6" />}
              title="Group Calling"
              description="Support for up to 100 participants with multi-layout views"
            />
            <FeatureCard
              icon={<Share2 className="h-6 w-6" />}
              title="Screen Sharing"
              description="Share your screen for presentations and collaboration"
            />
            <FeatureCard
              icon={<Lock className="h-6 w-6" />}
              title="Secure & Private"
              description="End-to-end encrypted calls with full privacy control"
            />
            <FeatureCard
              icon={<Clock className="h-6 w-6" />}
              title="Call History"
              description="Keep track of all your calls and participants"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
