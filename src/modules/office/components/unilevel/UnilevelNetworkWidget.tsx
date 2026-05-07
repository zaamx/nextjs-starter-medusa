'use client'
import React, { useState, useEffect, useMemo } from 'react'
import { fetchUnilevelNetwork } from '@lib/data/netme_network'
import TreeBuilder from '../TreeBuilder/TreeBuilder'

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

export default function UnilevelNetworkWidget({ netmeProfileId }: { netmeProfileId: number }) {
  const [rawData, setRawData] = useState<any[] | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    setLoading(true)
    fetchUnilevelNetwork(netmeProfileId)
      .then(res => setRawData(res.data))
      .catch(() => setError('Error al cargar la red unilevel'))
      .finally(() => setLoading(false))
  }, [netmeProfileId])

  const treeData = useMemo(() => {
    if (!rawData) return null
    return buildTree(rawData, netmeProfileId)
  }, [rawData, netmeProfileId])

  if (loading) return <div>Cargando red unilevel...</div>
  if (error)   return <div>{error}</div>
  if (!treeData) return <div>No hay datos de red.</div>

  return <TreeBuilder treeData={treeData} />
}
