'use client';

import { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import type { KnowledgeGraphState } from '@/lib/knowledgeGraph';

interface KnowledgeGraphProps {
  graphState: KnowledgeGraphState;
  onNodeClick?: (nodeId: string) => void;
  masteredPulse?: string | null;
}

const STATUS_STYLES: Record<string, { fill: string; stroke: string; opacity: number; filter: string }> = {
  undiscovered: { fill: '#2A2A3A', stroke: '#444', opacity: 0.5, filter: '' },
  discovered: { fill: '#4F8EF715', stroke: '#4F8EF7', opacity: 1, filter: 'url(#glow-blue)' },
  mastered: { fill: '#10C98A15', stroke: '#10C98A', opacity: 1, filter: 'url(#glow-green)' },
};

interface SimNode extends d3.SimulationNodeDatum {
  id: string;
  label: string;
  status: string;
  group: string;
}

interface SimLink extends d3.SimulationLinkDatum<SimNode> {
  source: SimNode | string;
  target: SimNode | string;
}

export default function KnowledgeGraph({ graphState, onNodeClick, masteredPulse }: KnowledgeGraphProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const svgContainerRef = useRef<HTMLDivElement>(null);
  const nodeGroupRef = useRef<d3.Selection<SVGGElement, SimNode, SVGGElement, unknown> | null>(null);
  const simulationRef = useRef<d3.Simulation<SimNode, SimLink> | null>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);

  // Measure the SVG container (not the whole component incl. header)
  useEffect(() => {
    const el = svgContainerRef.current;
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

  // Full D3 setup — only when dimensions change (not on every node status change)
  useEffect(() => {
    if (!svgRef.current || dimensions.width === 0 || dimensions.height === 0) return;

    if (simulationRef.current) simulationRef.current.stop();

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const { width, height } = dimensions;

    const nodes: SimNode[] = graphState.nodes.map((n) => ({
      ...n,
      x: width / 2 + (Math.random() - 0.5) * 120,
      y: height / 2 + (Math.random() - 0.5) * 120,
    }));

    const links: SimLink[] = graphState.links.map((l) => ({
      source: l.source,
      target: l.target,
    }));

    // SVG filters
    const defs = svg.append('defs');

    const makeGlow = (id: string, color: string, stdDev: string) => {
      const f = defs.append('filter').attr('id', id);
      f.append('feGaussianBlur').attr('in', 'SourceGraphic').attr('stdDeviation', stdDev).attr('result', 'blur');
      const merge = f.append('feMerge');
      merge.append('feMergeNode').attr('in', 'blur');
      merge.append('feMergeNode').attr('in', 'SourceGraphic');
    };
    makeGlow('glow-blue', '#4F8EF7', '3');
    makeGlow('glow-green', '#10C98A', '4');

    const simulation = d3
      .forceSimulation<SimNode>(nodes)
      .force(
        'link',
        d3.forceLink<SimNode, SimLink>(links).id((d) => d.id).distance(65).strength(0.5)
      )
      .force('charge', d3.forceManyBody().strength(-150))
      .force('center', d3.forceCenter(width / 2, height / 2))
      .force('collision', d3.forceCollide<SimNode>().radius(28));

    simulationRef.current = simulation;

    const link = svg
      .append('g')
      .selectAll<SVGLineElement, SimLink>('line')
      .data(links)
      .join('line')
      .attr('stroke', 'rgba(255,255,255,0.07)')
      .attr('stroke-width', 1);

    const nodeGroup = svg
      .append('g')
      .selectAll<SVGGElement, SimNode>('g')
      .data(nodes)
      .join('g')
      .attr('cursor', (d) => d.status === 'undiscovered' ? 'not-allowed' : 'pointer')
      .on('click', (_: MouseEvent, d: SimNode) => {
        if (d.status !== 'undiscovered') {
          setSelectedNodeId(d.id);
          onNodeClick?.(d.id);
        }
      });

    nodeGroupRef.current = nodeGroup;

    nodeGroup
      .append('circle')
      .attr('r', 15)
      .attr('fill', (d) => STATUS_STYLES[d.status]?.fill ?? STATUS_STYLES.undiscovered.fill)
      .attr('stroke', (d) => STATUS_STYLES[d.status]?.stroke ?? STATUS_STYLES.undiscovered.stroke)
      .attr('stroke-width', (d) => (d.status === 'undiscovered' ? 1 : 2))
      .attr('opacity', (d) => STATUS_STYLES[d.status]?.opacity ?? 0.5)
      .attr('filter', (d) => STATUS_STYLES[d.status]?.filter ?? '');

    nodeGroup
      .append('text')
      .attr('text-anchor', 'middle')
      .attr('dy', 28)
      .attr('font-size', '9px')
      .attr('font-family', 'Inter, sans-serif')
      .attr('fill', (d) =>
        d.status === 'undiscovered' ? 'rgba(242,237,230,0.3)' : 'rgba(242,237,230,0.75)'
      )
      .text((d) => d.label);

    simulation.on('tick', () => {
      link
        .attr('x1', (d) => (d.source as SimNode).x ?? 0)
        .attr('y1', (d) => (d.source as SimNode).y ?? 0)
        .attr('x2', (d) => (d.target as SimNode).x ?? 0)
        .attr('y2', (d) => (d.target as SimNode).y ?? 0);

      nodeGroup.attr('transform', (d) => {
        d.x = Math.max(20, Math.min(width - 20, d.x ?? 0));
        d.y = Math.max(20, Math.min(height - 20, d.y ?? 0));
        return `translate(${d.x},${d.y})`;
      });
    });

    return () => { simulation.stop(); };
  }, [dimensions.width, dimensions.height, graphState.links, onNodeClick]);

  // Update node appearances when statuses change — WITHOUT restarting simulation
  useEffect(() => {
    if (!nodeGroupRef.current) return;
    const statusMap = new Map(graphState.nodes.map((n) => [n.id, n.status]));

    nodeGroupRef.current
      .attr('cursor', (d: SimNode) => {
        const status = statusMap.get(d.id) ?? d.status;
        return status === 'undiscovered' ? 'not-allowed' : 'pointer';
      });

    nodeGroupRef.current
      .select('circle')
      .attr('class', (d: SimNode) => {
        const status = statusMap.get(d.id) ?? d.status;
        return status === 'mastered' ? 'mastered-pulse-circle' : '';
      })
      .attr('fill', (d: SimNode) => {
        const status = statusMap.get(d.id) ?? d.status;
        return STATUS_STYLES[status]?.fill ?? STATUS_STYLES.undiscovered.fill;
      })
      .attr('stroke', (d: SimNode) => {
        const status = statusMap.get(d.id) ?? d.status;
        return STATUS_STYLES[status]?.stroke ?? STATUS_STYLES.undiscovered.stroke;
      })
      .attr('stroke-width', (d: SimNode) => {
        const status = statusMap.get(d.id) ?? d.status;
        return status === 'undiscovered' ? 1 : status === 'mastered' ? 3.5 : 2;
      })
      .attr('opacity', (d: SimNode) => {
        const status = statusMap.get(d.id) ?? d.status;
        return STATUS_STYLES[status]?.opacity ?? 0.5;
      })
      .attr('filter', (d: SimNode) => {
        const status = statusMap.get(d.id) ?? d.status;
        return STATUS_STYLES[status]?.filter ?? '';
      });

    nodeGroupRef.current
      .select('text')
      .attr('fill', (d: SimNode) => {
        const status = statusMap.get(d.id) ?? d.status;
        return status === 'undiscovered' ? 'rgba(242,237,230,0.3)' : 'rgba(242,237,230,0.75)';
      });
  }, [graphState.nodes]);

  // Mastery burst animation
  useEffect(() => {
    if (!masteredPulse || !nodeGroupRef.current) return;
    nodeGroupRef.current
      .filter((d: SimNode) => d.id === masteredPulse)
      .select('circle')
      .transition()
      .duration(300)
      .attr('r', 22)
      .transition()
      .duration(200)
      .attr('r', 15);
  }, [masteredPulse]);

  const activeNode = selectedNodeId
    ? graphState.nodes.find((n) => n.id === selectedNodeId)
    : null;

  return (
    <div className="flex flex-col h-full relative">
      <div className="flex-shrink-0 px-4 py-3 border-b border-[rgba(255,255,255,0.06)] bg-[#14141E]">
        <h3 className="text-xs font-semibold uppercase tracking-widest text-[rgba(242,237,230,0.6)]">
          Knowledge Graph
        </h3>
      </div>

      <div ref={svgContainerRef} className="flex-1 relative overflow-hidden bg-[#0D0D14]">
        <svg
          ref={svgRef}
          width={dimensions.width || '100%'}
          height={dimensions.height || '100%'}
          className="w-full h-full"
        />

        {/* Legend */}
        <div className="absolute bottom-3 left-3 flex flex-col gap-1.5 z-0">
          {[
            { label: 'Undiscovered', fill: '#2A2A3A', stroke: '#444' },
            { label: 'Discovered', fill: '#4F8EF715', stroke: '#4F8EF7' },
            { label: 'Mastered', fill: '#10C98A15', stroke: '#10C98A' },
          ].map((item) => (
            <div key={item.label} className="flex items-center gap-1.5 text-[9px] text-[rgba(242,237,230,0.35)] font-medium">
              <span
                className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                style={{ background: item.fill, border: `1px solid ${item.stroke}` }}
              />
              {item.label}
            </div>
          ))}
        </div>

        {/* Concept Detail Drawer */}
        {activeNode && (
          <div className="absolute bottom-0 inset-x-0 bg-[#14141E]/95 border-t border-[rgba(255,255,255,0.08)] px-5 py-4 max-h-[50%] overflow-y-auto backdrop-blur-md transition-all duration-300 z-10 scrollbar-thin">
            <div className="flex justify-between items-start mb-3">
              <div>
                <h4 className="text-sm font-semibold text-[#F2EDE6]">{activeNode.label}</h4>
                <div className="flex gap-2 items-center mt-1">
                  <span className="px-1.5 py-0.5 rounded text-[8px] font-semibold uppercase bg-[#4F8EF715] text-[#4F8EF7] border border-[#4F8EF730]">
                    {activeNode.status}
                  </span>
                  <span className="text-[8px] text-[rgba(242,237,230,0.4)] uppercase">
                    {activeNode.group}
                  </span>
                </div>
              </div>
              <button
                onClick={() => setSelectedNodeId(null)}
                className="text-xs text-[rgba(242,237,230,0.4)] hover:text-[#F2EDE6] p-1 font-bold"
              >
                ✕
              </button>
            </div>
            <p className="text-xs text-[rgba(242,237,230,0.7)] leading-relaxed mb-3">
              {activeNode.description || 'No description available.'}
            </p>
            {activeNode.formula && (
              <div className="bg-[#0D0D14] border border-[rgba(255,255,255,0.06)] rounded-lg p-2.5 mb-3 text-center">
                <span className="block text-[8px] text-[rgba(242,237,230,0.3)] uppercase tracking-wider mb-1">Formula</span>
                <span className="font-mono text-xs text-[#4F8EF7]">{activeNode.formula}</span>
              </div>
            )}
            {activeNode.keyFacts && activeNode.keyFacts.length > 0 && (
              <div>
                <span className="block text-[8px] text-[rgba(242,237,230,0.3)] uppercase tracking-wider mb-1.5">Key Facts</span>
                <ul className="space-y-1">
                  {activeNode.keyFacts.map((fact, idx) => (
                    <li key={idx} className="text-[10px] text-[rgba(242,237,230,0.5)] flex gap-1.5 items-start">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#4F8EF7] mt-1.5 flex-shrink-0" />
                      {fact}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
