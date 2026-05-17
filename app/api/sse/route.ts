// /api/sse?userId={userId}
// Server-Sent Events stream for real-time simulation updates.
// The client subscribes here; the webhook handler broadcasts events.

import { NextRequest } from 'next/server'
import { registerSseClient } from '../webhooks/simulation-events/route'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function GET(req: NextRequest) {
  const userId = req.nextUrl.searchParams.get('userId')
  if (!userId) {
    return new Response('userId query param required', { status: 400 })
  }

  const encoder = new TextEncoder()

  const stream = new ReadableStream({
    start(controller) {
      // Send initial connection confirmation
      const connect = `data: ${JSON.stringify({ type: 'connected', userId, timestamp: new Date().toISOString() })}\n\n`
      controller.enqueue(encoder.encode(connect))

      // Register this client to receive broadcast events
      const unregister = registerSseClient((event) => {
        // Only send events relevant to this user (or broadcast events with no userId)
        const ev = event as { sessionId?: string; data?: { userId?: string }; type?: string }
        const targetUser = ev.data?.userId
        if (targetUser && targetUser !== userId) return

        try {
          const msg = `data: ${JSON.stringify(event)}\n\n`
          controller.enqueue(encoder.encode(msg))
        } catch {
          // Stream may have been closed
        }
      })

      // Heartbeat every 25s to keep connection alive through proxies
      const heartbeat = setInterval(() => {
        try {
          controller.enqueue(encoder.encode(': heartbeat\n\n'))
        } catch {
          clearInterval(heartbeat)
        }
      }, 25_000)

      // Cleanup on disconnect
      req.signal.addEventListener('abort', () => {
        clearInterval(heartbeat)
        unregister()
        controller.close()
      })
    },
  })

  return new Response(stream, {
    headers: {
      'Content-Type':                'text/event-stream',
      'Cache-Control':               'no-cache, no-transform',
      'Connection':                  'keep-alive',
      'X-Accel-Buffering':           'no',   // Nginx: disable proxy buffering
      'Access-Control-Allow-Origin': '*',
    },
  })
}
