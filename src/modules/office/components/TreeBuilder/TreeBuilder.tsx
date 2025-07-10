import React, { useState } from 'react'
import dynamic from 'next/dynamic'
import renderCustomNode from '../binary/CustomBinaryNode'

const Tree = dynamic(() => import('react-d3-tree').then(mod => mod.default), { ssr: false })

export default function TreeBuilder({ treeData }: { treeData: any }) {
  const [zoom, setZoom] = useState(1)
  const [translate, setTranslate] = useState({ x: 400, y: 50 })
  const [localTreeData, setLocalTreeData] = useState<any>(treeData)

  // Collapse/expand helpers
  function setAllCollapsed(node: any, collapsed: boolean) {
    if (!node) return
    node.__rd3t = { ...node.__rd3t, collapsed }
    if (node.children && node.children.length > 0) {
      node.children.forEach((child: any) => setAllCollapsed(child, collapsed))
    }
  }

  // Collapse all nodes 
  const handleCollapseAll = () => {
    if (localTreeData) {
      const newTree = JSON.parse(JSON.stringify(localTreeData))
      setAllCollapsed(newTree, true)
      setLocalTreeData(newTree)
    }
  }
  // Expand all nodes
  const handleExpandAll = () => {
    if (localTreeData) {
      const newTree = JSON.parse(JSON.stringify(localTreeData))
      setAllCollapsed(newTree, false)
      setLocalTreeData(newTree)
    }
  }
  // Zoom controls
  const handleZoomIn = () => setZoom(z => Math.min(z + 0.2, 2))
  const handleZoomOut = () => setZoom(z => Math.max(z - 0.2, 0.2))
  const handleCenter = () => setTranslate({ x: 400, y: 50 })

  // Sync localTreeData with prop changes
  React.useEffect(() => {
    setLocalTreeData(treeData)
  }, [treeData])

  if (!localTreeData) return <div>No hay datos de red.</div>

  return (
    <div style={{ position: 'relative', width: '100%', height: '600px' }}>
      {/* Controls: right side vertical stack */}
      <div style={{
        position: 'fixed',
        top: '50%',
        right: 24,
        transform: 'translateY(-50%)',
        display: 'flex',
        flexDirection: 'column',
        gap: 12,
        zIndex: 10,
      }}>
        <button onClick={handleCollapseAll} title="Collapse All" style={iconButtonStyle}>−</button>
        <button onClick={handleExpandAll} title="Expand All" style={iconButtonStyle}>+</button>
        <button onClick={handleZoomIn} title="Zoom In" style={iconButtonStyle}>🔍+</button>
        <button onClick={handleZoomOut} title="Zoom Out" style={iconButtonStyle}>🔍−</button>
        <button onClick={handleCenter} title="Center" style={iconButtonStyle}>🎯</button>
      </div>
      {/* Main Tree */}
      <div style={{ width: '100%', height: '100%', background: 'linear-gradient(120deg, #e7eafc 0%, #dbeafe 100%)' }}>
        <Tree
          data={localTreeData}
          orientation="vertical"
          pathFunc="elbow"
          collapsible={true}
          translate={translate}
          zoom={zoom}
          nodeSize={{ x: 200, y: 120 }}
          separation={{ siblings: 1, nonSiblings: 2 }}
          renderCustomNodeElement={renderCustomNode}
          initialDepth={0} // All nodes collapsed by default
        />
      </div>
    </div>
  )
}

// Simple icon button style
const iconButtonStyle: React.CSSProperties = {
  width: 40,
  height: 40,
  borderRadius: '50%',
  border: 'none',
  background: '#fff',
  boxShadow: '0 2px 8px #0001',
  fontSize: 20,
  color: '#4682c7',
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  transition: 'background 0.2s',
}; 