import React, { useState } from 'react'
import dynamic from 'next/dynamic'
import renderCustomNode from '../binary/CustomBinaryNode'

const Tree = dynamic(() => import('react-d3-tree').then(mod => mod.default), { ssr: false })

export default function TreeBuilder({ treeData }: { treeData: any }) {
  const [zoom, setZoom] = useState(1)
  const [translate, setTranslate] = useState({ x: 0, y: 0 })
  const [localTreeData, setLocalTreeData] = useState<any>(treeData)
  const containerRef = React.useRef<HTMLDivElement>(null)

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
  // Center the tree when data changes
  React.useEffect(() => {
    if (localTreeData && containerRef.current) {
      const container = containerRef.current
      const containerWidth = container.offsetWidth
      
      // Center horizontally, 20px from top vertically
      const centerX = containerWidth / 2
      const topY = 40
      
      setTranslate({ x: centerX, y: topY })
    }
  }, [localTreeData])

  // Zoom controls
  const handleZoomIn = () => setZoom(z => Math.min(z + 0.2, 2))
  const handleZoomOut = () => setZoom(z => Math.max(z - 0.2, 0.2))
  const handleCenter = () => {
    if (containerRef.current) {
      const container = containerRef.current
      const centerX = container.offsetWidth / 2
      const topY = 40
      setTranslate({ x: centerX, y: topY })
    }
  }

  // Sync localTreeData with prop changes
  React.useEffect(() => {
    setLocalTreeData(treeData)
  }, [treeData])

  if (!localTreeData) return <div>No hay datos de red.</div>

  return (
    <div 
      ref={containerRef}
      id="tree-container" 
      style={{ position: 'relative', width: '100%', height: 'calc(100vh - 63px)', minHeight: '600px' }}
    >
      {/* Controls: right side vertical stack */}
      {/* <div style={{
        position: 'fixed',
        top: '50%',
        right: 24,
        transform: 'translateY(-50%)',
        display: 'flex',
        flexDirection: 'column',
        gap: 12,
        zIndex: 10,
      }}>
                    <button onClick={handleCollapseAll} title="Contraer Todo" style={iconButtonStyle}>−</button>
            <button onClick={handleExpandAll} title="Expandir Todo" style={iconButtonStyle}>+</button>
            <button onClick={handleZoomIn} title="Acercar" style={iconButtonStyle}>🔍+</button>
            <button onClick={handleZoomOut} title="Alejar" style={iconButtonStyle}>🔍−</button>
            <button onClick={handleCenter} title="Centrar" style={iconButtonStyle}>🎯</button>
      </div> */}
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