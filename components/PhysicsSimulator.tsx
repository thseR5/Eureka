'use client';

import { useState, useRef, useEffect, useCallback } from 'react';

interface PhysicsSimulatorProps {
  autoRun?: boolean;
}

interface BallState {
  y: number;
  v: number;
  landed: boolean;
  landTime: number | null;
}

const CANVAS_W = 400;
const CANVAS_H = 400;
const G = 9.8;
const DT = 1 / 60;
const BALL_R = 12;
const TOP_PAD = 40;
const BOT_PAD = 40;
const GROUND_Y = CANVAS_H - BOT_PAD;
const DROP_ZONE_H = GROUND_Y - TOP_PAD;

export default function PhysicsSimulator({ autoRun = false }: PhysicsSimulatorProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animFrameRef = useRef<number>(0);
  const [mass1, setMass1] = useState(5);
  const [mass2, setMass2] = useState(15);
  const [height, setHeight] = useState(20);
  const [airResistance, setAirResistance] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [hasRun, setHasRun] = useState(false);
  const [prediction, setPrediction] = useState('');
  const [showPrediction, setShowPrediction] = useState(true);
  const [ball1, setBall1] = useState<BallState>({ y: 0, v: 0, landed: false, landTime: null });
  const [ball2, setBall2] = useState<BallState>({ y: 0, v: 0, landed: false, landTime: null });
  const [elapsed, setElapsed] = useState(0);
  const stateRef = useRef({
    ball1: { y: 0, v: 0, landed: false, landTime: null as number | null },
    ball2: { y: 0, v: 0, landed: false, landTime: null as number | null },
    time: 0,
  });

  const scale = DROP_ZONE_H / height;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const s = stateRef.current;

    ctx.clearRect(0, 0, CANVAS_W, CANVAS_H);

    ctx.fillStyle = '#0D0D14';
    ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);

    ctx.strokeStyle = 'rgba(255,255,255,0.04)';
    ctx.lineWidth = 1;
    for (let x = 0; x < CANVAS_W; x += 40) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, CANVAS_H);
      ctx.stroke();
    }
    for (let y = 0; y < CANVAS_H; y += 40) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(CANVAS_W, y);
      ctx.stroke();
    }

    ctx.strokeStyle = 'rgba(255,255,255,0.15)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, GROUND_Y);
    ctx.lineTo(CANVAS_W, GROUND_Y);
    ctx.stroke();

    ctx.fillStyle = 'rgba(242,237,230,0.2)';
    ctx.font = '10px JetBrains Mono, monospace';
    for (let h = 0; h <= height; h += 5) {
      const yPos = TOP_PAD + (DROP_ZONE_H - h * scale);
      ctx.fillText(`${h}m`, 5, yPos + 3);
      if (h > 0 && h < height) {
        ctx.strokeStyle = 'rgba(255,255,255,0.03)';
        ctx.beginPath();
        ctx.moveTo(35, yPos);
        ctx.lineTo(CANVAS_W, yPos);
        ctx.stroke();
      }
    }

    const x1 = CANVAS_W * 0.35;
    const x2 = CANVAS_W * 0.65;

    const drawY1 = s.ball1.landed ? GROUND_Y - BALL_R : TOP_PAD + s.ball1.y * scale;
    const drawY2 = s.ball2.landed ? GROUND_Y - BALL_R : TOP_PAD + 30 + s.ball2.y * scale;

    if (!s.ball1.landed) {
      ctx.strokeStyle = 'rgba(79,142,247,0.15)';
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.moveTo(x1, drawY1 + BALL_R);
      ctx.lineTo(x1, GROUND_Y);
      ctx.stroke();
      ctx.setLineDash([]);
    }
    if (!s.ball2.landed) {
      ctx.strokeStyle = 'rgba(245,158,11,0.15)';
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.moveTo(x2, drawY2 + BALL_R);
      ctx.lineTo(x2, GROUND_Y);
      ctx.stroke();
      ctx.setLineDash([]);
    }

    const grad1 = ctx.createRadialGradient(x1 - 3, drawY1 - 3, 2, x1, drawY1, BALL_R);
    grad1.addColorStop(0, '#6BABFF');
    grad1.addColorStop(1, '#4F8EF7');
    ctx.fillStyle = grad1;
    ctx.beginPath();
    ctx.arc(x1, drawY1, BALL_R, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#F2EDE6';
    ctx.font = 'bold 9px JetBrains Mono, monospace';
    ctx.textAlign = 'center';
    ctx.fillText(`${mass1}kg`, x1, drawY1 + 4);
    ctx.textAlign = 'left';

    const grad2 = ctx.createRadialGradient(x2 - 3, drawY2 - 3, 2, x2, drawY2, BALL_R);
    grad2.addColorStop(0, '#FBC34E');
    grad2.addColorStop(1, '#F59E0B');
    ctx.fillStyle = grad2;
    ctx.beginPath();
    ctx.arc(x2, drawY2, BALL_R, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#F2EDE6';
    ctx.font = 'bold 9px JetBrains Mono, monospace';
    ctx.textAlign = 'center';
    ctx.fillText(`${mass2}kg`, x2, drawY2 + 4);
    ctx.textAlign = 'left';

    if (s.ball1.landed && s.ball1.landTime !== null) {
      const rippleAge = s.time - s.ball1.landTime;
      const radius = BALL_R + Math.min(rippleAge * 90, 45);
      const opacity = Math.max(0, 0.8 - rippleAge * 2.5);
      if (opacity > 0) {
        ctx.strokeStyle = `rgba(79,142,247,${opacity})`;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(x1, GROUND_Y, radius, 0, Math.PI * 2);
        ctx.stroke();
      }
    }
    if (s.ball2.landed && s.ball2.landTime !== null) {
      const rippleAge = s.time - s.ball2.landTime;
      const radius = BALL_R + Math.min(rippleAge * 90, 45);
      const opacity = Math.max(0, 0.8 - rippleAge * 2.5);
      if (opacity > 0) {
        ctx.strokeStyle = `rgba(245,158,11,${opacity})`;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(x2, GROUND_Y, radius, 0, Math.PI * 2);
        ctx.stroke();
      }
    }

    ctx.fillStyle = '#F2EDE6';
    ctx.font = '14px JetBrains Mono, monospace';
    ctx.textAlign = 'center';
    ctx.fillText(`t = ${s.time.toFixed(2)}s`, CANVAS_W / 2, CANVAS_H - 12);
    ctx.textAlign = 'left';
  }, [mass1, mass2, height, ball1, ball2, elapsed, scale]);

  const runSimulation = useCallback(() => {
    if (isRunning) return;
    setIsRunning(true);
    setHasRun(true);
    setShowPrediction(false);

    const s = {
      ball1: { y: 0, v: 0, landed: false, landTime: null as number | null },
      ball2: { y: 0, v: 0, landed: false, landTime: null as number | null },
      time: 0,
    };
    stateRef.current = s;

    const simScale = DROP_ZONE_H / height;
    let landed1 = false, landed2 = false;

    const step = () => {
      s.time += DT;

      if (!s.ball1.landed) {
        const drag1 = airResistance * 0.0001 * s.ball1.v * s.ball1.v * Math.pow(mass1, 0.4);
        s.ball1.v += (G - drag1) * DT;
        s.ball1.y += s.ball1.v * DT * simScale / (height / 50);
        if (s.ball1.y * simScale >= DROP_ZONE_H - 30) {
          s.ball1.landed = true;
          s.ball1.landTime = s.time;
          landed1 = true;
        }
      }
      if (!s.ball2.landed) {
        const drag2 = airResistance * 0.0001 * s.ball2.v * s.ball2.v * Math.pow(mass2, 0.4);
        s.ball2.v += (G - drag2) * DT;
        s.ball2.y += s.ball2.v * DT * simScale / (height / 50);
        if (s.ball2.y * simScale >= DROP_ZONE_H - 30) {
          s.ball2.landed = true;
          s.ball2.landTime = s.time;
          landed2 = true;
        }
      }

      setBall1({ ...s.ball1 });
      setBall2({ ...s.ball2 });
      setElapsed(s.time);

      if (landed1 && landed2) {
        setIsRunning(false);
        return;
      }

      animFrameRef.current = requestAnimationFrame(step);
    };

    animFrameRef.current = requestAnimationFrame(step);
  }, [isRunning, mass1, mass2, height, airResistance]);

  useEffect(() => {
    if (autoRun && !hasRun) {
      const timer = setTimeout(runSimulation, 500);
      return () => clearTimeout(timer);
    }
  }, [autoRun, hasRun, runSimulation]);

  useEffect(() => {
    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, []);

  const bothSimultaneous = hasRun && ball1.landTime !== null && ball2.landTime !== null &&
    Math.abs((ball1.landTime || 0) - (ball2.landTime || 0)) < 0.05;

  const getPredictionFeedback = () => {
    if (!prediction) return null;
    const p = prediction.toLowerCase().trim();
    if (bothSimultaneous) {
      const keywords = ['same', 'together', 'both', 'simultaneous', 'equal', 'neither', 'tie', 'no difference'];
      const correct = keywords.some(k => p.includes(k));
      if (correct) {
        return {
          correct: true,
          message: "You predicted it correctly ✓ (Both land at the same time when air resistance is 0%)"
        };
      } else {
        return {
          correct: false,
          message: "Not quite. Both balls landed at the same time because gravity accelerates all objects at the same rate when air resistance is 0%."
        };
      }
    } else {
      const heavier = mass1 > mass2 ? 1 : 2;
      const lighter = mass1 > mass2 ? 2 : 1;
      const heavierMass = mass1 > mass2 ? mass1 : mass2;
      const lighterMass = mass1 > mass2 ? mass2 : mass1;

      const predictedHeavier = p.includes('heavy') || p.includes('more mass') || p.includes('first') || p.includes('mass') || p.includes('ball') || p.includes(heavierMass.toString());
      const predictedSame = p.includes('same') || p.includes('together') || p.includes('both');

      if (predictedSame) {
        return {
          correct: false,
          message: `Discrepancy: You predicted they would land together, but the heavier ball (${heavierMass}kg) landed slightly first because air resistance affects the lighter ball (${lighterMass}kg) more.`
        };
      } else {
        const matchesHeavier = p.includes('heavy') || p.includes('more weight') || p.includes(heavierMass.toString()) || p.includes(`ball ${heavier}`) || p.includes(`ball${heavier}`) || p.includes(`larger`) || p.includes(`bigger`);
        if (matchesHeavier) {
          return {
            correct: true,
            message: "You predicted it correctly ✓ (The heavier ball lands slightly first due to air resistance)"
          };
        } else {
          return {
            correct: false,
            message: `Discrepancy: The heavier ball (${heavierMass}kg) landed first.`
          };
        }
      }
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="px-4 py-3 border-b border-[rgba(255,255,255,0.08)] bg-[#14141E]">
        <h3 className="text-sm font-semibold text-[#F2EDE6]">Free-Fall Experiment</h3>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-4 scrollbar-thin">
        <div className="space-y-3">
          <div>
            <div className="flex justify-between text-xs text-[rgba(242,237,230,0.55)] mb-1">
              <span>Mass 1</span>
              <span className="font-mono text-[#4F8EF7]">{mass1} kg</span>
            </div>
            <input type="range" min={1} max={20} value={mass1} onChange={(e) => setMass1(+e.target.value)} disabled={isRunning}
              className="w-full h-1.5 bg-[#14141E] rounded-full appearance-none cursor-pointer accent-[#4F8EF7]" />
          </div>
          <div>
            <div className="flex justify-between text-xs text-[rgba(242,237,230,0.55)] mb-1">
              <span>Mass 2</span>
              <span className="font-mono text-[#F59E0B]">{mass2} kg</span>
            </div>
            <input type="range" min={1} max={20} value={mass2} onChange={(e) => setMass2(+e.target.value)} disabled={isRunning}
              className="w-full h-1.5 bg-[#14141E] rounded-full appearance-none cursor-pointer accent-[#F59E0B]" />
          </div>
          <div>
            <div className="flex justify-between text-xs text-[rgba(242,237,230,0.55)] mb-1">
              <span>Height</span>
              <span className="font-mono text-[#F2EDE6]">{height} m</span>
            </div>
            <input type="range" min={5} max={50} value={height} onChange={(e) => setHeight(+e.target.value)} disabled={isRunning}
              className="w-full h-1.5 bg-[#14141E] rounded-full appearance-none cursor-pointer accent-[#7C5CF6]" />
          </div>
          <div>
            <div className="flex justify-between text-xs text-[rgba(242,237,230,0.55)] mb-1">
              <span>Air Resistance</span>
              <span className="font-mono text-[#F2EDE6]">{airResistance}%</span>
            </div>
            <input type="range" min={0} max={100} value={airResistance} onChange={(e) => setAirResistance(+e.target.value)} disabled={isRunning}
              className="w-full h-1.5 bg-[#14141E] rounded-full appearance-none cursor-pointer accent-[#10C98A]" />
          </div>
        </div>

        {showPrediction && !hasRun && (
          <div className="p-3 rounded-lg bg-[#14141E] border border-[rgba(255,255,255,0.08)]">
            <p className="text-xs text-[rgba(242,237,230,0.55)] mb-2">What do you predict will happen when you drop these two balls?</p>
            <input
              type="text"
              value={prediction}
              onChange={(e) => setPrediction(e.target.value)}
              placeholder="Which ball hits first?"
              className="w-full bg-[#0D0D14] border border-[rgba(255,255,255,0.08)] rounded px-3 py-1.5 text-xs text-[#F2EDE6] placeholder:text-[rgba(242,237,230,0.3)] focus:outline-none focus:border-[#4F8EF740]"
            />
          </div>
        )}

        <div className="rounded-lg overflow-hidden border border-[rgba(255,255,255,0.08)]">
          <canvas
            ref={canvasRef}
            width={CANVAS_W}
            height={CANVAS_H}
            className="w-full"
          />
        </div>

        {hasRun && ball1.landTime !== null && ball2.landTime !== null && (
          <div className="p-4 rounded-xl bg-[#14141E] border border-[rgba(255,255,255,0.08)] space-y-3">
            <div className="flex flex-col gap-1">
              <span className="text-[10px] text-[rgba(242,237,230,0.3)] uppercase tracking-wider">Simulation Result</span>
              {bothSimultaneous ? (
                <p className="text-sm font-medium text-[#10C98A]">
                  Both hit simultaneously — mass doesn&apos;t affect free fall ✓
                </p>
              ) : (
                <p className="text-sm font-medium text-[#F59E0B]">
                  The heavier ball landed {Math.abs((ball1.landTime || 0) - (ball2.landTime || 0)).toFixed(3)}s earlier (due to air resistance)
                </p>
              )}
            </div>

            {prediction && (
              <div className="pt-3 border-t border-[rgba(255,255,255,0.05)] flex flex-col gap-1.5">
                <span className="text-[10px] text-[rgba(242,237,230,0.3)] uppercase tracking-wider">Prediction Verification</span>
                <p className="text-xs text-[rgba(242,237,230,0.6)] italic">
                  &ldquo;{prediction}&rdquo;
                </p>
                {(() => {
                  const feedback = getPredictionFeedback();
                  if (!feedback) return null;
                  return (
                    <div className={`mt-1.5 p-3 rounded-lg text-xs leading-relaxed ${
                      feedback.correct 
                        ? 'bg-[#10C98A10] border border-[#10C98A30] text-[#10C98A]' 
                        : 'bg-[#EF444410] border border-[#EF444430] text-[#EF4444]'
                    }`}>
                      {feedback.message}
                    </div>
                  );
                })()}
              </div>
            )}
          </div>
        )}

        <button
          onClick={runSimulation}
          disabled={isRunning}
          className="w-full py-2.5 rounded-lg text-sm font-medium text-white bg-gradient-to-r from-[#4F8EF7] to-[#7C5CF6] hover:opacity-90 transition-opacity disabled:opacity-40"
        >
          {isRunning ? 'Simulating...' : 'Drop Both'}
        </button>
      </div>
    </div>
  );
}
