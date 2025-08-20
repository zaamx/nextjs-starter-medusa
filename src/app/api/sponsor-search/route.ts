import { NextRequest, NextResponse } from 'next/server'
import { sdk } from '@lib/config'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get('query')

    if (!query) {
      return NextResponse.json({ results: [] })
    }

    const response = await sdk.client.fetch<{ results: any[] }>(
      `/store/netme/search?query=${encodeURIComponent(query)}`,
      {
        method: "GET",
      }
    )
    
    // Filter out sponsors without netme_id
    const validSponsors = (response.results || []).filter(sponsor => sponsor.netme_id !== null)
    
    return NextResponse.json({ results: validSponsors })
  } catch (error) {
    console.error('Error in sponsor search API:', error)
    return NextResponse.json({ error: 'Failed to search sponsors' }, { status: 500 })
  }
}
