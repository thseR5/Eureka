'use client';

interface ProgressPanelProps {
  turnCount: number;
  conceptsMastered: number;
  misconceptionCount: number;
  bloomLevel: string;
  sessionLog: SessionLogEntry[];
}

export interface SessionLogEntry {
  timestamp: string;
  event: string;
  detail?: string;
}

const BLOOM_LEVELS = ['Remember', 'Understand', 'Apply', 'Analyze', 'Evaluate', 'Create'];

const BLOOM_COLORS: Record<string, string> = {
  Remember: '#4F8EF7',
  Understand: '#7C5CF6',
  Apply: '#10C98A',
  Analyze: '#F59E0B',
  Evaluate: '#EF4444',
  Create: '#EC4899',
};

export default function ProgressPanel({
  turnCount,
  conceptsMastered,
  misconceptionCount,
  bloomLevel,
  sessionLog,
}: ProgressPanelProps) {
  const currentLevelIndex = BLOOM_LEVELS.indexOf(bloomLevel);

  return (
    <div className="flex flex-col h-full">
      <div className="px-4 py-3 border-b border-[rgba(255,255,255,0.08)] bg-[#14141E]">
        <h3 className="text-sm font-semibold text-[#F2EDE6]">Progress</h3>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-5 scrollbar-thin">
        {/* Metric cards */}
        <div className="grid grid-cols-2 gap-3">
          <div className="p-3 rounded-lg bg-[#0D0D14] border border-[rgba(255,255,255,0.08)]">
            <p className="text-[10px] text-[rgba(242,237,230,0.4)] uppercase tracking-wider">Questions Asked</p>
            <p className="text-xl font-semibold font-mono text-[#4F8EF7]">{turnCount}</p>
          </div>
          <div className="p-3 rounded-lg bg-[#0D0D14] border border-[rgba(255,255,255,0.08)]">
            <p className="text-[10px] text-[rgba(242,237,230,0.4)] uppercase tracking-wider">Concepts Mastered</p>
            <p className="text-xl font-semibold font-mono text-[#10C98A]">{conceptsMastered}</p>
          </div>
          <div className="p-3 rounded-lg bg-[#0D0D14] border border-[rgba(255,255,255,0.08)]">
            <p className="text-[10px] text-[rgba(242,237,230,0.4)] uppercase tracking-wider">Misconceptions Caught</p>
            <p className="text-xl font-semibold font-mono text-[#F59E0B]">{misconceptionCount}</p>
          </div>
          <div className="p-3 rounded-lg bg-[#0D0D14] border border-[rgba(255,255,255,0.08)]">
            <p className="text-[10px] text-[rgba(242,237,230,0.4)] uppercase tracking-wider">Bloom&apos;s Level</p>
            <p className="text-sm font-semibold" style={{ color: BLOOM_COLORS[bloomLevel] || '#4F8EF7' }}>
              {bloomLevel}
            </p>
          </div>
        </div>

        {/* Bloom's progress bar */}
        <div>
          <p className="text-xs text-[rgba(242,237,230,0.4)] mb-2">Bloom&apos;s Taxonomy Progress</p>
          <div className="flex items-center gap-1">
            {BLOOM_LEVELS.map((level, i) => (
              <div key={level} className="flex-1 flex flex-col items-center gap-1">
                <div
                  className="w-full h-2 rounded-full transition-all duration-500"
                  style={{
                    backgroundColor: i <= currentLevelIndex ? BLOOM_COLORS[level] : '#1A1A28',
                    opacity: i <= currentLevelIndex ? 1 : 0.3,
                  }}
                />
                <span
                  className="text-[8px] transition-colors"
                  style={{ color: i <= currentLevelIndex ? BLOOM_COLORS[level] : 'rgba(242,237,230,0.2)' }}
                >
                  {level.slice(0, 3)}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Session Log */}
        <div>
          <p className="text-xs text-[rgba(242,237,230,0.4)] mb-2">Session Log</p>
          <div className="space-y-1.5 max-h-[200px] overflow-y-auto scrollbar-thin">
            {sessionLog.length === 0 ? (
              <p className="text-xs text-[rgba(242,237,230,0.2)]">No events yet</p>
            ) : (
              sessionLog.map((entry, i) => (
                <div key={i} className="flex gap-2 text-[10px]">
                  <span className="font-mono text-[rgba(242,237,230,0.3)] flex-shrink-0">
                    {entry.timestamp}
                  </span>
                  <span className="text-[rgba(242,237,230,0.55)]">
                    {entry.event}
                    {entry.detail && (
                      <span className="text-[rgba(242,237,230,0.3)]"> — {entry.detail}</span>
                    )}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
