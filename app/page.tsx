'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import type { LucideIcon } from 'lucide-react';
import {
  Activity,
  ArrowRight,
  Brain,
  Calculator,
  CheckCircle2,
  Code2,
  FlaskConical,
  GraduationCap,
  Leaf,
  Microscope,
  Network,
  PlayCircle,
  Radar,
  Route,
  ShieldCheck,
} from 'lucide-react';
import EurekaLogo from '@/components/EurekaLogo';

const SUBJECTS: {
  id: string;
  icon: LucideIcon;
  name: string;
  concepts: number;
  color: string;
  description: string;
}[] = [
  { id: 'physics', icon: Activity, name: 'Physics', concepts: 47, color: '#4F8EFF', description: 'Forces, motion, energy, waves, and experiments.' },
  { id: 'mathematics', icon: Calculator, name: 'Mathematics', concepts: 62, color: '#8B5CF6', description: 'Patterns, proof, functions, sequences, and reasoning.' },
  { id: 'chemistry', icon: FlaskConical, name: 'Chemistry', concepts: 38, color: '#14B8A6', description: 'Matter, reactions, bonding, equilibrium, and lab logic.' },
  { id: 'biology', icon: Leaf, name: 'Biology', concepts: 55, color: '#22C55E', description: 'Cells, systems, genetics, ecology, and living processes.' },
  { id: 'computer-science', icon: Code2, name: 'Computer Science', concepts: 41, color: '#F59E0B', description: 'Algorithms, data structures, complexity, and debugging.' },
];

const SYSTEMS: {
  icon: LucideIcon;
  title: string;
  body: string;
  color: string;
}[] = [
  {
    icon: Brain,
    title: 'Socratic AI engine',
    body: 'One precise question at a time. Eureka guides reasoning without handing students the final answer.',
    color: '#4F8EFF',
  },
  {
    icon: Radar,
    title: 'Misconception detection',
    body: 'Common STEM misunderstandings are flagged early, then turned into targeted prompts and thought experiments.',
    color: '#F59E0B',
  },
  {
    icon: Network,
    title: 'Living knowledge graph',
    body: 'Concepts move from undiscovered to discovered to mastered as the student builds understanding.',
    color: '#14B8A6',
  },
  {
    icon: Microscope,
    title: 'Experimental verification',
    body: 'Simulators let students test predictions after discovery, turning reasoning into evidence.',
    color: '#F97316',
  },
];

const METHOD = [
  {
    step: '01',
    title: 'Predict first',
    body: 'Students begin by stating what they think will happen, which reveals their current mental model.',
  },
  {
    step: '02',
    title: 'Probe the assumption',
    body: 'Eureka responds with a focused question that isolates variables and challenges the misconception.',
  },
  {
    step: '03',
    title: 'Verify with evidence',
    body: 'Once the idea clicks, the simulator turns the discovery into a visible experiment.',
  },
];

function useCountUp(target: number, duration = 1400) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let start = 0;
    const step = (timestamp: number) => {
      if (!start) start = timestamp;
      const progress = Math.min((timestamp - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(eased * target));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [target, duration]);

  return count;
}

function StatCard({ value, label, suffix }: { value: number; label: string; suffix?: string }) {
  const count = useCountUp(value);

  return (
    <div className="min-w-[150px] rounded-lg border border-white/10 bg-[#111417]/85 px-5 py-4 text-center backdrop-blur">
      <span className="block font-mono text-2xl font-semibold text-[#F7F4ED]">
        {count}{suffix}
      </span>
      <span className="mt-1 block text-[11px] uppercase tracking-[0.16em] text-[#A7AEA8]">{label}</span>
    </div>
  );
}

const DEMO_SEQUENCE = [
  { role: 'ai', text: 'If a 5kg ball and a 1kg ball drop from the same height, what do you predict will happen?' },
  { role: 'alert', text: 'Misconception flagged: probing the assumption' },
  { role: 'user', text: 'I think the heavier one falls faster.' },
  { role: 'ai', text: 'What experiment could separate mass from air resistance before we decide?' },
];

function ThreeDBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef = useRef({ x: 0, y: 0, tx: 0, ty: 0 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = (canvas.width = canvas.offsetWidth);
    let height = (canvas.height = canvas.offsetHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = canvas.offsetWidth;
      height = canvas.height = canvas.offsetHeight;
    };
    window.addEventListener('resize', handleResize);

    const handleMouseMove = (e: MouseEvent) => {
      const cx = window.innerWidth / 2;
      const cy = window.innerHeight / 2;
      mouseRef.current.tx = (e.clientX - cx) / cx * 100;
      mouseRef.current.ty = (e.clientY - cy) / cy * 100;
    };
    window.addEventListener('mousemove', handleMouseMove);

    // Generate 3D points
    const points: { x: number; y: number; z: number; ox: number; oy: number; oz: number; color: string }[] = [];
    const colors = ['#4F8EFF', '#7C5CF6', '#14B8A6', '#F59E0B', '#F97316'];
    for (let i = 0; i < 90; i++) {
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(Math.random() * 2 - 1);
      const r = 180 + Math.random() * 120; // sphere shell radius
      const x = r * Math.sin(phi) * Math.cos(theta);
      const y = r * Math.sin(phi) * Math.sin(theta);
      const z = r * Math.cos(phi);
      points.push({
        x, y, z,
        ox: x, oy: y, oz: z,
        color: colors[Math.floor(Math.random() * colors.length)],
      });
    }

    let angleX = 0.001;
    let angleY = 0.0015;

    const fov = 400;

    let animId: number;
    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // Smooth mouse tracking
      const m = mouseRef.current;
      m.x += (m.tx - m.x) * 0.05;
      m.y += (m.ty - m.y) * 0.05;

      // Adjust rotation angles based on mouse
      const rotY = angleY + m.x * 0.0001;
      const rotX = angleX + m.y * 0.0001;

      // Rotate points
      points.forEach(p => {
        // Rotate Y
        let cosY = Math.cos(rotY);
        let sinY = Math.sin(rotY);
        let x1 = p.x * cosY - p.z * sinY;
        let z1 = p.x * sinY + p.z * cosY;

        // Rotate X
        let cosX = Math.cos(rotX);
        let sinX = Math.sin(rotX);
        let y2 = p.y * cosX - z1 * sinX;
        let z2 = p.y * sinX + z1 * cosX;

        p.x = x1;
        p.y = y2;
        p.z = z2;
      });

      // Project and draw
      const projected = points.map(p => {
        const scale = fov / (fov + p.z + 100);
        return {
          sx: p.x * scale + width / 2,
          sy: p.y * scale + height / 2,
          sz: p.z,
          scale,
          color: p.color,
        };
      });

      // Sort by depth (painter's algorithm)
      projected.sort((a, b) => b.sz - a.sz);

      // Draw connections
      ctx.lineWidth = 0.5;
      for (let i = 0; i < projected.length; i++) {
        for (let j = i + 1; j < projected.length; j++) {
          const a = projected[i];
          const b = projected[j];
          const dx = a.sx - b.sx;
          const dy = a.sy - b.sy;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 85) {
            // Fade out based on distance and depth
            const alpha = Math.min(1, (85 - dist) / 85) * 0.08 * Math.min(a.scale, b.scale);
            ctx.strokeStyle = `rgba(255, 255, 255, ${alpha})`;
            ctx.beginPath();
            ctx.moveTo(a.sx, a.sy);
            ctx.lineTo(b.sx, b.sy);
            ctx.stroke();
          }
        }
      }

      // Draw points
      projected.forEach(p => {
        const size = Math.max(0.5, p.scale * 2.5);
        const alpha = Math.min(1, Math.max(0.1, (fov - p.sz) / (fov * 2))) * 0.45;
        
        ctx.fillStyle = p.color;
        ctx.shadowBlur = 8;
        ctx.shadowColor = p.color;
        
        ctx.beginPath();
        ctx.arc(p.sx, p.sy, size, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.shadowBlur = 0; // reset
      });

      animId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      cancelAnimationFrame(animId);
    };
  }, []);

  return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none opacity-40 z-0" />;
}

function TiltContainer({ children }: { children: React.ReactNode }) {
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const el = containerRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const xc = rect.width / 2;
    const yc = rect.height / 2;
    const rotateX = (yc - y) / 18; // tilt up to ~10 degrees
    const rotateY = (x - xc) / 18; // tilt up to ~10 degrees
    el.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`;
  };

  const handleMouseLeave = () => {
    const el = containerRef.current;
    if (!el) return;
    el.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)';
  };

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="transition-transform duration-300 ease-out h-full"
      style={{ transformStyle: 'preserve-3d' }}
    >
      {children}
    </div>
  );
}

function DemoTeaser() {
  const [visibleItems, setVisibleItems] = useState(0);
  const [typingIndex, setTypingIndex] = useState(0);
  const [currentText, setCurrentText] = useState('');
  const [cycle, setCycle] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setIsVisible(true);
      },
      { threshold: 0.3 }
    );
    if (containerRef.current) observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!isVisible) return;

    setVisibleItems(0);
    setTypingIndex(0);
    setCurrentText('');

    let itemIndex = 0;
    let charIndex = 0;
    let interval: NodeJS.Timeout | undefined;

    const typeNext = () => {
      if (itemIndex >= DEMO_SEQUENCE.length) {
        setTimeout(() => setCycle((current) => current + 1), 4200);
        return;
      }

      const item = DEMO_SEQUENCE[itemIndex];

      if (item.role === 'alert') {
        setVisibleItems(itemIndex + 1);
        setCurrentText('');
        setTypingIndex(itemIndex + 1);
        itemIndex += 1;
        setTimeout(typeNext, 650);
        return;
      }

      setVisibleItems(itemIndex);
      setTypingIndex(itemIndex);
      charIndex = 0;

      interval = setInterval(() => {
        charIndex += 1;
        setCurrentText(item.text.slice(0, charIndex));
        if (charIndex >= item.text.length) {
          if (interval) clearInterval(interval);
          setVisibleItems(itemIndex + 1);
          setTypingIndex(itemIndex + 1);
          setCurrentText('');
          itemIndex += 1;
          setTimeout(typeNext, 850);
        }
      }, 24);
    };

    const startDelay = setTimeout(typeNext, 450);
    return () => {
      clearTimeout(startDelay);
      if (interval) clearInterval(interval);
    };
  }, [isVisible, cycle]);

  return (
    <div ref={containerRef} className="mx-auto max-w-3xl w-full">
      <div className="mb-5 flex items-center justify-center gap-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#14B8A6]">
        <PlayCircle size={14} />
        Live session preview
      </div>

      <TiltContainer>
        <div className="overflow-hidden rounded-lg border border-white/10 bg-[#0B0D10] shadow-2xl shadow-black/30">
          <div className="flex items-center gap-2 border-b border-white/10 bg-[#15191D] px-4 py-3">
            <div className="flex gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-[#EF4444]" />
              <span className="h-2.5 w-2.5 rounded-full bg-[#F59E0B]" />
              <span className="h-2.5 w-2.5 rounded-full bg-[#22C55E]" />
            </div>
            <div className="flex-1 text-center font-mono text-[10px] text-[#6F7A76]">
              /learn?subject=physics
            </div>
          </div>

          <div className="min-h-[250px] space-y-4 p-5">
            {DEMO_SEQUENCE.map((item, index) => {
              const isFullyVisible = index < visibleItems;
              const isTyping = index === typingIndex && typingIndex < DEMO_SEQUENCE.length;
              const displayText = isFullyVisible ? item.text : isTyping ? currentText : '';

              if (!isFullyVisible && !isTyping) return null;

              if (item.role === 'alert') {
                return (
                  <div key={`${cycle}-${index}`} className="animate-msg-enter rounded-lg border border-[#F59E0B40] bg-[#F59E0B10] px-3 py-2 text-xs text-[#F8B84E]">
                    {item.text}
                  </div>
                );
              }

              if (item.role === 'ai') {
                return (
                  <div key={`${cycle}-${index}`} className="flex gap-3 animate-msg-enter">
                    <EurekaLogo size={26} />
                    <div className="max-w-[86%] rounded-lg border-l-2 border-[#4F8EFF] bg-[#171B20] px-4 py-3 text-sm leading-relaxed text-[#F7F4ED]">
                      {displayText}
                      {isTyping && <span className="ml-1 inline-block h-4 w-0.5 animate-pulse bg-[#4F8EFF]" />}
                    </div>
                  </div>
                );
              }

              return (
                <div key={`${cycle}-${index}`} className="flex justify-end animate-msg-enter">
                  <div className="max-w-[72%] rounded-lg border border-[#4F8EFF30] bg-[#4F8EFF10] px-4 py-3 text-sm leading-relaxed text-[#F7F4ED]">
                    {displayText}
                    {isTyping && <span className="ml-1 inline-block h-4 w-0.5 animate-pulse bg-[#A7AEA8]" />}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </TiltContainer>
    </div>
  );
}

export default function LandingPage() {
  return (
    <div className="min-h-screen overflow-hidden bg-[#080A0F] text-[#F7F4ED]">
      <header className="fixed inset-x-0 top-0 z-50 border-b border-white/10 bg-[#080A0F]/78 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-3 md:px-8">
          <Link href="/" className="flex items-center gap-2.5">
            <EurekaLogo size={32} />
            <span className="font-semibold uppercase tracking-[0.18em] text-[#F7F4ED]">Eureka</span>
          </Link>

          <nav className="hidden items-center gap-7 text-xs font-semibold uppercase tracking-[0.16em] text-[#A7AEA8] md:flex">
            <a href="#product" className="transition-colors hover:text-[#F7F4ED]">Product</a>
            <a href="#subjects" className="transition-colors hover:text-[#F7F4ED]">Subjects</a>
            <a href="#evidence" className="transition-colors hover:text-[#F7F4ED]">Evidence</a>
          </nav>

          <Link
            href="/learn?subject=physics"
            className="inline-flex items-center gap-2 rounded-full bg-[#F7F4ED] px-4 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-[#080A0F] transition-transform hover:-translate-y-0.5"
          >
            Launch
            <ArrowRight size={14} />
          </Link>
        </div>
      </header>

      <main>
        <section className="relative flex min-h-[84vh] items-center justify-center overflow-hidden px-5 pb-16 pt-28 text-center bg-[#080A0F]">
          <ThreeDBackground />
          <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(8,10,15,0.1)_0%,rgba(8,10,15,0.75)_62%,#080A0F_100%)]" />

          <div className="relative z-10 mx-auto max-w-4xl">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-[#14B8A650] bg-[#14B8A610] px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#5EEAD4]">
              <ShieldCheck size={14} />
              Now launching
            </div>

            <h1 className="text-6xl font-semibold leading-none text-[#F7F4ED] md:text-8xl" style={{ fontFamily: 'Georgia, serif' }}>
              Eureka
            </h1>

            <p className="mx-auto mt-6 max-w-2xl text-base leading-8 text-[#D7DDD8] md:text-lg">
              A Socratic STEM discovery engine that asks sharper questions, catches misconceptions, maps mastery, and lets students prove ideas through simulations.
            </p>

            <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Link
                href="/learn?subject=physics"
                className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-[#4F8EFF] px-7 py-3.5 text-sm font-semibold text-white transition-transform hover:-translate-y-0.5 sm:w-auto"
              >
                Start a discovery session
                <ArrowRight size={17} />
              </Link>
              <Link
                href="/demo"
                className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-white/20 bg-white/[0.08] px-7 py-3.5 text-sm font-semibold text-[#F7F4ED] backdrop-blur transition-colors hover:border-white/40 sm:w-auto"
              >
                Watch demo
                <PlayCircle size={17} />
              </Link>
            </div>

            <div className="mt-10 flex flex-wrap justify-center gap-3">
              <StatCard value={200} label="Misconceptions" suffix="+" />
              <StatCard value={6} label="STEM subjects" />
              <StatCard value={4} label="Connected systems" />
            </div>
          </div>
        </section>

        <section id="product" className="relative z-10 border-y border-white/10 bg-[#0D1014] px-5 py-20">
          <div className="mx-auto grid max-w-6xl gap-10 md:grid-cols-[0.9fr_1.1fr] md:items-center">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#14B8A6]">The product</p>
              <h2 className="mt-4 text-3xl font-semibold leading-tight text-[#F7F4ED] md:text-5xl">
                Built for the moment a concept finally clicks.
              </h2>
              <p className="mt-5 text-sm leading-7 text-[#A7AEA8] md:text-base">
                Eureka is not an answer machine. It is a guided learning environment where conversation, misconception checks, graph progress, and simulation work together in one session.
              </p>
              <div className="mt-7 grid gap-3 text-sm text-[#D7DDD8]">
                {['Never gives the final answer directly', 'Escalates hints when students get stuck', 'Turns discovered concepts into visible mastery'].map((item) => (
                  <div key={item} className="flex items-center gap-3">
                    <CheckCircle2 size={18} className="text-[#22C55E]" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>

            <DemoTeaser />
          </div>
        </section>

        <section className="px-5 py-20">
          <div className="mx-auto max-w-6xl">
            <div className="mb-10 max-w-2xl">
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#F59E0B]">How it works</p>
              <h2 className="mt-4 text-3xl font-semibold leading-tight text-[#F7F4ED] md:text-4xl">
                A launch-ready learning loop.
              </h2>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              {METHOD.map((item) => (
                <div key={item.step} className="rounded-lg border border-white/10 bg-[#111417] p-6">
                  <div className="font-mono text-xs font-semibold uppercase tracking-[0.18em] text-[#5EEAD4]">{item.step}</div>
                  <h3 className="mt-5 text-lg font-semibold text-[#F7F4ED]">{item.title}</h3>
                  <p className="mt-3 text-sm leading-6 text-[#A7AEA8]">{item.body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="border-y border-white/10 bg-[#0D1014] px-5 py-20">
          <div className="mx-auto max-w-6xl">
            <div className="mb-10 flex flex-col justify-between gap-5 md:flex-row md:items-end">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#4F8EFF]">Core systems</p>
                <h2 className="mt-4 text-3xl font-semibold leading-tight text-[#F7F4ED] md:text-4xl">
                  Four systems, one learning session.
                </h2>
              </div>
              <Link href="/demo" className="inline-flex items-center gap-2 text-sm font-semibold text-[#5EEAD4]">
                Open the working demo
                <ArrowRight size={16} />
              </Link>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              {SYSTEMS.map((item) => {
                const Icon = item.icon;
                return (
                  <div key={item.title} className="rounded-lg border border-white/10 bg-[#111417] p-5">
                    <div
                      className="mb-5 inline-flex h-10 w-10 items-center justify-center rounded-lg border"
                      style={{ borderColor: `${item.color}55`, backgroundColor: `${item.color}12`, color: item.color }}
                    >
                      <Icon size={20} />
                    </div>
                    <h3 className="text-base font-semibold text-[#F7F4ED]">{item.title}</h3>
                    <p className="mt-3 text-sm leading-6 text-[#A7AEA8]">{item.body}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        <section id="subjects" className="px-5 py-20">
          <div className="mx-auto max-w-6xl">
            <div className="mb-10 max-w-2xl">
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#22C55E]">Curriculum</p>
              <h2 className="mt-4 text-3xl font-semibold leading-tight text-[#F7F4ED] md:text-4xl">
                Choose a subject and start from the map.
              </h2>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {SUBJECTS.map((subject) => {
                const Icon = subject.icon;
                return (
                  <TiltContainer key={subject.id}>
                    <Link
                      href={`/learn?subject=${subject.id}`}
                      className="group block h-full rounded-lg border border-white/10 bg-[#111417] p-5 transition-transform hover:-translate-y-1"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div
                          className="inline-flex h-11 w-11 items-center justify-center rounded-lg border"
                          style={{ borderColor: `${subject.color}55`, backgroundColor: `${subject.color}12`, color: subject.color }}
                        >
                          <Icon size={21} />
                        </div>
                        <ArrowRight size={17} className="mt-1 text-[#6F7A76] transition-transform group-hover:translate-x-1 group-hover:text-[#F7F4ED]" />
                      </div>
                      <h3 className="mt-5 text-lg font-semibold text-[#F7F4ED]">{subject.name}</h3>
                      <p className="mt-2 text-sm leading-6 text-[#A7AEA8]">{subject.description}</p>
                      <p className="mt-5 font-mono text-[11px] uppercase tracking-[0.16em]" style={{ color: subject.color }}>
                        {subject.concepts} concepts
                      </p>
                    </Link>
                  </TiltContainer>
                );
              })}
            </div>
          </div>
        </section>

        <section id="evidence" className="border-y border-white/10 bg-[#0D1014] px-5 py-20">
          <div className="mx-auto max-w-6xl">
            <div className="mb-10 max-w-2xl">
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#F97316]">Evidence</p>
              <h2 className="mt-4 text-3xl font-semibold leading-tight text-[#F7F4ED] md:text-4xl">
                Grounded in how students actually remember.
              </h2>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              {[
                {
                  icon: GraduationCap,
                  title: "Bloom's 2-sigma problem",
                  body: 'Eureka approximates one-on-one tutoring by monitoring understanding continuously.',
                },
                {
                  icon: Route,
                  title: 'Constructive learning',
                  body: 'Students build durable understanding by producing the reasoning themselves.',
                },
                {
                  icon: ShieldCheck,
                  title: 'Retrieval practice',
                  body: 'Every prompt asks students to predict, retrieve, compare, or apply before they see confirmation.',
                },
              ].map((item) => {
                const Icon = item.icon;
                return (
                  <div key={item.title} className="rounded-lg border border-white/10 bg-[#111417] p-6">
                    <Icon size={24} className="text-[#F97316]" />
                    <h3 className="mt-5 text-base font-semibold text-[#F7F4ED]">{item.title}</h3>
                    <p className="mt-3 text-sm leading-6 text-[#A7AEA8]">{item.body}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        <section className="px-5 py-20 text-center">
          <div className="mx-auto max-w-3xl">
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#14B8A6]">Ready</p>
            <h2 className="mt-4 text-4xl font-semibold leading-tight text-[#F7F4ED] md:text-5xl" style={{ fontFamily: 'Georgia, serif' }}>
              Start with physics. Leave with proof.
            </h2>
            <p className="mx-auto mt-5 max-w-xl text-sm leading-7 text-[#A7AEA8]">
              Open a live learning session, test the free-fall simulator, and watch the knowledge graph update as concepts move into mastery.
            </p>
            <div className="mt-8 flex justify-center">
              <Link
                href="/learn?subject=physics"
                className="inline-flex items-center gap-2 rounded-full bg-[#F7F4ED] px-8 py-3.5 text-sm font-semibold text-[#080A0F] transition-transform hover:-translate-y-0.5"
              >
                Launch Eureka
                <ArrowRight size={17} />
              </Link>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-white/10 px-5 py-8">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 text-center md:flex-row md:text-left">
          <div className="flex items-center gap-3">
            <EurekaLogo size={24} />
            <span className="text-xs font-semibold uppercase tracking-[0.18em] text-[#A7AEA8]">Eureka</span>
          </div>
          <div className="flex items-center gap-5 text-[11px] font-semibold uppercase tracking-[0.16em] text-[#6F7A76]">
            <Link href="/demo" className="hover:text-[#F7F4ED]">Demo</Link>
            <Link href="/learn?subject=physics" className="hover:text-[#F7F4ED]">Launch app</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
