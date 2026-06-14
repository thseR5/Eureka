'use client';

import { CheckCircle2, AlertTriangle, ArrowDown, HelpCircle, Sparkles } from 'lucide-react';

interface DoubtFlowChartProps {
  conceptId: string;
  conceptLabel: string;
  initialDoubt: string;
  steps: string[];
  resolution: string;
  isAnimated?: boolean;
}

export default function DoubtFlowChart({
  conceptId,
  conceptLabel,
  initialDoubt,
  steps,
  resolution,
  isAnimated = true,
}: DoubtFlowChartProps) {
  return (
    <div className={`p-5 rounded-2xl bg-[#11141E] border border-[rgba(255,255,255,0.06)] shadow-xl ${isAnimated ? 'animate-msg-enter' : ''}`}>
      <div className="flex items-center justify-between border-b border-[rgba(255,255,255,0.08)] pb-3 mb-4">
        <div>
          <span className="text-[9px] uppercase tracking-widest text-[#4F8EFF] font-semibold">Doubt Resolution Flow</span>
          <h4 className="text-sm font-semibold text-[#F2EDE6] mt-0.5">{conceptLabel}</h4>
        </div>
        <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[9px] font-semibold bg-[#10C98A10] text-[#10C98A] border border-[#10C98A30] uppercase">
          <Sparkles size={10} /> Cleared
        </span>
      </div>

      <div className="flex flex-col items-center space-y-3 relative">
        {/* Node 1: Initial Doubt */}
        <div className="w-full flex items-start gap-3 p-3 rounded-xl bg-[#F59E0B08] border border-[#F59E0B20] hover:border-[#F59E0B40] transition-colors">
          <div className="h-6 w-6 rounded-lg bg-[#F59E0B15] text-[#F59E0B] flex items-center justify-center flex-shrink-0">
            <AlertTriangle size={14} />
          </div>
          <div>
            <span className="text-[8px] font-semibold uppercase tracking-wider text-[#F59E0B] block">Initial Doubt / Misconception</span>
            <p className="text-xs text-[rgba(242,237,230,0.8)] mt-1 font-medium italic">
              &ldquo;{initialDoubt}&rdquo;
            </p>
          </div>
        </div>

        {/* Connector */}
        <div className="flex flex-col items-center">
          <div className="w-0.5 h-6 bg-gradient-to-b from-[#F59E0B] to-[#7C5CF6] opacity-50" />
          <ArrowDown size={14} className="text-[#7C5CF6] -my-1" />
        </div>

        {/* Node 2: Socratic Exploration Steps */}
        <div className="w-full rounded-xl bg-[#0D0D14] border border-[rgba(255,255,255,0.06)] p-3.5 space-y-3">
          <span className="text-[8px] font-semibold uppercase tracking-wider text-[#7C5CF6] block">Socratic Discovery Pathway</span>
          
          <div className="space-y-2.5">
            {steps.map((step, idx) => (
              <div key={idx} className="flex gap-2.5 items-start">
                <div className="h-4 w-4 rounded-full bg-[#7C5CF615] text-[#7C5CF6] flex items-center justify-center text-[9px] font-bold font-mono flex-shrink-0 mt-0.5">
                  {idx + 1}
                </div>
                <div className="flex-1">
                  <p className="text-xs text-[rgba(242,237,230,0.7)] leading-relaxed">
                    {step}
                  </p>
                </div>
                <CheckCircle2 size={12} className="text-[#10C98A] mt-0.5 flex-shrink-0" />
              </div>
            ))}
          </div>
        </div>

        {/* Connector */}
        <div className="flex flex-col items-center">
          <div className="w-0.5 h-6 bg-gradient-to-b from-[#7C5CF6] to-[#10C98A] opacity-50" />
          <ArrowDown size={14} className="text-[#10C98A] -my-1" />
        </div>

        {/* Node 3: Concept Resolution */}
        <div className="w-full flex items-start gap-3 p-3 rounded-xl bg-[#10C98A08] border border-[#10C98A20] hover:border-[#10C98A40] transition-colors">
          <div className="h-6 w-6 rounded-lg bg-[#10C98A15] text-[#10C98A] flex items-center justify-center flex-shrink-0">
            <CheckCircle2 size={14} />
          </div>
          <div className="flex-1">
            <span className="text-[8px] font-semibold uppercase tracking-wider text-[#10C98A] block">Durable Understanding Established</span>
            <p className="text-xs text-[#F2EDE6] mt-1 font-semibold leading-relaxed">
              {resolution}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
