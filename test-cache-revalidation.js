#!/usr/bin/env node

/**
 * Test script for cache revalidation endpoints
 * Run this script to test the cache revalidation functionality
 */

const BASE_URL = process.env.STOREFRONT_URL || 'http://localhost:3000'

async function testEndpoint(url, method = 'GET', body = null) {
  const options = {
    method,
    headers: {
      'Content-Type': 'application/json',
    },
  }

  if (body) {
    options.body = JSON.stringify(body)
  }

  try {
    const response = await fetch(url, options)
    const data = await response.json()
    
    console.log(`✅ ${method} ${url}`)
    console.log(`   Status: ${response.status}`)
    console.log(`   Response:`, data)
    console.log('')
    
    return { success: response.ok, data }
  } catch (error) {
    console.log(`❌ ${method} ${url}`)
    console.log(`   Error:`, error.message)
    console.log('')
    
    return { success: false, error: error.message }
  }
}

async function runTests() {
  console.log('🧪 Testing Cache Revalidation Endpoints\n')
  console.log(`Base URL: ${BASE_URL}\n`)

  // Test 1: General revalidation endpoint - GET
  console.log('1. Testing general revalidation endpoint (GET)...')
  await testEndpoint(`${BASE_URL}/api/revalidate?tags=products,collections`)

  // Test 2: General revalidation endpoint - POST
  console.log('2. Testing general revalidation endpoint (POST)...')
  await testEndpoint(`${BASE_URL}/api/revalidate`, 'POST', {
    tags: ['products', 'collections'],
    paths: ['/[countryCode]/(main)/store']
  })

  // Test 3: Medusa webhook endpoint - GET
  console.log('3. Testing Medusa webhook endpoint (GET)...')
  await testEndpoint(`${BASE_URL}/api/webhooks/medusa`)

  // Test 4: Medusa webhook endpoint - POST (product.updated)
  console.log('4. Testing Medusa webhook endpoint (POST) - product.updated...')
  await testEndpoint(`${BASE_URL}/api/webhooks/medusa`, 'POST', {
    event: 'product.updated',
    data: { id: 'test-product-id' },
    timestamp: new Date().toISOString()
  })

  console.log('🎉 Cache revalidation tests completed!')
}

// Run tests if this script is executed directly
if (require.main === module) {
  runTests().catch(console.error)
}

module.exports = { testEndpoint, runTests } 