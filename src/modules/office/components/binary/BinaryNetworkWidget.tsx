'use client'
import React, { useState, useEffect } from 'react'
import { fetchBinaryNetwork } from '@lib/data/netme_network'
import TreeBuilder from '../TreeBuilder/TreeBuilder'

export default function UnilevelNetworkWidget({ netmeProfileId }: { netmeProfileId: number }) {
  const [treeData, setTreeData] = useState<any | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

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
          active: true, // Default active for demo nodes
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
          active: true, // Default active for demo nodes
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
        // @ts-ignore
        idMap[node.upline_profile_id].children.push(idMap[node.profile_id])
      }
    })
    return root
  }

  useEffect(() => {
    setLoading(true)
    fetchBinaryNetwork(netmeProfileId)
      .then(res => {
        const processed = addVacantNodesToData(res.data)
        const tree = buildTree(processed, netmeProfileId)
        setTreeData(tree)
      })
      .catch(() => setError('Error fetching network Binary'))
      .finally(() => setLoading(false))
  }, [netmeProfileId])

  if (loading) return <div>Cargando red binaria...</div>
  if (error) return <div>{error}</div>
  if (!treeData) return <div>No hay datos de red.</div>

  return <TreeBuilder treeData={treeData} />
} 