import { useState } from "react";
import TypedText from "./TypedText";

const HelloWorld = () => {
  const [showWorld, setShowWorld] = useState(false);
  const [worldComplete, setWorldComplete] = useState(false);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background overflow-hidden">
      {/* Background gradient orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: "1s" }} />
      </div>

      {/* Main content */}
      <h1 className="relative z-10 text-6xl md:text-8xl lg:text-9xl font-bold font-mono-display tracking-tight">
        <TypedText 
          text="Hello " 
          typingSpeed={120}
          onComplete={() => setShowWorld(true)}
          className="text-foreground"
        />
        {showWorld && (
          <TypedText
            text="World"
            typingSpeed={120}
            onComplete={() => setWorldComplete(true)}
            className={worldComplete ? "color-cycle" : "text-foreground"}
          />
        )}
        {worldComplete && <span className="typing-cursor" />}
      </h1>
    </div>
  );
};

export default HelloWorld;
