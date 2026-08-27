import React, { useEffect, useRef, useState, useMemo } from 'react';
import * as d3 from 'd3';
import { 
  Navigation, 
  MapPin, 
  ZoomIn, 
  ZoomOut, 
  RotateCcw, 
  Play, 
  Pause, 
  Layers, 
  TrendingUp, 
  Clock, 
  ShieldCheck, 
  ChevronRight, 
  Sparkles, 
  Maximize2, 
  Minimize2,
  ExternalLink,
  Info,
  Compass,
  Bus as BusIcon
} from 'lucide-react';
import { generateRouteData, RouteStop, RouteData } from '../utils/routeCoordinates';
import { Bus } from '../types';

interface RouteMapD3Props {
  source: string;
  destination: string;
  selectedBus?: Bus | null;
  onOpenMapsGuide?: (query: string, dest?: string) => void;
  className?: string;
}

export const RouteMapD3: React.FC<RouteMapD3Props> = ({
  source,
  destination,
  selectedBus,
  onOpenMapsGuide,
  className = ''
}) => {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const elevationSvgRef = useRef<SVGSVGElement | null>(null);

  // View state
  const [activeTab, setActiveTab] = useState<'map' | 'elevation' | 'timeline'>('map');
  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  const [selectedStop, setSelectedStop] = useState<RouteStop | null>(null);
  const [hoveredStop, setHoveredStop] = useState<RouteStop | null>(null);

  // Animation simulation state
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [simProgress, setSimProgress] = useState<number>(0.15); // 0 to 1
  const [simSpeed, setSimSpeed] = useState<number>(1); // multiplier

  // Tooltip position
  const [tooltipPos, setTooltipPos] = useState<{ x: number; y: number } | null>(null);

  // Zoom reference stored for controls
  const zoomBehaviorRef = useRef<d3.ZoomBehavior<SVGSVGElement, unknown> | null>(null);

  // Generate Route Data
  const routeData: RouteData = useMemo(() => {
    return generateRouteData(source, destination);
  }, [source, destination]);

  // Set default selected stop to origin or rest stop
  useEffect(() => {
    if (routeData.stops.length > 0) {
      setSelectedStop(routeData.stops[0]);
    }
  }, [routeData]);

  // Bus animation loop along path
  useEffect(() => {
    if (!isPlaying) return;

    const interval = setInterval(() => {
      setSimProgress(prev => {
        const next = prev + 0.0025 * simSpeed;
        return next >= 1 ? 0 : next;
      });
    }, 40);

    return () => clearInterval(interval);
  }, [isPlaying, simSpeed]);

  // Main D3 SVG Rendering for Highway Route Map
  useEffect(() => {
    if (activeTab !== 'map' || !svgRef.current || !containerRef.current) return;

    const svg = d3.select(svgRef.current);
    const container = containerRef.current;
    const width = container.clientWidth || 700;
    const height = isExpanded ? 520 : 360;

    svg.attr('width', width).attr('height', height).attr('viewBox', `0 0 ${width} ${height}`);

    // Clear previous elements
    svg.selectAll('*').remove();

    const stops = routeData.stops;
    if (stops.length < 2) return;

    // Bounds & Geographic extent
    const lats = stops.map(s => s.lat);
    const lngs = stops.map(s => s.lng);

    const minLat = Math.min(...lats);
    const maxLat = Math.max(...lats);
    const minLng = Math.min(...lngs);
    const maxLng = Math.max(...lngs);

    const latPad = (maxLat - minLat) * 0.22 || 0.5;
    const lngPad = (maxLng - minLng) * 0.22 || 0.5;

    // Scales mapping lat/lng to SVG space (with latitude inverted for standard screen coordinates)
    const margin = { top: 45, right: 60, bottom: 45, left: 60 };
    const xScale = d3.scaleLinear()
      .domain([minLng - lngPad, maxLng + lngPad])
      .range([margin.left, width - margin.right]);

    const yScale = d3.scaleLinear()
      .domain([minLat - latPad, maxLat + latPad])
      .range([height - margin.bottom, margin.top]);

    // Create defs for gradients, patterns, markers, and glow filters
    const defs = svg.append('defs');

    // Route Glow Filter
    const filter = defs.append('filter')
      .attr('id', 'd3-route-glow')
      .attr('x', '-30%')
      .attr('y', '-30%')
      .attr('width', '160%')
      .attr('height', '160%');
    filter.append('feGaussianBlur')
      .attr('stdDeviation', '4')
      .attr('result', 'coloredBlur');
    const feMerge = filter.append('feMerge');
    feMerge.append('feMergeNode').attr('in', 'coloredBlur');
    feMerge.append('feMergeNode').attr('in', 'SourceGraphic');

    // Background Grid Pattern
    const pattern = defs.append('pattern')
      .attr('id', 'd3-map-grid')
      .attr('width', '32')
      .attr('height', '32')
      .attr('patternUnits', 'userSpaceOnUse');
    pattern.append('path')
      .attr('d', 'M 32 0 L 0 0 0 32')
      .attr('fill', 'none')
      .attr('stroke', 'currentColor')
      .attr('stroke-width', '0.5')
      .attr('stroke-opacity', '0.12');

    // Route Stroke Gradient (Emerald -> Teal -> Indigo)
    const routeGradient = defs.append('linearGradient')
      .attr('id', 'd3-highway-grad')
      .attr('gradientUnits', 'userSpaceOnUse')
      .attr('x1', xScale(stops[0].lng))
      .attr('y1', yScale(stops[0].lat))
      .attr('x2', xScale(stops[stops.length - 1].lng))
      .attr('y2', yScale(stops[stops.length - 1].lat));
    
    routeGradient.append('stop').attr('offset', '0%').attr('stop-color', '#10b981'); // Emerald 500
    routeGradient.append('stop').attr('offset', '50%').attr('stop-color', '#06b6d4'); // Cyan 500
    routeGradient.append('stop').attr('offset', '100%').attr('stop-color', '#6366f1'); // Indigo 500

    // Pulse animation keyframe
    defs.append('style').text(`
      @keyframes dashFlow {
        from { stroke-dashoffset: 60; }
        to { stroke-dashoffset: 0; }
      }
      .d3-animated-flow {
        animation: dashFlow 2s linear infinite;
      }
      .d3-pulse-node {
        animation: d3Pulse 2.4s ease-out infinite;
      }
      @keyframes d3Pulse {
        0% { transform: scale(0.9); opacity: 0.9; }
        50% { transform: scale(1.6); opacity: 0.2; }
        100% { transform: scale(2.2); opacity: 0; }
      }
    `);

    // Top-level Zoom Container Group
    const g = svg.append('g').attr('class', 'd3-zoom-layer');

    // Background Canvas Rect with subtle grid
    g.append('rect')
      .attr('x', -width * 2)
      .attr('y', -height * 2)
      .attr('width', width * 5)
      .attr('height', height * 5)
      .attr('fill', 'url(#d3-map-grid)')
      .attr('className', 'text-slate-400 dark:text-slate-600');

    // Projected Coordinate Points
    const points: [number, number][] = stops.map(s => [xScale(s.lng), yScale(s.lat)]);

    // D3 CatmullRom Curve Generator for smooth natural highway path
    const lineGenerator = d3.line<[number, number]>()
      .x(d => d[0])
      .y(d => d[1])
      .curve(d3.curveCatmullRom.alpha(0.5));

    const pathData = lineGenerator(points) || '';

    // 1. Wide Translucent Highway Corridor Base
    g.append('path')
      .attr('d', pathData)
      .attr('fill', 'none')
      .attr('stroke', '#10b981')
      .attr('stroke-width', '16')
      .attr('stroke-opacity', '0.12')
      .attr('stroke-linecap', 'round')
      .attr('stroke-linejoin', 'round');

    // 2. Highway Dark Asphalt Underlay
    g.append('path')
      .attr('d', pathData)
      .attr('fill', 'none')
      .attr('stroke', '#1e293b')
      .attr('stroke-width', '7')
      .attr('stroke-linecap', 'round')
      .attr('stroke-linejoin', 'round')
      .attr('stroke-opacity', '0.6');

    // 3. Primary Glowing Highway Track
    const mainPath = g.append('path')
      .attr('id', 'd3-active-bus-path')
      .attr('d', pathData)
      .attr('fill', 'none')
      .attr('stroke', 'url(#d3-highway-grad)')
      .attr('stroke-width', '4')
      .attr('stroke-linecap', 'round')
      .attr('stroke-linejoin', 'round')
      .attr('filter', 'url(#d3-route-glow)');

    // 4. Animated Dashed Transit Flow Overlay
    g.append('path')
      .attr('d', pathData)
      .attr('fill', 'none')
      .attr('stroke', '#ffffff')
      .attr('stroke-width', '2')
      .attr('stroke-dasharray', '6, 12')
      .attr('stroke-linecap', 'round')
      .attr('class', 'd3-animated-flow')
      .attr('stroke-opacity', '0.85');

    // Milestone Distance Markers along path
    stops.forEach((stop) => {
      const x = xScale(stop.lng);
      const y = yScale(stop.lat);

      if (stop.type !== 'origin' && stop.type !== 'destination' && stop.type !== 'rest_stop') {
        g.append('circle')
          .attr('cx', x)
          .attr('cy', y)
          .attr('r', 3)
          .attr('fill', '#ffffff')
          .attr('stroke', '#06b6d4')
          .attr('stroke-width', 1.5);
      }
    });

    // Interactive Stop Nodes
    stops.forEach((stop) => {
      const x = xScale(stop.lng);
      const y = yScale(stop.lat);
      const isOrigin = stop.type === 'origin';
      const isDest = stop.type === 'destination';
      const isRest = stop.type === 'rest_stop';

      const nodeGroup = g.append('g')
        .attr('class', 'd3-stop-node cursor-pointer')
        .attr('transform', `translate(${x}, ${y})`)
        .on('mouseenter', (event) => {
          setHoveredStop(stop);
          const rect = container.getBoundingClientRect();
          setTooltipPos({
            x: event.clientX - rect.left,
            y: event.clientY - rect.top
          });
        })
        .on('mousemove', (event) => {
          const rect = container.getBoundingClientRect();
          setTooltipPos({
            x: event.clientX - rect.left,
            y: event.clientY - rect.top
          });
        })
        .on('mouseleave', () => {
          setHoveredStop(null);
        })
        .on('click', () => {
          setSelectedStop(stop);
        });

      if (isOrigin) {
        // Pulsing Origin Ring
        nodeGroup.append('circle')
          .attr('r', 16)
          .attr('fill', '#10b981')
          .attr('opacity', 0.25)
          .attr('class', 'd3-pulse-node');

        nodeGroup.append('circle')
          .attr('r', 10)
          .attr('fill', '#10b981')
          .attr('stroke', '#ffffff')
          .attr('stroke-width', 2.5)
          .attr('filter', 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))');

        nodeGroup.append('text')
          .attr('text-anchor', 'middle')
          .attr('dy', '.3em')
          .attr('fill', '#ffffff')
          .attr('font-size', '9px')
          .attr('font-weight', '900')
          .text('A');

        // Origin Label
        nodeGroup.append('text')
          .attr('x', 0)
          .attr('y', -16)
          .attr('text-anchor', 'middle')
          .attr('font-size', '11px')
          .attr('font-weight', '800')
          .attr('fill', '#10b981')
          .attr('stroke', '#ffffff')
          .attr('stroke-width', 3)
          .attr('paint-order', 'stroke')
          .text(stop.city);

      } else if (isDest) {
        // Destination Pin
        nodeGroup.append('circle')
          .attr('r', 16)
          .attr('fill', '#6366f1')
          .attr('opacity', 0.25)
          .attr('class', 'd3-pulse-node');

        nodeGroup.append('circle')
          .attr('r', 10)
          .attr('fill', '#6366f1')
          .attr('stroke', '#ffffff')
          .attr('stroke-width', 2.5)
          .attr('filter', 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))');

        nodeGroup.append('text')
          .attr('text-anchor', 'middle')
          .attr('dy', '.3em')
          .attr('fill', '#ffffff')
          .attr('font-size', '9px')
          .attr('font-weight', '900')
          .text('B');

        // Dest Label
        nodeGroup.append('text')
          .attr('x', 0)
          .attr('y', -16)
          .attr('text-anchor', 'middle')
          .attr('font-size', '11px')
          .attr('font-weight', '800')
          .attr('fill', '#6366f1')
          .attr('stroke', '#ffffff')
          .attr('stroke-width', 3)
          .attr('paint-order', 'stroke')
          .text(stop.city);

      } else if (isRest) {
        // Rest Stop Oasis Marker
        nodeGroup.append('circle')
          .attr('r', 8)
          .attr('fill', '#f59e0b')
          .attr('stroke', '#ffffff')
          .attr('stroke-width', 2);

        nodeGroup.append('text')
          .attr('text-anchor', 'middle')
          .attr('dy', '.3em')
          .attr('fill', '#ffffff')
          .attr('font-size', '8px')
          .attr('font-weight', 'bold')
          .text('☕');

        nodeGroup.append('text')
          .attr('x', 0)
          .attr('y', 17)
          .attr('text-anchor', 'middle')
          .attr('font-size', '9px')
          .attr('font-weight', '700')
          .attr('fill', '#d97706')
          .attr('stroke', '#ffffff')
          .attr('stroke-width', 2)
          .attr('paint-order', 'stroke')
          .text('Rest Stop');
      } else {
        // Intermediate Waypoint / Boarding / Dropping
        nodeGroup.append('circle')
          .attr('r', 5)
          .attr('fill', '#06b6d4')
          .attr('stroke', '#ffffff')
          .attr('stroke-width', 1.5);

        nodeGroup.append('text')
          .attr('x', 0)
          .attr('y', 14)
          .attr('text-anchor', 'middle')
          .attr('font-size', '8.5px')
          .attr('font-weight', '600')
          .attr('fill', '#64748b')
          .attr('stroke', '#ffffff')
          .attr('stroke-width', 2)
          .attr('paint-order', 'stroke')
          .text(stop.name.split(' ')[0]);
      }
    });

    // 5. Dynamic Animated Bus Coach Symbol
    const pathNode = mainPath.node();
    if (pathNode) {
      const totalLen = pathNode.getTotalLength();
      const currentPoint = pathNode.getPointAtLength(simProgress * totalLen);
      const nextPoint = pathNode.getPointAtLength(Math.min(totalLen, simProgress * totalLen + 2));
      
      // Calculate angle of motion
      const angle = Math.atan2(nextPoint.y - currentPoint.y, nextPoint.x - currentPoint.x) * (180 / Math.PI);

      const busG = g.append('g')
        .attr('class', 'd3-simulated-bus')
        .attr('transform', `translate(${currentPoint.x}, ${currentPoint.y}) rotate(${angle})`);

      // Bus Glow / Shadow
      busG.append('ellipse')
        .attr('rx', 14)
        .attr('ry', 8)
        .attr('fill', '#10b981')
        .attr('opacity', 0.4)
        .attr('filter', 'url(#d3-route-glow)');

      // Bus Body Box
      busG.append('rect')
        .attr('x', -12)
        .attr('y', -7)
        .attr('width', 24)
        .attr('height', 14)
        .attr('rx', 3.5)
        .attr('fill', '#0f172a')
        .attr('stroke', '#10b981')
        .attr('stroke-width', 1.5);

      // Windshield & Coach Windows
      busG.append('rect')
        .attr('x', 4)
        .attr('y', -5)
        .attr('width', 5)
        .attr('height', 10)
        .attr('rx', 1)
        .attr('fill', '#38bdf8');

      busG.append('rect')
        .attr('x', -9)
        .attr('y', -5)
        .attr('width', 10)
        .attr('height', 10)
        .attr('rx', 1)
        .attr('fill', '#10b981');

      // Headlight Beam
      busG.append('polygon')
        .attr('points', '12,-4 26,-10 26,10 12,4')
        .attr('fill', '#fef08a')
        .attr('opacity', 0.35);
    }

    // D3 Zoom & Pan configuration
    const zoom = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.7, 4])
      .on('zoom', (event) => {
        g.attr('transform', event.transform);
      });

    svg.call(zoom);
    zoomBehaviorRef.current = zoom;

  }, [activeTab, routeData, isExpanded, simProgress]);

  // Elevation Profile D3 SVG Rendering
  useEffect(() => {
    if (activeTab !== 'elevation' || !elevationSvgRef.current || !containerRef.current) return;

    const svg = d3.select(elevationSvgRef.current);
    const container = containerRef.current;
    const width = container.clientWidth || 700;
    const height = 280;

    svg.attr('width', width).attr('height', height).attr('viewBox', `0 0 ${width} ${height}`);
    svg.selectAll('*').remove();

    const data = routeData.elevationProfile;
    if (data.length === 0) return;

    const margin = { top: 25, right: 35, bottom: 45, left: 55 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    const g = svg.append('g').attr('transform', `translate(${margin.left}, ${margin.top})`);

    const maxKm = routeData.totalDistanceKm || d3.max(data, d => d.km) || 350;
    const maxElev = (d3.max(data, d => d.elevation) || 1000) * 1.25;

    const xScale = d3.scaleLinear().domain([0, maxKm]).range([0, innerWidth]);
    const yScale = d3.scaleLinear().domain([0, maxElev]).range([innerHeight, 0]);

    // Gradient for elevation area
    const defs = svg.append('defs');
    const areaGrad = defs.append('linearGradient')
      .attr('id', 'd3-elev-gradient')
      .attr('x1', '0%').attr('y1', '0%')
      .attr('x2', '0%').attr('y2', '100%');
    areaGrad.append('stop').attr('offset', '0%').attr('stop-color', '#10b981').attr('stop-opacity', 0.45);
    areaGrad.append('stop').attr('offset', '100%').attr('stop-color', '#10b981').attr('stop-opacity', 0.02);

    // Area generator
    const area = d3.area<{ km: number; elevation: number; label: string }>()
      .x(d => xScale(d.km))
      .y0(innerHeight)
      .y1(d => yScale(d.elevation))
      .curve(d3.curveMonotoneX);

    // Line generator
    const line = d3.line<{ km: number; elevation: number; label: string }>()
      .x(d => xScale(d.km))
      .y(d => yScale(d.elevation))
      .curve(d3.curveMonotoneX);

    // Gridlines
    const yAxisGrid = d3.axisLeft(yScale).ticks(4).tickSize(-innerWidth).tickFormat(() => '');
    g.append('g')
      .attr('class', 'grid text-slate-200 dark:text-slate-800')
      .call(yAxisGrid)
      .selectAll('line')
      .attr('stroke', 'currentColor')
      .attr('stroke-dasharray', '2,3');

    // Draw area fill
    g.append('path')
      .datum(data)
      .attr('fill', 'url(#d3-elev-gradient)')
      .attr('d', area);

    // Draw elevation curve line
    g.append('path')
      .datum(data)
      .attr('fill', 'none')
      .attr('stroke', '#10b981')
      .attr('stroke-width', 2.5)
      .attr('d', line);

    // Draw dots and annotations
    data.forEach((d) => {
      const cx = xScale(d.km);
      const cy = yScale(d.elevation);

      g.append('circle')
        .attr('cx', cx)
        .attr('cy', cy)
        .attr('r', 4.5)
        .attr('fill', '#10b981')
        .attr('stroke', '#ffffff')
        .attr('stroke-width', 2);

      g.append('text')
        .attr('x', cx)
        .attr('y', cy - 10)
        .attr('text-anchor', 'middle')
        .attr('font-size', '9px')
        .attr('font-weight', '700')
        .attr('fill', '#64748b')
        .text(`${d.elevation}m`);
    });

    // Current Simulated Bus Location on Elevation Curve
    const currentKm = Math.round(simProgress * maxKm);
    const busX = xScale(currentKm);
    // Interpolate elevation at current KM
    const bisect = d3.bisector((d: any) => d.km).left;
    const idx = bisect(data, currentKm);
    let currentElev = 50;
    if (idx > 0 && idx < data.length) {
      const prev = data[idx - 1];
      const next = data[idx];
      const t = (currentKm - prev.km) / ((next.km - prev.km) || 1);
      currentElev = prev.elevation + t * (next.elevation - prev.elevation);
    } else if (idx < data.length) {
      currentElev = data[idx].elevation;
    }
    const busY = yScale(currentElev);

    // Vertical line indicator
    g.append('line')
      .attr('x1', busX)
      .attr('y1', 0)
      .attr('x2', busX)
      .attr('y2', innerHeight)
      .attr('stroke', '#06b6d4')
      .attr('stroke-width', 1.5)
      .attr('stroke-dasharray', '3,3');

    // Bus marker dot
    g.append('circle')
      .attr('cx', busX)
      .attr('cy', busY)
      .attr('r', 6)
      .attr('fill', '#06b6d4')
      .attr('stroke', '#ffffff')
      .attr('stroke-width', 2);

    // X Axis
    const xAxis = d3.axisBottom(xScale).ticks(6).tickFormat(d => `${d} km`);
    g.append('g')
      .attr('transform', `translate(0, ${innerHeight})`)
      .attr('class', 'text-slate-500 text-[10px]')
      .call(xAxis);

    // Y Axis
    const yAxis = d3.axisLeft(yScale).ticks(4).tickFormat(d => `${d} m`);
    g.append('g')
      .attr('class', 'text-slate-500 text-[10px]')
      .call(yAxis);

  }, [activeTab, routeData, simProgress]);

  // Zoom control helpers
  const handleZoomIn = () => {
    if (svgRef.current && zoomBehaviorRef.current) {
      d3.select(svgRef.current).transition().duration(300).call(zoomBehaviorRef.current.scaleBy, 1.3);
    }
  };

  const handleZoomOut = () => {
    if (svgRef.current && zoomBehaviorRef.current) {
      d3.select(svgRef.current).transition().duration(300).call(zoomBehaviorRef.current.scaleBy, 0.75);
    }
  };

  const handleResetZoom = () => {
    if (svgRef.current && zoomBehaviorRef.current) {
      d3.select(svgRef.current).transition().duration(300).call(zoomBehaviorRef.current.transform, d3.zoomIdentity);
    }
  };

  const currentCoveredKm = Math.round(simProgress * routeData.totalDistanceKm);

  return (
    <div 
      ref={containerRef}
      className={`bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden transition-all duration-300 ${className}`}
    >
      {/* Top Header & Interactive Tabs */}
      <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-50/50 dark:bg-slate-900/50">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center border border-emerald-500/20">
              <Navigation className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-black text-slate-800 dark:text-slate-100">
                  D3 Highway Route Visualization
                </h3>
                <span className="text-[10px] bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 font-bold px-2 py-0.5 rounded-full border border-emerald-300 dark:border-emerald-800">
                  {routeData.highwayCode}
                </span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                {routeData.sourceCity} <span className="text-emerald-600 font-bold">➔</span> {routeData.destCity} &bull; {routeData.totalDistanceKm} km ({routeData.estimatedDuration})
              </p>
            </div>
          </div>
        </div>

        {/* View Mode Tabs */}
        <div className="flex items-center gap-1.5 bg-slate-200/70 dark:bg-slate-800 p-1 rounded-2xl text-xs font-bold">
          <button
            onClick={() => setActiveTab('map')}
            className={`px-3 py-1.5 rounded-xl flex items-center gap-1.5 transition-all cursor-pointer ${
              activeTab === 'map'
                ? 'bg-white dark:bg-slate-700 text-emerald-600 dark:text-emerald-300 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-800'
            }`}
          >
            <Compass className="w-3.5 h-3.5" />
            <span>Highway Map</span>
          </button>

          <button
            onClick={() => setActiveTab('elevation')}
            className={`px-3 py-1.5 rounded-xl flex items-center gap-1.5 transition-all cursor-pointer ${
              activeTab === 'elevation'
                ? 'bg-white dark:bg-slate-700 text-emerald-600 dark:text-emerald-300 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-800'
            }`}
          >
            <TrendingUp className="w-3.5 h-3.5" />
            <span>Elevation Profile</span>
          </button>

          <button
            onClick={() => setActiveTab('timeline')}
            className={`px-3 py-1.5 rounded-xl flex items-center gap-1.5 transition-all cursor-pointer ${
              activeTab === 'timeline'
                ? 'bg-white dark:bg-slate-700 text-emerald-600 dark:text-emerald-300 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-800'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>Stops & Milestones</span>
          </button>
        </div>
      </div>

      {/* Main Canvas Area */}
      <div className="relative bg-slate-950 text-slate-100 overflow-hidden select-none">
        
        {/* TAB 1: D3 INTERACTIVE SVG MAP */}
        {activeTab === 'map' && (
          <div className="relative">
            <svg 
              ref={svgRef} 
              className="w-full bg-slate-950 cursor-grab active:cursor-grabbing block"
            />

            {/* D3 Map Zoom & Simulation Overlay Floating Controls */}
            <div className="absolute top-3 right-3 flex flex-col gap-1.5 z-10">
              <button
                onClick={handleZoomIn}
                title="Zoom In"
                className="w-8 h-8 rounded-xl bg-slate-900/90 text-slate-300 hover:text-white hover:bg-slate-800 border border-slate-700 flex items-center justify-center shadow-lg transition-colors cursor-pointer"
              >
                <ZoomIn className="w-4 h-4" />
              </button>
              <button
                onClick={handleZoomOut}
                title="Zoom Out"
                className="w-8 h-8 rounded-xl bg-slate-900/90 text-slate-300 hover:text-white hover:bg-slate-800 border border-slate-700 flex items-center justify-center shadow-lg transition-colors cursor-pointer"
              >
                <ZoomOut className="w-4 h-4" />
              </button>
              <button
                onClick={handleResetZoom}
                title="Reset View"
                className="w-8 h-8 rounded-xl bg-slate-900/90 text-slate-300 hover:text-white hover:bg-slate-800 border border-slate-700 flex items-center justify-center shadow-lg transition-colors cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                title={isExpanded ? 'Collapse' : 'Expand Map'}
                className="w-8 h-8 rounded-xl bg-slate-900/90 text-slate-300 hover:text-white hover:bg-slate-800 border border-slate-700 flex items-center justify-center shadow-lg transition-colors cursor-pointer"
              >
                {isExpanded ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
              </button>
            </div>

            {/* Simulation Progress Floating Pill */}
            <div className="absolute bottom-3 left-3 right-3 sm:right-auto bg-slate-900/90 backdrop-blur-md border border-slate-700/80 p-2.5 rounded-2xl flex items-center gap-3 shadow-xl z-10 text-xs">
              <button
                onClick={() => setIsPlaying(!isPlaying)}
                className="w-7 h-7 rounded-xl bg-emerald-500 text-slate-950 font-bold flex items-center justify-center hover:bg-emerald-400 transition-colors cursor-pointer"
              >
                {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 ml-0.5" />}
              </button>

              <div className="flex-1 min-w-[140px]">
                <div className="flex justify-between text-[10px] font-bold text-slate-300 mb-1">
                  <span className="flex items-center gap-1 text-emerald-400">
                    <BusIcon className="w-3 h-3" /> Transit Sim
                  </span>
                  <span>{currentCoveredKm} / {routeData.totalDistanceKm} km</span>
                </div>
                <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-emerald-500 via-teal-400 to-indigo-500 transition-all duration-75"
                    style={{ width: `${Math.round(simProgress * 100)}%` }}
                  />
                </div>
              </div>

              <div className="flex items-center gap-1 pl-2 border-l border-slate-700">
                <button
                  onClick={() => setSimSpeed(s => s === 1 ? 2 : s === 2 ? 4 : 1)}
                  className="px-2 py-0.5 rounded-md bg-slate-800 text-[10px] font-extrabold text-slate-300 hover:text-white border border-slate-700"
                >
                  {simSpeed}x
                </button>
              </div>
            </div>

            {/* Stop Hover Tooltip */}
            {hoveredStop && tooltipPos && (
              <div 
                className="absolute z-20 pointer-events-none bg-slate-900/95 text-white border border-slate-700 rounded-xl p-2.5 shadow-2xl text-xs -translate-x-1/2 -translate-y-full -mt-3 max-w-[200px]"
                style={{ left: tooltipPos.x, top: tooltipPos.y }}
              >
                <p className="font-extrabold text-emerald-400 truncate">{hoveredStop.name}</p>
                <p className="text-[10px] text-slate-300 mt-0.5">{hoveredStop.description}</p>
                <div className="flex items-center justify-between text-[10px] text-slate-400 mt-1 pt-1 border-t border-slate-800">
                  <span>KM {hoveredStop.distanceKm}</span>
                  <span>{hoveredStop.elevationMeters}m elev.</span>
                </div>
              </div>
            )}

          </div>
        )}

        {/* TAB 2: D3 ELEVATION & TERRAIN PROFILE CHART */}
        {activeTab === 'elevation' && (
          <div className="p-4 bg-slate-950">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-extrabold text-slate-300 flex items-center gap-1.5">
                <TrendingUp className="w-4 h-4 text-emerald-400" />
                Highway Elevation & Terrain Profile (Altimetry Curve)
              </span>
              <span className="text-[10px] text-slate-400">
                Peak: {Math.max(...routeData.elevationProfile.map(e => e.elevation))}m &bull; Current at KM {currentCoveredKm}
              </span>
            </div>
            <svg ref={elevationSvgRef} className="w-full block" />
            <div className="mt-2 text-center text-[10px] text-slate-400">
              *Real-time topographic elevations generated along the interstate highway corridor
            </div>
          </div>
        )}

        {/* TAB 3: TIMELINE OF STOPS & WAYPOINTS */}
        {activeTab === 'timeline' && (
          <div className="p-5 max-h-[360px] overflow-y-auto space-y-3 bg-slate-950">
            {routeData.stops.map((stop, idx) => {
              const isOrigin = stop.type === 'origin';
              const isDest = stop.type === 'destination';
              const isRest = stop.type === 'rest_stop';

              return (
                <div 
                  key={stop.id}
                  onClick={() => setSelectedStop(stop)}
                  className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-start justify-between gap-3 ${
                    selectedStop?.id === stop.id
                      ? 'bg-slate-900 border-emerald-500/80 shadow-md shadow-emerald-500/10'
                      : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-start gap-2.5">
                    <div className={`w-7 h-7 rounded-xl flex items-center justify-center font-black text-xs flex-shrink-0 mt-0.5 ${
                      isOrigin 
                        ? 'bg-emerald-500 text-slate-950' 
                        : isDest 
                          ? 'bg-indigo-500 text-white' 
                          : isRest 
                            ? 'bg-amber-500 text-slate-950' 
                            : 'bg-slate-800 text-slate-300'
                    }`}>
                      {isOrigin ? 'A' : isDest ? 'B' : isRest ? '☕' : idx}
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-xs font-extrabold text-slate-100">{stop.name}</h4>
                        <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded-md uppercase ${
                          isOrigin ? 'bg-emerald-950 text-emerald-400' :
                          isDest ? 'bg-indigo-950 text-indigo-400' :
                          isRest ? 'bg-amber-950 text-amber-400' :
                          'bg-slate-800 text-slate-400'
                        }`}>
                          {stop.type.replace('_', ' ')}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 mt-0.5">{stop.description}</p>
                      
                      {stop.amenities && (
                        <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
                          {stop.amenities.map(a => (
                            <span key={a} className="text-[9px] bg-slate-800 text-slate-300 px-1.5 py-0.5 rounded">
                              {a}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="text-right flex-shrink-0">
                    <p className="text-xs font-black text-emerald-400">KM {stop.distanceKm}</p>
                    <p className="text-[10px] text-slate-500">+{stop.timeOffsetMinutes} min</p>
                  </div>
                </div>
              );
            })}
          </div>
        )}

      </div>

      {/* Selected Stop Details Footer Banner & Maps Grounding Action */}
      {selectedStop && (
        <div className="p-4 bg-slate-50 dark:bg-slate-900/80 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center flex-shrink-0">
              <MapPin className="w-4 h-4" />
            </div>
            <div>
              <p className="font-extrabold text-slate-800 dark:text-slate-100">
                Selected Terminal: <span className="text-emerald-600 dark:text-emerald-400">{selectedStop.name}</span>
              </p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Distance: {selectedStop.distanceKm} km &bull; Elevation: {selectedStop.elevationMeters}m ASL &bull; Road: {routeData.roadType}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {onOpenMapsGuide && (
              <button
                onClick={() => onOpenMapsGuide(selectedStop.name, destination)}
                className="px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 transition-colors shadow-sm shadow-emerald-600/20 cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Explore in Maps</span>
                <ExternalLink className="w-3 h-3" />
              </button>
            )}
          </div>
        </div>
      )}

      {/* Route Quick Stats Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 p-3 bg-slate-100/60 dark:bg-slate-950/60 border-t border-slate-200 dark:border-slate-800 text-[11px]">
        <div className="p-2 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
          <span className="text-slate-400 text-[10px] uppercase font-bold block">Total Distance</span>
          <span className="font-black text-slate-800 dark:text-slate-100">{routeData.totalDistanceKm} km</span>
        </div>
        <div className="p-2 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
          <span className="text-slate-400 text-[10px] uppercase font-bold block">Estimated Travel</span>
          <span className="font-black text-slate-800 dark:text-slate-100">{routeData.estimatedDuration}</span>
        </div>
        <div className="p-2 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
          <span className="text-slate-400 text-[10px] uppercase font-bold block">Tolls & Checkpoints</span>
          <span className="font-black text-slate-800 dark:text-slate-100">{routeData.tollCount} Express Plazas</span>
        </div>
        <div className="p-2 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
          <span className="text-slate-400 text-[10px] uppercase font-bold block">Corridor Safety</span>
          <span className="font-black text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5" /> {routeData.safetyScore} / 5.0
          </span>
        </div>
      </div>

    </div>
  );
};
