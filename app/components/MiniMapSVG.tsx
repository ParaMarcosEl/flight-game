'use client';

import React, { useMemo } from 'react';
import * as THREE from 'three';

type MiniMapSvgProps = {
  curve: THREE.Curve<THREE.Vector3>;
  playerPos: THREE.Vector3;
  botPositions: THREE.Vector3[];
  svgWidth?: number;
  svgHeight?: number;
  padding?: number;
  numSegments?: number;
  strokeColor?: string;
  strokeWidth?: number;
  backgroundColor?: string;
};

export default function MiniMapSvg({
  curve,
  playerPos,
  botPositions,
  svgWidth = 200,
  svgHeight = 200,
  padding = 20,
  numSegments = 100,
  strokeColor = 'blue',
  strokeWidth = 2,
  backgroundColor = 'transparent',
}: MiniMapSvgProps) {
  const points = useMemo(() => curve.getPoints(numSegments), [curve, numSegments]);

  const {
    pathD,
    viewBox,
    projectPoint,
  } = useMemo(() => {
    if (points.length === 0) {
      return {
        pathD: '',
        viewBox: `0 0 ${svgWidth} ${svgHeight}`,
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        projectPoint: (_: THREE.Vector3) => ({ x: 0, y: 0 }),
      };
    }

    // --- Isometric projection ---
    const isoProject = (v: THREE.Vector3) => {
      const scale = Math.sqrt(2) / 2;
      const x = (v.x - v.z) * scale;
      const y = v.y + (v.x + v.z) * scale * 0.5;
      return { x, y };
    };

    const projected = points.map(isoProject);

    let minX = Infinity, maxX = -Infinity;
    let minY = Infinity, maxY = -Infinity;
    for (const p of projected) {
      minX = Math.min(minX, p.x);
      maxX = Math.max(maxX, p.x);
      minY = Math.min(minY, p.y);
      maxY = Math.max(maxY, p.y);
    }

    const width = maxX - minX;
    const height = maxY - minY;
    const availableWidth = svgWidth - padding * 2;
    const availableHeight = svgHeight - padding * 2;
    const scaleX = availableWidth / width;
    const scaleY = availableHeight / height;
    const scale = Math.min(scaleX, scaleY);

    const translateX = padding + (availableWidth - width * scale) / 2 - minX * scale;
    const translateY = padding + (availableHeight - height * scale) / 2 - minY * scale;

    const d = projected
      .map((p, i) => {
        const x = p.x * scale + translateX;
        const y = p.y * scale + translateY;
        return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
      })
      .join(' ');

    const projectPoint = (v: THREE.Vector3) => {
      const iso = isoProject(v);
      return {
        x: iso.x * scale + translateX,
        y: iso.y * scale + translateY,
      };
    };

    return {
      pathD: d,
      viewBox: `0 0 ${svgWidth} ${svgHeight}`,
      projectPoint,
    };
  }, [points, svgWidth, svgHeight, padding]);

  const playerMarker = useMemo(() => projectPoint(playerPos), [playerPos, projectPoint]);
  const botMarkers = useMemo(() => botPositions.map(projectPoint), [botPositions, projectPoint]);

  return (
    <svg width={svgWidth} height={svgHeight} viewBox={viewBox} style={{ backgroundColor }}>
      {/* Track Path */}
      <path
        d={pathD}
        fill="none"
        stroke={strokeColor}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Player Marker */}
      <circle cx={playerMarker.x} cy={playerMarker.y} r={5} fill="lime" stroke="black" strokeWidth={1} />

      {/* Bot Markers */}
      {botMarkers.map((bot, idx) => (
        <circle
          key={idx}
          cx={bot.x}
          cy={bot.y}
          r={4}
          fill="red"
          stroke="black"
          strokeWidth={0.5}
        />
      ))}
    </svg>
  );
}
