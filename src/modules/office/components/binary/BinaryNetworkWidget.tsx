'use client'
import React from 'react'
import dynamic from 'next/dynamic'
import { fetchBinaryNetwork } from '@lib/data/netme_network'
import type { RawNodeDatum, RenderCustomNodeElementFn } from 'react-d3-tree'

// Types for the binary network node
interface BinaryNode {
  profile_id: number
  upline_profile_id: number | null
  position: number
  depth: number
  customer_id: string
  first_name: string
  last_name: string
  sponsor_id: number
  direct: number
  // ...any other fields
  name: string // always string
  attributes: Record<string, any>
  children: BinaryNode[]
}

const renderCustomNode: RenderCustomNodeElementFn = ({ nodeDatum, toggleNode }) => {
  const attributes = nodeDatum.attributes as any | undefined;
  const isVacant = !!attributes?.vacante || (attributes?.isDemo && attributes?.first_name === 'Vacante');
  const isCollapsed = (nodeDatum as any)?.__rd3t?.collapsed === true;

  return (
    <foreignObject width={180} height={70} x={-90} y={-35}>
      <div
        style={{
          width: 180,
          height: 70,
          background: isVacant ? '#e7f0fd' : '#fff',
          borderRadius: 12,
          boxShadow: isVacant ? 'none' : '0 2px 8px #0001',
          border: isVacant ? '1px solid #b6d4fe' : '1px solid #e5e7eb',
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
// Dynamically import react-d3-tree to avoid SSR issues
const Tree = dynamic(() => import('react-d3-tree').then(mod => mod.default), { ssr: false })

// Preprocess data to add Vacante nodes for missing left/right children
function addVacantNodesToData(data: any[]): any[] {
  const profileIdToChildren: Record<string, any[]> = {};
  data.forEach((node) => {
    if (!profileIdToChildren[node.upline_profile_id]) {
      profileIdToChildren[node.upline_profile_id] = [];
    }
    profileIdToChildren[node.upline_profile_id].push(node);
  });

  Object.keys(profileIdToChildren).forEach((parentId) => {
    const children = profileIdToChildren[parentId];
    // Find left and right
    const left = children.find((child) => child.position === 0);
    const right = children.find((child) => child.position === 1);
    const newChildren = [];
    if (left) {
      newChildren.push(left);
    } else {
      newChildren.push({
        isDemo: true,
        profile_id: `demo-left-${parentId}`,
        upline_profile_id: Number(parentId),
        position: 0,
        first_name: 'Vacante',
        last_name: '',
        sponsor_id: null,
        customer_id: '',
        depth: null,
        direct: null,
      });
    }
    if (right) {
      newChildren.push(right);
    } else {
      newChildren.push({
        isDemo: true,
        profile_id: `demo-right-${parentId}`,
        upline_profile_id: Number(parentId),
        position: 1,
        first_name: 'Vacante',
        last_name: '',
        sponsor_id: null,
        customer_id: '',
        depth: null,
        direct: null,
      });
    }
    profileIdToChildren[parentId] = newChildren;
  });

  // Flatten the children arrays back into a single array
  const dataWithDemos: any[] = [];
  Object.values(profileIdToChildren).forEach((children) => {
    dataWithDemos.push(...children);
  });

  return dataWithDemos;
}

interface BinaryNetworkWidgetProps {
  netmeProfileId: number
}

export default function BinaryNetworkWidget({ netmeProfileId }: BinaryNetworkWidgetProps) {
  const [data, setData] = React.useState<any[] | null>(null)
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)

  React.useEffect(() => {
    setLoading(true)
    fetchBinaryNetwork(netmeProfileId)
      .then(res => {
        const processed = addVacantNodesToData(res)
        setData(processed)
      })
      .catch(() => setError('Error fetching network'))
      .finally(() => setLoading(false))
  }, [netmeProfileId])

  if (loading) return <div>Cargando red binaria...</div>
  if (error) return <div>{error}</div>
  if (!data || !Array.isArray(data) || data.length === 0) return <div>No hay datos de red.</div>

  // Helper: Convert flat array to tree (no more addVacantNodes here)
  function buildTree(data: any[], rootId: number): RawNodeDatum | null {
    const idMap: Record<string, RawNodeDatum> = {}
    data.forEach(node => {
      idMap[node.profile_id] = {
        ...node,
        name: `${node.first_name} ${node.last_name}`.trim(),
        attributes: node,
        children: [],
      }
    })
    let root: RawNodeDatum | null = null
    data.forEach(node => {
      if (node.profile_id === rootId) {
        root = idMap[node.profile_id]
      } else if (node.upline_profile_id && idMap[node.upline_profile_id]) {
        // @ts-ignore
        idMap[node.upline_profile_id].children.push(idMap[node.profile_id])
      }
    })
    return root
  }

  const treeData = buildTree(data, netmeProfileId)
  if (!treeData) return <div>No se pudo construir el árbol.</div>

  return (
    <div style={{ width: '100%', height: '600px' }}>
      <Tree
        data={treeData}
        orientation="vertical"
        pathFunc="elbow"
        collapsible={true}
        translate={{ x: 400, y: 50 }}
        zoomable={true}
        nodeSize={{ x: 200, y: 120 }}
        separation={{ siblings: 1, nonSiblings: 2 }}
        renderCustomNodeElement={renderCustomNode}
      />
    </div>
  )
} 