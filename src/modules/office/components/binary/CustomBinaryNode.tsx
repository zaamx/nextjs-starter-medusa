import React from 'react';
import type { RawNodeDatum, RenderCustomNodeElementFn } from 'react-d3-tree';

const renderCustomNode: RenderCustomNodeElementFn = ({ nodeDatum, toggleNode }) => {
  const attributes = nodeDatum.attributes as any | undefined;
  const isVacant = !!attributes?.vacante || (attributes?.isDemo && attributes?.first_name === 'Vacante');
  const isCollapsed = (nodeDatum as any)?.__rd3t?.collapsed === true;
  const isActive = attributes?.active !== false; // Default to true if active property doesn't exist

  return (
    <foreignObject width={180} height={70} x={-90} y={-35}>
              <div
          style={{
            width: 180,
            height: 70,
            background: isVacant ? '#e7f0fd' : '#fff',
            borderRadius: 12,
            boxShadow: isVacant ? 'none' : '0 2px 8px #0001',
            border: isVacant 
              ? '2px solid #ef4444' 
              : !isActive 
                ? '2px solid #ef4444' 
                : '2px solid #22c55e',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'flex-start',
            padding: 12,
            position: 'relative',
          }}
        >
        <div
          style={{
            fontWeight: 600,
            fontSize: 15,
            color: isVacant ? '#4682c7' : '#222',
            marginBottom: 2,
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}
        >
          {isVacant ? 'Vacante' : nodeDatum.name}
        </div>
        {/* Only render info for non-vacant nodes */}
        {!isVacant && attributes && (
          <>
            <div style={{ fontSize: 12, color: '#666', marginBottom: 2 }}>
              {attributes.first_name} {attributes.last_name}
            </div>
            <div style={{ fontSize: 12, color: '#666', marginBottom: 2 }}>
              PID: {attributes.profile_id} UID: {attributes.upline_profile_id}
            </div>
            {typeof attributes.position !== 'undefined' && (
              <div style={{ fontSize: 12, color: '#888' }}>
                {attributes.position === 0 ? 'Izquierda' : 'Derecha'}
              </div>
            )}
          </>
        )}
        {/* Toggle button only for non-vacant nodes */}
        {!isVacant && toggleNode && nodeDatum.children && nodeDatum.children.length > 0 && (
          <button
            onClick={e => { e.stopPropagation(); toggleNode(); }}
            style={{
              position: 'absolute',
              top: 8,
              right: 8,
              width: 22,
              height: 22,
              borderRadius: '50%',
              border: 'none',
              background: '#e7eafc',
              color: '#4682c7',
              fontWeight: 700,
              fontSize: 16,
              cursor: 'pointer',
              boxShadow: '0 1px 3px #0001',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: 0,
            }}
            title={isCollapsed ? 'Expandir' : 'Colapsar'}
            tabIndex={-1}
          >
            {isCollapsed ? '+' : '−'}
          </button>
        )}
      </div>
    </foreignObject>
  );
};

export default renderCustomNode; 