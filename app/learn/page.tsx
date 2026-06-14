'use client';

import { useState, useCallback, Suspense, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import EurekaLogo from '@/components/EurekaLogo';
import SocraticChat from '@/components/SocraticChat';
import PhysicsSimulator from '@/components/PhysicsSimulator';
import KnowledgeGraph from '@/components/KnowledgeGraph';
import ProgressPanel from '@/components/ProgressPanel';
import type { SessionLogEntry } from '@/components/ProgressPanel';
import type { KGNode, KnowledgeGraphState } from '@/lib/knowledgeGraph';
import { getInitialGraph } from '@/lib/knowledgeGraph';
import VisualMapView from '@/components/VisualMapView';

const SUBJECT_LABELS: Record<string, string> = {
  physics: "Physics — Newton's Laws",
  mathematics: 'Mathematics — Sequences',
  chemistry: 'Chemistry — States of Matter',
  biology: 'Biology — Cell Theory',
  'computer-science': 'CS — Algorithms',
  engineering: 'Engineering — Structural Forces',
};

function LearnContent() {
  const searchParams = useSearchParams();
  const subject = searchParams.get('subject') || 'physics';
  const subjectLabel = SUBJECT_LABELS[subject] || SUBJECT_LABELS.physics;

  const [graphState, setGraphState] = useState<KnowledgeGraphState>(() => getInitialGraph(subject));
  const [masteredPulse, setMasteredPulse] = useState<string | null>(null);
  const [misconceptionAlert, setMisconceptionAlert] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'simulator' | 'graph' | 'progress'>('graph');
  const [turnCount, setTurnCount] = useState(0);
  const [conceptsMastered, setConceptsMastered] = useState(0);
  const [misconceptionCount, setMisconceptionCount] = useState(0);
  const [bloomLevel, setBloomLevel] = useState('Remember');
  const [sessionLog, setSessionLog] = useState<SessionLogEntry[]>([]);
  const [autoRunSim, setAutoRunSim] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [difficulty, setDifficulty] = useState<'beginner' | 'challenge'>('beginner');
  const [showFullMap, setShowFullMap] = useState(false);

  const misconceptionTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const BLOOM_COLORS: Record<string, string> = {
    Remember: '#4F8EF7', Understand: '#7C5CF6', Apply: '#10C98A',
    Analyze: '#F59E0B', Evaluate: '#EF4444', Create: '#EC4899',
  };
  const bloomColor = BLOOM_COLORS[bloomLevel] || '#4F8EF7';

  const now = () => {
    const d = new Date();
    return `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}:${d.getSeconds().toString().padStart(2, '0')}`;
  };

  const addLog = useCallback((event: string, detail?: string) => {
    setSessionLog((prev) => [...prev, { timestamp: now(), event, detail }]);
  }, []);

  const handleNodesUpdate = useCallback((nodes: KGNode[]) => {
    setGraphState((prev) => ({ ...prev, nodes }));
  }, []);

  const handleMastered = useCallback((conceptId: string) => {
    setConceptsMastered((c) => c + 1);
    setMasteredPulse(conceptId);
    setToastMessage(`Concept Mastered: ${conceptId.replace(/_/g, ' ')}`);
    addLog('Concept Mastered', conceptId);
    if (subject === 'physics') {
      setActiveTab('simulator');
      setAutoRunSim(true);
    }
    setTimeout(() => setMasteredPulse(null), 2000);
    setTimeout(() => setToastMessage(null), 4000);
  }, [subject, addLog]);

  const handleMisconception = useCallback((alert: string) => {
    if (misconceptionTimeoutRef.current) {
      clearTimeout(misconceptionTimeoutRef.current);
    }
    setMisconceptionAlert(alert);
    addLog('Misconception Detected', alert);

    misconceptionTimeoutRef.current = setTimeout(() => {
      setMisconceptionAlert(null);
    }, 8000);
  }, [addLog]);

  const handleDismissAlert = useCallback(() => {
    if (misconceptionTimeoutRef.current) {
      clearTimeout(misconceptionTimeoutRef.current);
    }
    setMisconceptionAlert(null);
  }, []);

  const handleTurnIncrement = useCallback(() => {
    setTurnCount((t) => t + 1);
  }, []);

  const handleMisconceptionCountIncrement = useCallback(() => {
    setMisconceptionCount((c) => c + 1);
  }, []);

  const handleBloomLevelUpdate = useCallback((level: string) => {
    setBloomLevel(level);
    addLog("Bloom's Level Update", level);
  }, [addLog]);

  // Tab definitions: only physics gets the simulator
  const tabs = subject === 'physics'
    ? (['graph', 'simulator', 'progress'] as const)
    : (['graph', 'progress'] as const);

  return (
    <div className="h-screen flex flex-col bg-[#0D0D14]">
      {/* Mastery toast */}
      {toastMessage && (
        <div className="fixed top-4 right-4 z-50 animate-msg-enter flex items-center gap-3 px-4 py-3 rounded-xl bg-[#10C98A10] border border-[#10C98A30] text-sm text-[#10C98A]">
          <EurekaLogo size={18} />
          <span className="font-medium">{toastMessage}</span>
        </div>
      )}

      {/* Top Navigation */}
      <nav className="flex items-center justify-between px-5 py-2.5 border-b border-[rgba(255,255,255,0.06)] bg-[#14141E] flex-shrink-0">
        <Link href="/" className="flex items-center gap-2.5 hover:opacity-80 transition-opacity">
          <EurekaLogo size={24} />
          <span className="text-xs font-bold tracking-[0.1em] text-[#F2EDE6]">EUREKA</span>
          <span className="text-[10px] text-[rgba(242,237,230,0.3)] ml-1">← Home</span>
        </Link>
        <div className="flex items-center gap-3.5">
          <span className="text-xs font-medium text-[rgba(242,237,230,0.6)]">{subjectLabel}</span>
          <span className="px-2 py-0.5 rounded-full text-[9px] font-semibold uppercase tracking-wider bg-[#9B72FF15] text-[#9B72FF] border border-[#9B72FF30]">
            Socratic Session
          </span>
          <button
            onClick={() => setShowFullMap(!showFullMap)}
            className={`px-2.5 py-0.5 rounded-full text-[9px] font-semibold uppercase tracking-wider transition-all duration-200 border ${
              showFullMap
                ? 'bg-[#4F8EF7] text-[#0D0D14] border-[#4F8EF7]'
                : 'bg-[#1D1D2C] text-[rgba(242,237,230,0.6)] border-[rgba(255,255,255,0.08)] hover:text-[#F2EDE6]'
            }`}
          >
            {showFullMap ? '💬 Chat Workspace' : '🔍 Concept Map Explorer'}
          </button>
          {!showFullMap && (
            <div className="flex items-center bg-[#1D1D2C] border border-[rgba(255,255,255,0.08)] rounded-full p-0.5 ml-1">
              <button
                onClick={() => setDifficulty('beginner')}
                className={`px-2.5 py-0.5 rounded-full text-[9px] font-semibold uppercase tracking-wider transition-all duration-200 ${
                  difficulty === 'beginner'
                    ? 'bg-[#4F8EF7] text-[#0D0D14]'
                    : 'text-[rgba(242,237,230,0.4)] hover:text-[#F2EDE6]'
                }`}
              >
                Beginner
              </button>
              <button
                onClick={() => setDifficulty('challenge')}
                className={`px-2.5 py-0.5 rounded-full text-[9px] font-semibold uppercase tracking-wider transition-all duration-200 ${
                  difficulty === 'challenge'
                    ? 'bg-[#9B72FF] text-[#0D0D14]'
                    : 'text-[rgba(242,237,230,0.4)] hover:text-[#F2EDE6]'
                }`}
              >
                Challenge
              </button>
            </div>
          )}
        </div>
        <div className="flex items-center gap-5 text-[10px] text-[rgba(242,237,230,0.35)] uppercase tracking-widest font-medium">
          <span>Turns <span className="text-[#F2EDE6] font-mono ml-1">{turnCount}</span></span>
          <span>Mastered <span className="text-[#10C98A] font-mono ml-1">{conceptsMastered}</span></span>
          <span>Caught <span className="text-[#F59E0B] font-mono ml-1">{misconceptionCount}</span></span>
          <span className="px-2 py-0.5 rounded-full text-[9px] font-semibold" style={{ backgroundColor: `${bloomColor}15`, color: bloomColor }}>{bloomLevel}</span>
        </div>
      </nav>

      {/* Main Workspace */}
      <div className="flex-1 flex overflow-hidden">
        {showFullMap ? (
          <div className="flex-1">
            <VisualMapView graphState={graphState} subjectLabel={subjectLabel} />
          </div>
        ) : (
          <>
            {/* Left panel — Chat */}
            <div className="w-[62%] border-r border-[rgba(255,255,255,0.06)]">
          <SocraticChat
            subject={subject}
            subjectLabel={subjectLabel}
            difficulty={difficulty}
            nodes={graphState.nodes}
            onNodesUpdate={handleNodesUpdate}
            onMastered={handleMastered}
            onMisconception={handleMisconception}
            onTurnIncrement={handleTurnIncrement}
            onMisconceptionCountIncrement={handleMisconceptionCountIncrement}
            onBloomLevelUpdate={handleBloomLevelUpdate}
            misconceptionAlert={misconceptionAlert}
            onDismissAlert={handleDismissAlert}
          />
        </div>

        {/* Right panel — Tabs */}
        <div className="w-[38%] flex flex-col">
          <div className="flex border-b border-[rgba(255,255,255,0.06)] bg-[#14141E]">
            {tabs.map((tab) => {
              const isHighlight = tab === 'simulator' && masteredPulse !== null;
              return (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`flex-1 px-3 py-3 text-[10px] font-semibold uppercase tracking-widest transition-all ${
                    isHighlight
                      ? 'text-[#4F8EF7] animate-pulse-highlight'
                      : activeTab === tab
                      ? 'text-[#4F8EF7] border-b-2 border-[#4F8EF7]'
                      : 'text-[rgba(242,237,230,0.35)] hover:text-[rgba(242,237,230,0.7)]'
                  }`}
                >
                  {tab === 'simulator' ? 'Simulator' : tab === 'graph' ? 'Graph' : 'Progress'}
                </button>
              );
            })}
          </div>

          <div className="flex-1 overflow-hidden">
            {activeTab === 'simulator' && subject === 'physics' && (
              <PhysicsSimulator autoRun={autoRunSim} />
            )}
            {activeTab === 'graph' && (
              <KnowledgeGraph graphState={graphState} masteredPulse={masteredPulse} />
            )}
            {activeTab === 'progress' && (
              <ProgressPanel
                turnCount={turnCount}
                conceptsMastered={conceptsMastered}
                misconceptionCount={misconceptionCount}
                bloomLevel={bloomLevel}
                sessionLog={sessionLog}
              />
            )}
          </div>
        </div>
      </>
    )}
  </div>
</div>
  );
}

export default function LearnPage() {
  return (
    <Suspense fallback={<div className="h-screen bg-[#0D0D14] flex items-center justify-center text-[rgba(242,237,230,0.4)] text-sm">Loading session...</div>}>
      <LearnContent />
    </Suspense>
  );
}
