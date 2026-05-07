'use client'
import React, { useState, useEffect, useMemo } from 'react'
import { fetchBinaryNetwork } from '@lib/data/netme_network'
import TreeBuilder from '../TreeBuilder/TreeBuilder'

// Outside component — no closure dependency, avoids re-creation on every render
function addVacantNodesToData(data: any[]): any[] {
  const byParent: Record<string, any[]> = {}
  for (const node of data) {
    const pid = node.upline_profile_id
    if (!byParent[pid]) byParent[pid] = []
    byParent[pid].push(node)
  }

  const result: any[] = []
  for (const [parentId, children] of Object.entries(byParent)) {
    const left  = children.find(c => c.position === 0)
    const right = children.find(c => c.position === 1)
    result.push(
      left ?? {
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
        active: true,
      },
      right ?? {
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
        active: true,
      }
    )
  }
  return result
}

function buildTree(data: any[], rootId: number): any | null {
  const idMap: Record<string, any> = {}
  for (const node of data) {
    idMap[node.profile_id] = {
      ...node,
      name: `${node.first_name} ${node.last_name}`.trim(),
      attributes: node,
      children: [],
    }
  }
  let root: any = null
  for (const node of data) {
    if (node.profile_id === rootId) {
      root = idMap[node.profile_id]
    } else if (node.upline_profile_id && idMap[node.upline_profile_id]) {
      idMap[node.upline_profile_id].children.push(idMap[node.profile_id])
    }
  }
  return root
}

export default function BinaryNetworkWidget({ netmeProfileId }: { netmeProfileId: number }) {
  const [rawData, setRawData] = useState<any[] | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    setLoading(true)
    fetchBinaryNetwork(netmeProfileId)
      .then(res => setRawData(res.data))
      .catch(() => setError('Error al cargar la red binaria'))
      .finally(() => setLoading(false))
  }, [netmeProfileId])

  // Build tree only when rawData changes — not on every render
  const treeData = useMemo(() => {
    if (!rawData) return null
    const processed = addVacantNodesToData(rawData)
    return buildTree(processed, netmeProfileId)
  }, [rawData, netmeProfileId])

  if (loading) return <div>Cargando red binaria...</div>
  if (error)   return <div>{error}</div>
  if (!treeData) return <div>No hay datos de red.</div>

  return <TreeBuilder treeData={treeData} />
}
