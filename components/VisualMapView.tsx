'use client';

import { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import type { KGNode, KnowledgeGraphState } from '@/lib/knowledgeGraph';

interface VisualMapViewProps {
  graphState: KnowledgeGraphState;
  subjectLabel: string;
}

const GROUP_COLORS: Record<string, string> = {
  mechanics: '#4F8EFF',
  fields: '#9B72FF',
  kinematics: '#FF8C42',
  waves: '#EC4899',
  fundamentals: '#4F8EFF',
  reactions: '#FF8C42',
  atomic: '#9B72FF',
  solutions: '#00C896',
  energy: '#F0C040',
  cell: '#00C896',
  molecular: '#9B72FF',
  macro: '#FF8C42',
  theory: '#4F8EFF',
  systems: '#00C896',
  method: '#F0C040',
  electrical: '#FF8C42',
};

const STATUS_COLORS: Record<string, { fill: string; stroke: string; text: string }> = {
  undiscovered: { fill: '#2A2A3A', stroke: '#444', text: 'rgba(242,237,230,0.3)' },
  discovered: { fill: 'rgba(79,142,255,0.12)', stroke: '#4F8EFF', text: 'rgba(242,237,230,0.85)' },
  mastered: { fill: 'rgba(0,200,150,0.15)', stroke: '#00C896', text: '#00C896' },
};

interface SimNode extends d3.SimulationNodeDatum {
  id: string;
  label: string;
  status: string;
  group: string;
  description?: string;
  keyFacts?: string[];
  formula?: string;
}

interface SimLink extends d3.SimulationLinkDatum<SimNode> {
  source: SimNode | string;
  target: SimNode | string;
}

export default function VisualMapView({ graphState, subjectLabel }: VisualMapViewProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const [selectedNode, setSelectedNode] = useState<KGNode | null>(null);
  const simulationRef = useRef<d3.Simulation<SimNode, SimLink> | null>(null);

  // Measure container
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const observer = new ResizeObserver((entries) => {
      const rect = entries[0].contentRect;
      if (rect.width > 0 && rect.height > 0) {
        setDimensions({ width: rect.width, height: rect.height });
      }
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // D3 force graph
  useEffect(() => {
    if (!svgRef.current || dimensions.width === 0 || dimensions.height === 0) return;

    if (simulationRef.current) simulationRef.current.stop();

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const { width, height } = dimensions;

    const nodes: SimNode[] = graphState.nodes.map((n) => ({
      ...n,
      x: width / 2 + (Math.random() - 0.5) * 200,
      y: height / 2 + (Math.random() - 0.5) * 200,
    }));

    const links: SimLink[] = graphState.links.map((l) => ({
      source: l.source,
      target: l.target,
    }));

    // Filters
    const defs = svg.append('defs');
    const makeGlow = (id: string, stdDev: string) => {
      const f = defs.append('filter').attr('id', id).attr('x', '-50%').attr('y', '-50%').attr('width', '200%').attr('height', '200%');
      f.append('feGaussianBlur').attr('in', 'SourceGraphic').attr('stdDeviation', stdDev).attr('result', 'blur');
      const merge = f.append('feMerge');
      merge.append('feMergeNode').attr('in', 'blur');
      merge.append('feMergeNode').attr('in', 'SourceGraphic');
    };
    makeGlow('glow-discovered', '4');
    makeGlow('glow-mastered', '6');

    const simulation = d3
      .forceSimulation<SimNode>(nodes)
      .force('link', d3.forceLink<SimNode, SimLink>(links).id((d) => d.id).distance(100).strength(0.4))
      .force('charge', d3.forceManyBody().strength(-250))
      .force('center', d3.forceCenter(width / 2, height / 2))
      .force('collision', d3.forceCollide<SimNode>().radius(45));

    simulationRef.current = simulation;

    // Links
    const link = svg
      .append('g')
      .selectAll<SVGLineElement, SimLink>('line')
      .data(links)
      .join('line')
      .attr('stroke', 'rgba(255,255,255,0.06)')
      .attr('stroke-width', 1.5)
      .attr('stroke-dasharray', '4,4');

    // Node groups
    const nodeGroup = svg
      .append('g')
      .selectAll<SVGGElement, SimNode>('g')
      .data(nodes)
      .join('g')
      .attr('cursor', 'pointer')
      .on('click', (_: MouseEvent, d: SimNode) => {
        const fullNode = graphState.nodes.find((n) => n.id === d.id);
        setSelectedNode(fullNode || null);
      });

    // Outer ring for group color
    nodeGroup
      .append('circle')
      .attr('r', 28)
      .attr('fill', 'transparent')
      .attr('stroke', (d) => GROUP_COLORS[d.group] || '#4F8EFF')
      .attr('stroke-width', (d) => d.status === 'undiscovered' ? 0.5 : 2)
      .attr('stroke-dasharray', (d) => d.status === 'undiscovered' ? '3,3' : 'none')
      .attr('opacity', (d) => d.status === 'undiscovered' ? 0.3 : 0.8);

    // Inner circle
    nodeGroup
      .append('circle')
      .attr('r', 22)
      .attr('fill', (d) => STATUS_COLORS[d.status]?.fill ?? STATUS_COLORS.undiscovered.fill)
      .attr('stroke', (d) => STATUS_COLORS[d.status]?.stroke ?? STATUS_COLORS.undiscovered.stroke)
      .attr('stroke-width', (d) => d.status === 'undiscovered' ? 1 : 2)
      .attr('filter', (d) => d.status === 'mastered' ? 'url(#glow-mastered)' : d.status === 'discovered' ? 'url(#glow-discovered)' : '');

    // Labels
    nodeGroup
      .append('text')
      .attr('text-anchor', 'middle')
      .attr('dy', 40)
      .attr('font-size', '11px')
      .attr('font-weight', (d) => d.status === 'undiscovered' ? '400' : '600')
      .attr('font-family', 'Inter, sans-serif')
      .attr('fill', (d) => STATUS_COLORS[d.status]?.text ?? STATUS_COLORS.undiscovered.text)
      .text((d) => d.label);

    // Status icon inside node
    nodeGroup
      .append('text')
      .attr('text-anchor', 'middle')
      .attr('dy', 5)
      .attr('font-size', '14px')
      .text((d) => d.status === 'mastered' ? '✓' : d.status === 'discovered' ? '◉' : '?')
      .attr('fill', (d) => d.status === 'mastered' ? '#00C896' : d.status === 'discovered' ? '#4F8EFF' : 'rgba(255,255,255,0.2)');

    // Tick
    simulation.on('tick', () => {
      link
        .attr('x1', (d) => (d.source as SimNode).x ?? 0)
        .attr('y1', (d) => (d.source as SimNode).y ?? 0)
        .attr('x2', (d) => (d.target as SimNode).x ?? 0)
        .attr('y2', (d) => (d.target as SimNode).y ?? 0);

      nodeGroup.attr('transform', (d) => {
        d.x = Math.max(40, Math.min(width - 40, d.x ?? 0));
        d.y = Math.max(40, Math.min(height - 40, d.y ?? 0));
        return `translate(${d.x},${d.y})`;
      });

      // Update link styles based on connected node statuses
      link
        .attr('stroke', (d) => {
          const s = (d.source as SimNode).status;
          const t = (d.target as SimNode).status;
          if (s === 'mastered' || t === 'mastered') return 'rgba(0,200,150,0.3)';
          if (s === 'discovered' || t === 'discovered') return 'rgba(79,142,255,0.2)';
          return 'rgba(255,255,255,0.06)';
        })
        .attr('stroke-dasharray', (d) => {
          const s = (d.source as SimNode).status;
          const t = (d.target as SimNode).status;
          if (s !== 'undiscovered' || t !== 'undiscovered') return 'none';
          return '4,4';
        });
    });

    // Drag behavior
    const drag = d3.drag<SVGGElement, SimNode>()
      .on('start', (event: d3.D3DragEvent<SVGGElement, SimNode, SimNode>) => {
        if (!event.active) simulation.alphaTarget(0.3).restart();
        event.subject.fx = event.subject.x;
        event.subject.fy = event.subject.y;
      })
      .on('drag', (event: d3.D3DragEvent<SVGGElement, SimNode, SimNode>) => {
        event.subject.fx = event.x;
        event.subject.fy = event.y;
      })
      .on('end', (event: d3.D3DragEvent<SVGGElement, SimNode, SimNode>) => {
        if (!event.active) simulation.alphaTarget(0);
        event.subject.fx = null;
        event.subject.fy = null;
      });

    nodeGroup.call(drag);

    return () => { simulation.stop(); };
  }, [dimensions.width, dimensions.height, graphState]);

  const discoveredCount = graphState.nodes.filter((n) => n.status !== 'undiscovered').length;
  const masteredCount = graphState.nodes.filter((n) => n.status === 'mastered').length;

  return (
    <div className="flex h-full">
      {/* Main graph area */}
      <div ref={containerRef} className="flex-1 relative bg-[#0D0D14]">
        {/* Header overlay */}
        <div className="absolute top-4 left-4 z-10">
          <h2 className="text-sm font-semibold text-[#F2EDE6]">{subjectLabel}</h2>
          <p className="text-[10px] text-[rgba(242,237,230,0.35)] mt-0.5">
            Click any concept to explore · Drag to rearrange
          </p>
        </div>

        {/* Stats overlay */}
        <div className="absolute top-4 right-4 z-10 flex gap-3">
          <div className="px-3 py-1.5 rounded-lg bg-[#14141E]/80 backdrop-blur border border-[rgba(255,255,255,0.06)] text-[10px]">
            <span className="text-[rgba(242,237,230,0.4)]">Discovered </span>
            <span className="text-[#4F8EFF] font-mono font-semibold">{discoveredCount}</span>
            <span className="text-[rgba(242,237,230,0.2)]"> / {graphState.nodes.length}</span>
          </div>
          <div className="px-3 py-1.5 rounded-lg bg-[#14141E]/80 backdrop-blur border border-[rgba(255,255,255,0.06)] text-[10px]">
            <span className="text-[rgba(242,237,230,0.4)]">Mastered </span>
            <span className="text-[#00C896] font-mono font-semibold">{masteredCount}</span>
          </div>
        </div>

        {/* Legend */}
        <div className="absolute bottom-4 left-4 z-10 flex gap-4">
          {[
            { label: 'Undiscovered', color: '#444' },
            { label: 'Discovered', color: '#4F8EFF' },
            { label: 'Mastered', color: '#00C896' },
          ].map((item) => (
            <div key={item.label} className="flex items-center gap-1.5 text-[9px] text-[rgba(242,237,230,0.35)]">
              <span className="w-2.5 h-2.5 rounded-full" style={{ background: item.color, opacity: item.color === '#444' ? 0.5 : 1 }} />
              {item.label}
            </div>
          ))}
        </div>

        <svg
          ref={svgRef}
          width={dimensions.width || '100%'}
          height={dimensions.height || '100%'}
          className="w-full h-full"
        />
      </div>

      {/* Detail panel — slides in when a node is selected */}
      <div
        className={`flex-shrink-0 border-l border-[rgba(255,255,255,0.06)] bg-[#14141E] transition-all duration-300 overflow-hidden ${
          selectedNode ? 'w-[380px]' : 'w-0'
        }`}
      >
        {selectedNode && (
          <div className="w-[380px] h-full flex flex-col">
            {/* Detail header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-[rgba(255,255,255,0.06)]">
              <div>
                <h3 className="text-base font-semibold text-[#F2EDE6]">{selectedNode.label}</h3>
                <div className="flex items-center gap-2 mt-1">
                  <span
                    className="px-2 py-0.5 rounded-full text-[9px] font-semibold uppercase tracking-wider"
                    style={{
                      backgroundColor: STATUS_COLORS[selectedNode.status]?.fill,
                      color: STATUS_COLORS[selectedNode.status]?.stroke,
                      border: `1px solid ${STATUS_COLORS[selectedNode.status]?.stroke}30`,
                    }}
                  >
                    {selectedNode.status}
                  </span>
                  <span
                    className="px-2 py-0.5 rounded-full text-[9px] uppercase tracking-wider"
                    style={{ color: GROUP_COLORS[selectedNode.group] || '#4F8EFF', opacity: 0.7 }}
                  >
                    {selectedNode.group}
                  </span>
                </div>
              </div>
              <button
                onClick={() => setSelectedNode(null)}
                className="w-7 h-7 rounded-lg flex items-center justify-center text-[rgba(242,237,230,0.4)] hover:text-[#F2EDE6] hover:bg-[rgba(255,255,255,0.06)] transition-colors"
              >
                ✕
              </button>
            </div>

            {/* Detail body */}
            <div className="flex-1 overflow-y-auto px-5 py-5 space-y-5 scrollbar-thin">
              {/* Description */}
              {selectedNode.description && (
                <div>
                  <p className="text-sm text-[rgba(242,237,230,0.7)] leading-relaxed">
                    {selectedNode.description}
                  </p>
                </div>
              )}

              {/* Formula */}
              {selectedNode.formula && (
                <div className="p-4 rounded-xl bg-[#0D0D14] border border-[rgba(255,255,255,0.08)]">
                  <p className="text-[10px] text-[rgba(242,237,230,0.3)] uppercase tracking-wider mb-2">Formula</p>
                  <p className="text-lg font-mono text-[#4F8EFF] font-medium text-center">
                    {selectedNode.formula}
                  </p>
                </div>
              )}

              {/* Key Facts */}
              {selectedNode.keyFacts && selectedNode.keyFacts.length > 0 && (
                <div>
                  <p className="text-[10px] text-[rgba(242,237,230,0.3)] uppercase tracking-wider mb-3">Key Facts</p>
                  <div className="space-y-2">
                    {selectedNode.keyFacts.map((fact, i) => (
                      <div key={i} className="flex gap-2.5 items-start">
                        <span className="flex-shrink-0 w-1.5 h-1.5 rounded-full mt-1.5" style={{ backgroundColor: GROUP_COLORS[selectedNode.group] || '#4F8EFF' }} />
                        <p className="text-xs text-[rgba(242,237,230,0.55)] leading-relaxed">{fact}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Connected concepts */}
              <div>
                <p className="text-[10px] text-[rgba(242,237,230,0.3)] uppercase tracking-wider mb-3">Connected Concepts</p>
                <div className="flex flex-wrap gap-2">
                  {graphState.links
                    .filter((l) => l.source === selectedNode.id || l.target === selectedNode.id)
                    .map((l) => {
                      const connectedId = l.source === selectedNode.id ? l.target : l.source;
                      const connectedNode = graphState.nodes.find((n) => n.id === connectedId);
                      if (!connectedNode) return null;
                      return (
                        <button
                          key={connectedId}
                          onClick={() => setSelectedNode(connectedNode)}
                          className="px-3 py-1.5 rounded-lg text-[10px] font-medium border transition-colors hover:border-[rgba(255,255,255,0.2)]"
                          style={{
                            color: STATUS_COLORS[connectedNode.status]?.text,
                            borderColor: `${STATUS_COLORS[connectedNode.status]?.stroke}30`,
                            backgroundColor: STATUS_COLORS[connectedNode.status]?.fill,
                          }}
                        >
                          {connectedNode.label}
                        </button>
                      );
                    })}
                </div>
              </div>

              {/* Placeholder for undiscovered */}
              {selectedNode.status === 'undiscovered' && !selectedNode.description && (
                <div className="text-center py-8">
                  <p className="text-2xl mb-3">🔒</p>
                  <p className="text-sm text-[rgba(242,237,230,0.4)]">This concept hasn&apos;t been discovered yet.</p>
                  <p className="text-xs text-[rgba(242,237,230,0.25)] mt-1">Explore connected concepts to unlock it.</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
