import { useState, useEffect } from "react";

interface TypedTextProps {
  text: string;
  typingSpeed?: number;
  onComplete?: () => void;
  className?: string;
}

const TypedText = ({ 
  text, 
  typingSpeed = 100, 
  onComplete,
  className = "" 
}: TypedTextProps) => {
  const [displayedText, setDisplayedText] = useState("");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    if (currentIndex < text.length) {
      const timeout = setTimeout(() => {
        setDisplayedText(prev => prev + text[currentIndex]);
        setCurrentIndex(prev => prev + 1);
      }, typingSpeed);

      return () => clearTimeout(timeout);
    } else if (!isComplete) {
      setIsComplete(true);
      onComplete?.();
    }
  }, [currentIndex, text, typingSpeed, onComplete, isComplete]);

  return (
    <span className={className}>
      {displayedText}
      {!isComplete && <span className="typing-cursor" />}
    </span>
  );
};

export default TypedText;
