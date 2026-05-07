import React from 'react';
import type { RenderCustomNodeElementFn } from 'react-d3-tree';

const CX = -90, CY = -35, W = 180, H = 95;
const BTN_X = CX + W - 18;  //  72
const BTN_Y = CY + 18;      // -17

// System font stack — native rendering on iOS/macOS
const FONT = "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif";

function clip(str: string, max: number) {
  return str.length > max ? str.slice(0, max - 1) + '…' : str;
}

const renderCustomNode: RenderCustomNodeElementFn = ({ nodeDatum, toggleNode }) => {
  const attrs = nodeDatum.attributes as any;
  const isVacant = !!attrs?.vacante || (attrs?.isDemo && attrs?.first_name === 'Vacante');
  const isCollapsed = (nodeDatum as any)?.__rd3t?.collapsed === true;
  const isActive = attrs?.active !== false;
  const hasChildren = (nodeDatum.children?.length ?? 0) > 0;

  const borderColor = (isVacant || !isActive) ? '#ef4444' : '#22c55e';
  const bgColor = isVacant ? '#e8f1fd' : '#ffffff';

  /*
   * .rd3t-node { stroke: #000; stroke-width: 2; fill: #777 } — react-d3-tree default.
   * CSS classes override SVG presentation attributes, so all color/stroke values
   * must use inline style (higher specificity than class rules).
   */
  return (
    <g style={{ fontFamily: FONT }}>
      {/* Card */}
      <rect
        x={CX} y={CY} width={W} height={H} rx={11} ry={11}
        style={{
          fill: bgColor,
          stroke: borderColor,
          strokeWidth: 1.5,
          filter: isVacant ? undefined : 'drop-shadow(0 2px 5px rgba(0,0,0,0.09))',
        }}
      />

      {isVacant ? (
        <text
          x={CX + W / 2} y={CY + H / 2 + 5}
          textAnchor="middle"
          fontSize={13}
          style={{ fill: '#4a82c8', stroke: 'none', fontWeight: 500 }}
        >
          Vacante
        </text>
      ) : (
        <>
          {/* PID */}
          <text x={CX + 12} y={CY + 19} fontSize={10}
            style={{ fill: '#9ca3af', stroke: 'none', fontWeight: 400 }}>
            {`PID: ${attrs?.profile_id}`}
          </text>

          {/* Name */}
          <text x={CX + 12} y={CY + 34} fontSize={12}
            style={{ fill: '#111827', stroke: 'none', fontWeight: 500 }}>
            {clip(nodeDatum.name, 20)}
          </text>

          {/* SID / UID */}
          {attrs && (
            <text x={CX + 12} y={CY + 52} fontSize={10}
              style={{ fill: '#6b7280', stroke: 'none', fontWeight: 400 }}>
              {`SID: ${attrs.sponsor_id ?? attrs.upline_profile_id}  ·  UID: ${attrs.upline_profile_id}`}
            </text>
          )}

          {/* Position */}
          {attrs && typeof attrs.position !== 'undefined' && (
            <text x={CX + 12} y={CY + 68} fontSize={10}
              style={{ fill: '#6b7280', stroke: 'none', fontWeight: 400 }}>
              {attrs.position === 0 ? '← Izquierda' : 'Derecha →'}
            </text>
          )}

          {/* Toggle button */}
          {hasChildren && (
            <g
              transform={`translate(${BTN_X}, ${BTN_Y})`}
              onClick={e => { e.stopPropagation(); toggleNode?.(); }}
              style={{ cursor: 'pointer' }}
            >
              <circle r={12}
                style={{ fill: '#eef2ff', stroke: '#c7d2fe', strokeWidth: 1 }} />
              <text
                textAnchor="middle" dominantBaseline="central" fontSize={16}
                style={{ fill: '#4f6ef7', stroke: 'none', fontWeight: 500, userSelect: 'none', pointerEvents: 'none' }}
              >
                {isCollapsed ? '+' : '−'}
              </text>
            </g>
          )}
        </>
      )}
    </g>
  );
};

export default renderCustomNode;
