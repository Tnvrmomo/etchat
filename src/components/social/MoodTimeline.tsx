interface MoodDay {
  day: string;
  mood: string;
  color: string;
}

interface MoodTimelineProps {
  moodHistory: MoodDay[];
}

const moodColorMap: Record<string, string> = {
  happy: 'bg-warm',
  creative: 'bg-accent',
  calm: 'bg-secondary/50',
  energetic: 'bg-primary',
  thoughtful: 'bg-muted',
  cozy: 'bg-primary/30',
  focused: 'bg-accent/70',
};

export const MoodTimeline = ({ moodHistory }: MoodTimelineProps) => {
  // Ensure we have 7 days
  const days = moodHistory.slice(-7);
  const dayLabels = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

  return (
    <div className="bg-card/50 p-4 rounded-organic-lg">
      <p className="text-xs text-muted-foreground font-display mb-3 text-center">Vibe check this week</p>
      <div className="flex justify-center gap-2">
        {days.map((day, index) => (
          <div key={index} className="flex flex-col items-center gap-1">
            <div 
              className={`
                w-8 h-12 rounded-full transition-all duration-300
                ${moodColorMap[day.color] || 'bg-muted'}
                flex items-center justify-center text-lg
                hover:scale-110 cursor-pointer
                shadow-soft
              `}
              title={`${day.day}: ${day.mood}`}
            >
              {day.mood}
            </div>
            <span className="text-[10px] text-muted-foreground font-display">
              {dayLabels[index]}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};
