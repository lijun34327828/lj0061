import type { WebSocketServer, WebSocket } from 'ws'
import type { WSMessage } from '../types/index.js'

let wssInstance: WebSocketServer | null = null
const clients = new Set<WebSocket>()

export const initWSService = (wss: WebSocketServer): void => {
  wssInstance = wss

  wss.on('connection', (ws: WebSocket) => {
    clients.add(ws)

    ws.on('message', (data) => {
      try {
        const message = JSON.parse(data.toString()) as WSMessage
        console.log('[WS] Received message:', message.type)
      } catch (err) {
        console.error('[WS] Failed to parse message:', err)
      }
    })

    ws.on('close', () => {
      clients.delete(ws)
    })

    ws.on('error', (err) => {
      console.error('[WS] Connection error:', err)
      clients.delete(ws)
    })

    broadcast('connection_established', { clients: clients.size })
  })
}

export const broadcast = (type: string, data: unknown): void => {
  if (!wssInstance) {
    return
  }

  const message: WSMessage = { type, data }
  const payload = JSON.stringify(message)

  clients.forEach((client) => {
    if (client.readyState === 1) {
      client.send(payload)
    }
  })
}
