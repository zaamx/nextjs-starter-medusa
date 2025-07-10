'use client'
import React, { useState, useEffect } from 'react'
import { fetchUnilevelNetwork } from '@lib/data/netme_network'
import TreeBuilder from '../TreeBuilder/TreeBuilder'

export default function UnilevelNetworkWidget({ netmeProfileId }: { netmeProfileId: number }) {
  const [treeData, setTreeData] = useState<any | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Convert flat array to tree
  function buildTree(data: any[], rootId: number): any | null {
    const idMap: Record<string, any> = {}
    data.forEach(node => {
      idMap[node.profile_id] = {
        ...node,
        name: `${node.first_name} ${node.last_name}`.trim(),
        attributes: node,
        children: [],
      }
    })
    let root: any = null
    data.forEach(node => {
      if (node.profile_id === rootId) {
        root = idMap[node.profile_id]
      } else if (node.upline_profile_id && idMap[node.upline_profile_id]) {
        idMap[node.upline_profile_id].children.push(idMap[node.profile_id])
      }
    })
    return root
  }

  useEffect(() => {
    setLoading(true)
    fetchUnilevelNetwork(netmeProfileId)
      .then(res => {
        const tree = buildTree(res, netmeProfileId)
        console.log(tree)
        setTreeData(tree)
      })
      .catch(() => setError('Error fetching network'))
      .finally(() => setLoading(false))
  }, [netmeProfileId])

  if (loading) return <div>Cargando red unilevel...</div>
  if (error) return <div>{error}</div>
  if (!treeData) return <div>No hay datos de red.</div>

  return <TreeBuilder treeData={treeData} />
} 