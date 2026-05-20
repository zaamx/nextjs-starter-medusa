import { NextResponse } from "next/server"
import fs from "fs"
import path from "path"

export async function POST(request: Request) {
  try {
    const data = await request.json()
    const logFilePath = path.join(process.cwd(), "debug-orders.log")
    
    // Format the log entry
    const logEntry = `\n--- LOG ENTRY AT ${new Date().toISOString()} ---\n` +
      JSON.stringify(data, null, 2) +
      "\n-------------------------------------------\n"
      
    fs.appendFileSync(logFilePath, logEntry, "utf-8")
    return NextResponse.json({ success: true })
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
