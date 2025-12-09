import { useState } from 'react';

interface Endorser {
  name: string;
  avatar: string;
  context: string;
}

interface Skill {
  name: string;
  endorsers: Endorser[];
}

interface SkillGardenProps {
  skills: Skill[];
}

// Plant/growth metaphors based on endorsement count
const getPlantStage = (endorserCount: number) => {
  if (endorserCount >= 5) return { emoji: '🌳', label: 'Flourishing' };
  if (endorserCount >= 3) return { emoji: '🌿', label: 'Growing' };
  if (endorserCount >= 1) return { emoji: '🌱', label: 'Sprouting' };
  return { emoji: '🫘', label: 'Seed' };
};

export const SkillGarden = ({ skills }: SkillGardenProps) => {
  const [hoveredSkill, setHoveredSkill] = useState<string | null>(null);
  const [expandedSkill, setExpandedSkill] = useState<string | null>(null);

  return (
    <div className="space-y-3">
      {skills.map((skill, index) => {
        const plant = getPlantStage(skill.endorsers.length);
        const isHovered = hoveredSkill === skill.name;
        const isExpanded = expandedSkill === skill.name;

        return (
          <div
            key={skill.name}
            className="relative"
            style={{ animationDelay: `${index * 0.1}s` }}
          >
            <button
              className={`
                w-full p-3 bg-card rounded-organic border border-border
                flex items-center gap-3 transition-all duration-300
                hover:shadow-soft hover:border-secondary/30
                ${isExpanded ? 'ring-2 ring-secondary ring-offset-2' : ''}
              `}
              onMouseEnter={() => setHoveredSkill(skill.name)}
              onMouseLeave={() => setHoveredSkill(null)}
              onClick={() => setExpandedSkill(isExpanded ? null : skill.name)}
            >
              {/* Plant emoji - grows with endorsements */}
              <span 
                className={`text-2xl transition-transform duration-300 ${isHovered ? 'scale-125' : ''}`}
              >
                {plant.emoji}
              </span>
              
              <div className="flex-1 text-left">
                <p className="font-display font-medium text-sm">{skill.name}</p>
                <p className="text-xs text-muted-foreground">{plant.label}</p>
              </div>

              {/* Endorser faces as tiny leaves */}
              {skill.endorsers.length > 0 && (
                <div className="flex -space-x-1">
                  {skill.endorsers.slice(0, 4).map((endorser, i) => (
                    <div 
                      key={i}
                      className="w-6 h-6 rounded-full bg-secondary/10 flex items-center justify-center text-xs border border-background"
                      title={`${endorser.name} endorsed this`}
                    >
                      {endorser.avatar}
                    </div>
                  ))}
                  {skill.endorsers.length > 4 && (
                    <div className="w-6 h-6 rounded-full bg-secondary/20 flex items-center justify-center text-[10px] font-display border border-background text-secondary">
                      +{skill.endorsers.length - 4}
                    </div>
                  )}
                </div>
              )}
            </button>

            {/* Expanded endorsements */}
            {isExpanded && skill.endorsers.length > 0 && (
              <div className="mt-2 ml-8 space-y-2 animate-fade-in-up">
                {skill.endorsers.map((endorser, i) => (
                  <div 
                    key={i}
                    className="flex items-start gap-3 p-2 bg-secondary/5 rounded-organic text-sm"
                  >
                    <span className="text-lg">{endorser.avatar}</span>
                    <div>
                      <p className="font-display font-medium">{endorser.name}</p>
                      <p className="text-muted-foreground text-xs italic">"{endorser.context}"</p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {isExpanded && skill.endorsers.length === 0 && (
              <div className="mt-2 ml-8 p-3 bg-muted/30 rounded-organic text-sm text-muted-foreground animate-fade-in-up">
                No endorsements yet—collaborate to earn them! 🌱
              </div>
            )}
          </div>
        );
      })}

      {skills.length === 0 && (
        <div className="text-center py-6 text-muted-foreground">
          <span className="text-3xl block mb-2">🌱</span>
          <p className="text-sm">Skills grow through collaboration</p>
        </div>
      )}
    </div>
  );
};
