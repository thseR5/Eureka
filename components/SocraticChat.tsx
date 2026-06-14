'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import EurekaLogo from './EurekaLogo';
import MisconceptionAlert from './MisconceptionAlert';
import { detectMisconceptions, detectFrustration, isSubstantive } from '@/lib/misconceptions';
import { buildSystemPrompt, getOpeningQuestion } from '@/lib/systemPrompt';
import { updateNodeFromMessage, masterNode, extractMasteredConcept } from '@/lib/knowledgeGraph';
import type { KGNode } from '@/lib/knowledgeGraph';
import DoubtFlowChart from './DoubtFlowChart';

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  bloomLevel?: string;
  isStreaming?: boolean;
  masteredConcept?: string;
}

interface SocraticChatProps {
  subject: string;
  subjectLabel: string;
  difficulty: 'beginner' | 'challenge';
  nodes: KGNode[];
  onNodesUpdate: (nodes: KGNode[]) => void;
  onMastered: (conceptId: string) => void;
  onMisconception: (alert: string) => void;
  onTurnIncrement: () => void;
  onMisconceptionCountIncrement: () => void;
  onBloomLevelUpdate: (level: string) => void;
  misconceptionAlert: string | null;
  onDismissAlert: () => void;
  initialMessages?: ChatMessage[];
  initialTurnCount?: number;
  initialFrustrationCount?: number;
  initialMastered?: string[];
}

const BLOOM_COLORS: Record<string, string> = {
  Remember: '#4F8EF7',
  Understand: '#7C5CF6',
  Apply: '#10C98A',
  Analyze: '#F59E0B',
  Evaluate: '#EF4444',
  Create: '#EC4899',
};

function inferBloomLevel(text: string): string {
  const lower = text.toLowerCase();
  if (lower.includes('create') || lower.includes('design') || lower.includes('construct')) return 'Create';
  if (lower.includes('evaluate') || lower.includes('judge') || lower.includes('assess')) return 'Evaluate';
  if (lower.includes('analyze') || lower.includes('compare') || lower.includes('why')) return 'Analyze';
  if (lower.includes('apply') || lower.includes('what if') || lower.includes('predict')) return 'Apply';
  if (lower.includes('understand') || lower.includes('explain') || lower.includes('in your own words')) return 'Understand';
  return 'Remember';
}

export default function SocraticChat({
  subject,
  subjectLabel,
  difficulty,
  nodes,
  onNodesUpdate,
  onMastered,
  onMisconception,
  onTurnIncrement,
  onMisconceptionCountIncrement,
  onBloomLevelUpdate,
  misconceptionAlert,
  onDismissAlert,
  initialMessages,
  initialTurnCount = 0,
  initialFrustrationCount = 0,
  initialMastered = [],
}: SocraticChatProps) {
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages || []);
  const [input, setInput] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [turnCount, setTurnCount] = useState(initialTurnCount);
  const [frustrationCount, setFrustrationCount] = useState(initialFrustrationCount);
  const [mastered, setMastered] = useState<string[]>(initialMastered);
  const [apiMessages, setApiMessages] = useState<{ role: 'user' | 'assistant'; content: string }[]>([]);
  const [hasInitialized, setHasInitialized] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  useEffect(() => {
    if (hasInitialized) return;
    setHasInitialized(true);
    if (!initialMessages || initialMessages.length === 0) {
      const opening = getOpeningQuestion(subject);
      setMessages([{ role: 'assistant', content: opening, bloomLevel: 'Remember' }]);
    } else {
      const apiMsgs = initialMessages.map((m) => ({ role: m.role, content: m.content }));
      setApiMessages(apiMsgs);
    }
  }, [subject, hasInitialized, initialMessages]);

  const sendMessage = useCallback(async () => {
    if (!input.trim() || isStreaming) return;
    const userText = input.trim();
    setInput('');

    const detected = detectMisconceptions(userText);
    let misconceptionHint = '';
    if (detected.length > 0) {
      detected.forEach((m) => {
        onMisconception(m.alert);
        onMisconceptionCountIncrement();
      });
      misconceptionHint = detected.map((m) => m.hint).join(' ');
    }

    const updatedNodes = updateNodeFromMessage(nodes, userText, subject);
    onNodesUpdate(updatedNodes);

    let newFrustration = frustrationCount;
    if (detectFrustration(userText)) {
      newFrustration = frustrationCount + 1;
      setFrustrationCount(newFrustration);
    } else if (isSubstantive(userText)) {
      newFrustration = 0;
      setFrustrationCount(0);
    }

    const newTurnCount = turnCount + 1;
    setTurnCount(newTurnCount);
    onTurnIncrement();

    const userMsg: ChatMessage = { role: 'user', content: userText };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);

    const newApiMessages = [...apiMessages, { role: 'user' as const, content: userText }];
    setApiMessages(newApiMessages);

    const systemPrompt = buildSystemPrompt({
      subject,
      difficulty,
      conceptsMastered: mastered,
      frustrationCount: newFrustration,
      turnCount: newTurnCount,
      misconceptionHint: misconceptionHint || undefined,
    });

    const assistantMsg: ChatMessage = { role: 'assistant', content: '', isStreaming: true };
    setMessages([...newMessages, assistantMsg]);
    setIsStreaming(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: newApiMessages, systemPrompt }),
      });

      if (!response.ok) throw new Error(`API error: ${response.status}`);

      if (!response.body) throw new Error('No response body from server');
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let fullText = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const lines = decoder.decode(value).split('\n');
        for (const line of lines) {
          if (line.startsWith('data: ') && line !== 'data: [DONE]') {
            try {
              const parsed = JSON.parse(line.slice(6));
              // Surface any server-side error to the outer catch
              if (parsed.error) throw new Error(parsed.error);
              if (parsed.text) {
                fullText += parsed.text;
                setMessages((prev) => {
                  const updated = [...prev];
                  updated[updated.length - 1] = {
                    role: 'assistant',
                    content: fullText,
                    isStreaming: true,
                    bloomLevel: inferBloomLevel(fullText),
                  };
                  return updated;
                });
              }
            } catch (parseErr) {
              // Re-throw real errors; only swallow malformed SSE lines
              if (parseErr instanceof SyntaxError) continue;
              throw parseErr;
            }
          }
        }
      }

      const bloomLevel = inferBloomLevel(fullText);
      onBloomLevelUpdate(bloomLevel);

      const masteredConcept = extractMasteredConcept(fullText);
      let newMastered = [...mastered];
      if (masteredConcept) {
        newMastered.push(masteredConcept);
        setMastered(newMastered);
        const masteredNodes = masterNode(updatedNodes, masteredConcept);
        onNodesUpdate(masteredNodes);
        onMastered(masteredConcept);
      }

      const displayText = fullText.replace(/\[MASTERED:\s*\w+\]/g, '').trim();

      setMessages((prev) => {
        const updated = [...prev];
        updated[updated.length - 1] = {
          role: 'assistant',
          content: displayText,
          isStreaming: false,
          bloomLevel,
          masteredConcept: masteredConcept || undefined,
        };
        return updated;
      });
      setApiMessages([...newApiMessages, { role: 'assistant', content: fullText }]);
    } catch (err) {
      const errMsg = err instanceof Error ? err.message : String(err);
      const isApiKeyError = errMsg.toLowerCase().includes('api key') || errMsg.includes('403') || errMsg.includes('401');
      setMessages((prev) => {
        const updated = [...prev];
        updated[updated.length - 1] = {
          role: 'assistant',
          content: isApiKeyError
            ? 'API key error — check that ANTHROPIC_API_KEY (or GEMINI_API_KEY) is set correctly in your environment.'
            : `Error: ${errMsg}. Please try again.`,
          isStreaming: false,
        };
        return updated;
      });
    }

    setIsStreaming(false);
    inputRef.current?.focus();
  }, [
    input, isStreaming, messages, apiMessages, subject, nodes, mastered,
    frustrationCount, turnCount, onNodesUpdate, onMastered, onMisconception,
    onTurnIncrement, onMisconceptionCountIncrement, onBloomLevelUpdate,
  ]);

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-3 border-b border-[rgba(255,255,255,0.06)] bg-[#14141E]">
        <div className="flex items-center gap-3">
          <EurekaLogo size={28} />
          <span className="text-xs font-bold tracking-[0.1em] text-[#F2EDE6]">EUREKA</span>
          <span className="px-2.5 py-1 rounded-full text-[10px] font-medium bg-[#4F8EF710] text-[#4F8EF7] border border-[#4F8EF730]">
            {subjectLabel}
          </span>
        </div>
        <div className="flex items-center gap-5 text-[10px] text-[rgba(242,237,230,0.4)] uppercase tracking-widest">
          <span>Turns <span className="text-[#F2EDE6] font-mono ml-1">{turnCount}</span></span>
          <span>Mastered <span className="text-[#10C98A] font-mono ml-1">{mastered.length}</span></span>
        </div>
      </div>

      {/* Misconception Alert */}
      {misconceptionAlert && (
        <div className="px-5 pt-3">
          <MisconceptionAlert alert={misconceptionAlert} onDismiss={onDismissAlert} />
        </div>
      )}

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-5 py-5 space-y-5 scrollbar-thin">
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`animate-msg-enter ${msg.role === 'user' ? 'flex justify-end' : ''}`}
          >
            {msg.role === 'assistant' ? (
              <div className="flex gap-3 max-w-[88%]">
                <div className="flex-shrink-0 mt-0.5">
                  <EurekaLogo size={26} />
                </div>
                <div>
                  <div className="bg-[#1A1A28] rounded-xl px-4 py-3.5 text-sm text-[#F2EDE6] leading-relaxed border-l-[2px] border-[#4F8EF7]">
                    {msg.content}
                    {msg.isStreaming && (
                      <span className="inline-flex gap-1 ml-2 items-center">
                        <span className="typing-dot" />
                        <span className="typing-dot" />
                        <span className="typing-dot" />
                      </span>
                    )}
                  </div>
                  {msg.masteredConcept && (() => {
                    const node = nodes.find((n) => n.id === msg.masteredConcept);
                    if (node && node.doubtFlow) {
                      return (
                        <div className="mt-3.5 max-w-lg">
                          <DoubtFlowChart
                            conceptId={node.id}
                            conceptLabel={node.label}
                            initialDoubt={node.doubtFlow.initialDoubt}
                            steps={node.doubtFlow.steps}
                            resolution={node.doubtFlow.resolution}
                          />
                        </div>
                      );
                    }
                    return null;
                  })()}
                  {msg.bloomLevel && !msg.isStreaming && (
                    <span
                      className="inline-block mt-2 px-2.5 py-0.5 rounded-full text-[9px] font-semibold tracking-wider uppercase"
                      style={{
                        backgroundColor: `${BLOOM_COLORS[msg.bloomLevel] || '#4F8EF7'}15`,
                        color: BLOOM_COLORS[msg.bloomLevel] || '#4F8EF7',
                        border: `1px solid ${BLOOM_COLORS[msg.bloomLevel] || '#4F8EF7'}30`,
                      }}
                    >
                      {msg.bloomLevel}
                    </span>
                  )}
                </div>
              </div>
            ) : (
              <div className="bg-[#4F8EF710] border border-[#4F8EF720] rounded-xl px-4 py-3.5 text-sm text-[#F2EDE6] leading-relaxed max-w-[75%]">
                {msg.content}
              </div>
            )}
          </div>
        ))}
        {isStreaming && messages[messages.length - 1]?.role !== 'assistant' && (
          <div className="flex gap-3 items-center">
            <EurekaLogo size={26} />
            <div className="flex gap-1 items-center py-3">
              <span className="typing-dot" />
              <span className="typing-dot" />
              <span className="typing-dot" />
            </div>
          </div>
        )}
      </div>

      {/* Input */}
      <div className="px-5 py-4 border-t border-[rgba(255,255,255,0.06)] bg-[#14141E]">
        <div className="flex items-end gap-2">
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => {
              setInput(e.target.value);
              // Auto-resize
              e.target.style.height = '44px';
              e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px';
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                sendMessage();
              }
            }}
            placeholder="Share your thinking..."
            disabled={isStreaming}
            rows={1}
            className="flex-1 bg-[#0D0D14] border border-[rgba(255,255,255,0.08)] rounded-xl px-4 py-3 text-sm text-[#F2EDE6] placeholder:text-[rgba(242,237,230,0.25)] focus:outline-none focus:border-[#4F8EF740] transition-colors disabled:opacity-50 resize-none overflow-hidden"
            style={{ height: '44px' }}
          />
          <button
            onClick={sendMessage}
            disabled={isStreaming || !input.trim()}
            className="px-5 py-3 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-[#4F8EF7] to-[#7C5CF6] hover:opacity-90 transition-opacity disabled:opacity-40 flex-shrink-0"
          >
            Send
          </button>
        </div>
        <p className="mt-2 text-[10px] text-[rgba(242,237,230,0.25)] text-center tracking-wide">
          Eureka never gives the answer directly · Enter to send
        </p>
      </div>
    </div>
  );
}
