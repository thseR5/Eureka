'use client';

import { useState, useEffect, useCallback, Suspense } from 'react';
import Link from 'next/link';
import EurekaLogo from '@/components/EurekaLogo';
import SocraticChat from '@/components/SocraticChat';
import PhysicsSimulator from '@/components/PhysicsSimulator';
import KnowledgeGraph from '@/components/KnowledgeGraph';
import ProgressPanel from '@/components/ProgressPanel';
import type { SessionLogEntry } from '@/components/ProgressPanel';
import type { KGNode, KnowledgeGraphState } from '@/lib/knowledgeGraph';
import { getInitialGraph } from '@/lib/knowledgeGraph';
import type { ChatMessage } from '@/components/SocraticChat';

const DEMO_MESSAGES: ChatMessage[] = [
  {
    role: 'assistant',
    content:
      'If you dropped a heavy textbook and a pen from the same height at exactly the same moment — what would you expect to happen, and why?',
    bloomLevel: 'Remember',
  },
  {
    role: 'user',
    content: 'I think heavier things fall faster',
  },
  {
    role: 'assistant',
    content:
      "Interesting — you're assuming weight changes how fast something falls. What if you took two identical pieces of paper, crumpled one into a tight ball, and left the other flat? Which hits the ground first, and why?",
    bloomLevel: 'Understand',
  },
  {
    role: 'user',
    content:
      'The crumpled one would hit first... but they have the same weight. So is it something about the shape?',
  },
  {
    role: 'assistant',
    content:
      "You just noticed weight wasn't the key variable — that's a big insight. If shape matters because of air resistance, what would happen in a place with no air at all?",
    bloomLevel: 'Apply',
  },
  {
    role: 'user',
    content:
      "Oh — they'd actually hit at the same time if there's no air?",
  },
  {
    role: 'assistant',
    content:
      "You discovered it yourself — in the absence of air resistance, all objects fall at the same rate regardless of mass. Galileo showed this 400 years ago, overturning 2000 years of Aristotelian thinking. What does that tell you about the role of air in your everyday experience?",
    bloomLevel: 'Analyze',
    masteredConcept: 'free_fall',
  },
];

function DemoContent() {
  const [graphState, setGraphState] = useState<KnowledgeGraphState>(() => {
    const g = getInitialGraph('physics');
    g.nodes = g.nodes.map((n) =>
      n.id === 'free_fall' ? { ...n, status: 'mastered' as const } : n
    );
    return g;
  });
  const [masteredPulse, setMasteredPulse] = useState<string | null>('free_fall');
  const [misconceptionAlert, setMisconceptionAlert] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'simulator' | 'graph' | 'progress'>('simulator');
  const [turnCount, setTurnCount] = useState(4);
  const [conceptsMastered, setConceptsMastered] = useState(1);
  const [misconceptionCount, setMisconceptionCount] = useState(1);
  const [bloomLevel, setBloomLevel] = useState('Analyze');
  const [autoRunSim, setAutoRunSim] = useState(true);
  const [toastMessage, setToastMessage] = useState<string | null>('Concept Mastered: free fall');
  const [sessionLog] = useState<SessionLogEntry[]>([
    { timestamp: '00:00:01', event: 'Session Started', detail: "Physics — Newton's Laws" },
    { timestamp: '00:00:05', event: 'Misconception Detected', detail: 'heavier_falls_faster' },
    { timestamp: '00:00:12', event: "Bloom's Level Update", detail: 'Understand' },
    { timestamp: '00:00:20', event: "Bloom's Level Update", detail: 'Apply' },
    { timestamp: '00:00:28', event: 'Concept Mastered', detail: 'free_fall' },
    { timestamp: '00:00:28', event: "Bloom's Level Update", detail: 'Analyze' },
  ]);

  useEffect(() => {
    setMisconceptionAlert("⚠ Aristotle's 2000-year error detected");
    const timer = setTimeout(() => setMisconceptionAlert(null), 8000);
    const toastTimer = setTimeout(() => setToastMessage(null), 4000);
    const pulseTimer = setTimeout(() => setMasteredPulse(null), 2000);
    return () => {
      clearTimeout(timer);
      clearTimeout(toastTimer);
      clearTimeout(pulseTimer);
    };
  }, []);

  const handleNodesUpdate = useCallback((nodes: KGNode[]) => {
    setGraphState((prev) => ({ ...prev, nodes }));
  }, []);

  const handleMastered = useCallback((conceptId: string) => {
    setConceptsMastered((c) => c + 1);
    setMasteredPulse(conceptId);
    setToastMessage(`Concept Mastered: ${conceptId.replace(/_/g, ' ')}`);
    setActiveTab('simulator');
    setAutoRunSim(true);
    setTimeout(() => setMasteredPulse(null), 2000);
    setTimeout(() => setToastMessage(null), 4000);
  }, []);

  const handleMisconception = useCallback((alert: string) => {
    setMisconceptionAlert(alert);
  }, []);

  const handleDismissAlert = useCallback(() => {
    setMisconceptionAlert(null);
  }, []);

  const handleTurnIncrement = useCallback(() => setTurnCount((t) => t + 1), []);
  const handleMisconceptionCountIncrement = useCallback(() => setMisconceptionCount((c) => c + 1), []);
  const handleBloomLevelUpdate = useCallback((level: string) => setBloomLevel(level), []);

  return (
    <div className="h-screen flex flex-col bg-[#0D0D14]">
      {/* Top Navigation */}
      <nav className="flex items-center justify-between px-5 py-2.5 border-b border-[rgba(255,255,255,0.06)] bg-[#14141E] flex-shrink-0">
        <Link href="/" className="flex items-center gap-2.5 hover:opacity-80 transition-opacity">
          <EurekaLogo size={24} />
          <span className="text-xs font-bold tracking-[0.1em] text-[#F2EDE6]">EUREKA</span>
          <span className="text-[10px] text-[rgba(242,237,230,0.3)] ml-1">← Home</span>
        </Link>
        <span className="px-3 py-1 rounded-full text-[10px] font-semibold tracking-widest uppercase bg-[#7C5CF610] text-[#7C5CF6] border border-[#7C5CF630]">Demo Mode</span>
        <div className="flex items-center gap-5 text-[10px] text-[rgba(242,237,230,0.35)] uppercase tracking-widest">
          <span>Turns <span className="text-[#F2EDE6] font-mono ml-1">{turnCount}</span></span>
          <span>Mastered <span className="text-[#10C98A] font-mono ml-1">{conceptsMastered}</span></span>
        </div>
      </nav>

      {/* Demo banner */}
      <div className="px-4 py-2.5 bg-[#7C5CF610] border-b border-[#7C5CF630] text-center text-[10px] font-semibold tracking-widest uppercase text-[#7C5CF6]">
        Demo — Happy Path: Student discovers free fall through Socratic questioning
      </div>

      {/* Toast */}
      {toastMessage && (
        <div className="fixed top-10 right-4 z-50 animate-msg-enter flex items-center gap-3 px-4 py-3 rounded-xl bg-[#10C98A10] border border-[#10C98A30] text-sm text-[#10C98A]">
          <EurekaLogo size={18} />
          <span className="font-medium">{toastMessage}</span>
        </div>
      )}

      <div className="flex-1 flex overflow-hidden">
        <div className="w-[62%] border-r border-[rgba(255,255,255,0.06)]">
          <SocraticChat
            subject="physics"
            subjectLabel="Physics — Newton's Laws"
            difficulty="beginner"
            nodes={graphState.nodes}
            onNodesUpdate={handleNodesUpdate}
            onMastered={handleMastered}
            onMisconception={handleMisconception}
            onTurnIncrement={handleTurnIncrement}
            onMisconceptionCountIncrement={handleMisconceptionCountIncrement}
            onBloomLevelUpdate={handleBloomLevelUpdate}
            misconceptionAlert={misconceptionAlert}
            onDismissAlert={handleDismissAlert}
            initialMessages={DEMO_MESSAGES}
            initialTurnCount={4}
            initialFrustrationCount={0}
            initialMastered={['free_fall']}
          />
        </div>

        <div className="w-[38%] flex flex-col">
          <div className="flex border-b border-[rgba(255,255,255,0.06)] bg-[#14141E]">
            {(['simulator', 'graph', 'progress'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex-1 px-3 py-3 text-[10px] font-semibold uppercase tracking-widest transition-colors ${
                  activeTab === tab
                    ? 'text-[#4F8EF7] border-b-2 border-[#4F8EF7]'
                    : 'text-[rgba(242,237,230,0.35)] hover:text-[rgba(242,237,230,0.7)]'
                }`}
              >
                {tab === 'simulator' ? 'Simulator' : tab === 'graph' ? 'Graph' : 'Progress'}
              </button>
            ))}
          </div>

          <div className="flex-1 overflow-hidden">
            {activeTab === 'simulator' && <PhysicsSimulator autoRun={autoRunSim} />}
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
      </div>
    </div>
  );
}

export default function DemoPage() {
  return (
    <Suspense fallback={<div className="h-screen bg-[#0D0D14] flex items-center justify-center text-[rgba(242,237,230,0.4)] text-sm">Loading demo...</div>}>
      <DemoContent />
    </Suspense>
  );
}
