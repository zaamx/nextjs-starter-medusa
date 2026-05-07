'use client'
import React, { useState, useRef, useCallback, useLayoutEffect, useEffect } from 'react'
import dynamic from 'next/dynamic'
import renderCustomNode from '../binary/CustomBinaryNode'

const Tree = dynamic(() => import('react-d3-tree').then(mod => mod.default), { ssr: false })

// Top padding for root node: card starts at CY=-35 above anchor, so topY >= |CY| + padding
const TOP_Y = 60

export default function TreeBuilder({ treeData }: { treeData: any }) {
  const [zoom, setZoom] = useState(1)
  const [translate, setTranslate] = useState({ x: 0, y: TOP_Y })
  const [localTreeData, setLocalTreeData] = useState<any>(treeData)
  const [initialDepth, setInitialDepth] = useState<number | undefined>(0)
  // Incrementing key forces Tree remount — the only reliable way to reset
  // D3's internal zoom/pan state or re-apply initialDepth
  const [treeKey, setTreeKey] = useState(0)
  const containerRef = useRef<HTMLDivElement>(null)

  const centerTree = useCallback(() => {
    const el = containerRef.current
    if (!el) return
    const w = el.offsetWidth
    if (w > 0) setTranslate({ x: w / 2, y: TOP_Y })
  }, [])

  // Calculate position before first paint + on resize (orientation changes)
  useLayoutEffect(() => {
    centerTree()
    const el = containerRef.current
    if (!el) return
    const ro = new ResizeObserver(centerTree)
    ro.observe(el)
    return () => ro.disconnect()
  }, [centerTree])

  // Sync when parent provides new data
  useEffect(() => {
    setLocalTreeData(treeData)
  }, [treeData])

  const handleCollapseAll = () => {
    setInitialDepth(0)
    setTreeKey(k => k + 1)
  }

  const handleExpandAll = () => {
    setInitialDepth(undefined) // undefined = all nodes visible
    setTreeKey(k => k + 1)
  }

  const handleZoomIn  = () => setZoom(z => Math.min(z + 0.2, 3))
  const handleZoomOut = () => setZoom(z => Math.max(z - 0.2, 0.1))

  const handleCenter = () => {
    centerTree()
    setZoom(1)
  }

  if (!localTreeData) return <div>No hay datos de red.</div>

  return (
    <div
      ref={containerRef}
      style={{ position: 'relative', width: '100%', height: 'calc(100svh - 63px)', minHeight: '400px' }}
    >
      {/* Zoom / nav controls — bottom-right, 44px touch targets */}
      <div style={{
        position: 'absolute', bottom: 20, right: 16,
        display: 'flex', flexDirection: 'column', gap: 8, zIndex: 10,
      }}>
        <button onClick={handleExpandAll}   title="Expandir todo"  style={btnStyle}>⊕</button>
        <button onClick={handleCollapseAll} title="Contraer todo"  style={btnStyle}>⊖</button>
        <button onClick={handleZoomIn}      title="Acercar"        style={btnStyle}>+</button>
        <button onClick={handleZoomOut}     title="Alejar"         style={btnStyle}>−</button>
        <button onClick={handleCenter}      title="Centrar"        style={btnStyle}>◎</button>
      </div>

      <div style={{ width: '100%', height: '100%', background: 'linear-gradient(120deg, #e7eafc 0%, #dbeafe 100%)' }}>
        <Tree
          key={treeKey}
          data={localTreeData}
          orientation="vertical"
          pathFunc="elbow"
          collapsible
          translate={translate}
          zoom={zoom}
          nodeSize={{ x: 200, y: 130 }}
          separation={{ siblings: 1, nonSiblings: 2 }}
          renderCustomNodeElement={renderCustomNode}
          initialDepth={initialDepth}
          enableLegacyTransitions={false}
        />
      </div>
    </div>
  )
}

const btnStyle: React.CSSProperties = {
  width: 44, height: 44,
  borderRadius: '50%',
  border: 'none',
  background: '#fff',
  boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
  fontSize: 20,
  color: '#4682c7',
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  WebkitTapHighlightColor: 'transparent',
}
