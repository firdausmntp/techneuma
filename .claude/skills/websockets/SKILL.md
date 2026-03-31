---
name: websockets
description: 
---

---
name: websockets
description: Expert WebSocket and real-time communication patterns with Socket.io, scaling, and reliability
---

# WebSocket Specialist

You are an expert in real-time communication. Apply these principles for robust WebSocket implementations.

## Core Philosophy

- **Connection resilience** — Auto-reconnect, heartbeat, fallbacks
- **Message reliability** — Acknowledge, retry, order guarantees
- **Scalability** — Horizontal scaling, message brokers
- **Security** — Authentication, authorization, rate limiting

## Native WebSocket

### Server (Node.js)
```typescript
import { WebSocketServer, WebSocket } from 'ws'
import { createServer } from 'http'
import { parse } from 'url'

const server = createServer()
const wss = new WebSocketServer({ noServer: true })

// Connection handling
wss.on('connection', (ws: WebSocket, request, user) => {
  console.log(`User ${user.id} connected`)
  
  // Send welcome message
  ws.send(JSON.stringify({ type: 'connected', userId: user.id }))
  
  // Message handling
  ws.on('message', (data) => {
    try {
      const message = JSON.parse(data.toString())
      handleMessage(ws, user, message)
    } catch (e) {
      ws.send(JSON.stringify({ type: 'error', message: 'Invalid JSON' }))
    }
  })
  
  // Heartbeat
  ws.isAlive = true
  ws.on('pong', () => { ws.isAlive = true })
  
  // Cleanup
  ws.on('close', () => {
    console.log(`User ${user.id} disconnected`)
  })
  
  ws.on('error', (error) => {
    console.error('WebSocket error:', error)
  })
})

// Upgrade HTTP to WebSocket
server.on('upgrade', async (request, socket, head) => {
  try {
    // Authenticate
    const { query } = parse(request.url!, true)
    const user = await authenticateToken(query.token as string)
    
    if (!user) {
      socket.write('HTTP/1.1 401 Unauthorized\r\n\r\n')
      socket.destroy()
      return
    }
    
    // Upgrade connection
    wss.handleUpgrade(request, socket, head, (ws) => {
      wss.emit('connection', ws, request, user)
    })
  } catch (error) {
    socket.destroy()
  }
})

// Heartbeat interval
const heartbeatInterval = setInterval(() => {
  wss.clients.forEach((ws: WebSocket) => {
    if (!ws.isAlive) {
      return ws.terminate()
    }
    ws.isAlive = false
    ws.ping()
  })
}, 30000)

// Broadcast to all clients
function broadcast(message: object) {
  const data = JSON.stringify(message)
  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(data)
    }
  })
}

server.listen(3001)
```

### Client (Browser)
```typescript
class WebSocketClient {
  private ws: WebSocket | null = null
  private reconnectAttempts = 0
  private maxReconnectAttempts = 5
  private reconnectDelay = 1000
  private messageQueue: string[] = []
  private listeners = new Map<string, Set<Function>>()
  
  constructor(private url: string, private token: string) {}
  
  connect() {
    this.ws = new WebSocket(`${this.url}?token=${this.token}`)
    
    this.ws.onopen = () => {
      console.log('Connected')
      this.reconnectAttempts = 0
      this.flushQueue()
    }
    
    this.ws.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data)
        this.emit(message.type, message)
      } catch (e) {
        console.error('Failed to parse message', e)
      }
    }
    
    this.ws.onclose = (event) => {
      if (!event.wasClean) {
        this.reconnect()
      }
    }
    
    this.ws.onerror = (error) => {
      console.error('WebSocket error:', error)
    }
  }
  
  private reconnect() {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('Max reconnection attempts reached')
      return
    }
    
    const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts)
    this.reconnectAttempts++
    
    console.log(`Reconnecting in ${delay}ms...`)
    setTimeout(() => this.connect(), delay)
  }
  
  send(type: string, payload: object) {
    const message = JSON.stringify({ type, ...payload })
    
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(message)
    } else {
      this.messageQueue.push(message)
    }
  }
  
  private flushQueue() {
    while (this.messageQueue.length > 0 && this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(this.messageQueue.shift()!)
    }
  }
  
  on(event: string, callback: Function) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set())
    }
    this.listeners.get(event)!.add(callback)
  }
  
  off(event: string, callback: Function) {
    this.listeners.get(event)?.delete(callback)
  }
  
  private emit(event: string, data: any) {
    this.listeners.get(event)?.forEach(cb => cb(data))
  }
  
  disconnect() {
    this.ws?.close()
    this.ws = null
  }
}

// Usage
const client = new WebSocketClient('wss://api.example.com/ws', authToken)
client.connect()

client.on('message', (data) => {
  console.log('New message:', data)
})

client.send('chat:message', { text: 'Hello!', roomId: 'general' })
```

## Socket.io

### Server
```typescript
import { Server, Socket } from 'socket.io'
import { createServer } from 'http'
import { createAdapter } from '@socket.io/redis-adapter'
import { createClient } from 'redis'

const httpServer = createServer()
const io = new Server(httpServer, {
  cors: {
    origin: process.env.CLIENT_URL,
    credentials: true
  },
  pingTimeout: 60000,
  pingInterval: 25000
})

// Redis adapter for horizontal scaling
const pubClient = createClient({ url: process.env.REDIS_URL })
const subClient = pubClient.duplicate()

Promise.all([pubClient.connect(), subClient.connect()]).then(() => {
  io.adapter(createAdapter(pubClient, subClient))
})

// Authentication middleware
io.use(async (socket, next) => {
  try {
    const token = socket.handshake.auth.token
    const user = await verifyToken(token)
    socket.data.user = user
    next()
  } catch (error) {
    next(new Error('Authentication failed'))
  }
})

// Connection handling
io.on('connection', (socket: Socket) => {
  const user = socket.data.user
  console.log(`User ${user.id} connected`)
  
  // Join user's personal room
  socket.join(`user:${user.id}`)
  
  // Join a chat room
  socket.on('room:join', async (roomId: string) => {
    // Check permission
    const canJoin = await checkRoomPermission(user.id, roomId)
    if (!canJoin) {
      socket.emit('error', { message: 'Cannot join room' })
      return
    }
    
    socket.join(`room:${roomId}`)
    socket.to(`room:${roomId}`).emit('room:userJoined', { user })
  })
  
  // Leave room
  socket.on('room:leave', (roomId: string) => {
    socket.leave(`room:${roomId}`)
    socket.to(`room:${roomId}`).emit('room:userLeft', { user })
  })
  
  // Send message
  socket.on('message:send', async (data: { roomId: string; text: string }, callback) => {
    try {
      // Save to database
      const message = await saveMessage({
        roomId: data.roomId,
        userId: user.id,
        text: data.text
      })
      
      // Broadcast to room
      io.to(`room:${data.roomId}`).emit('message:new', message)
      
      // Acknowledge
      callback({ success: true, messageId: message.id })
    } catch (error) {
      callback({ success: false, error: 'Failed to send message' })
    }
  })
  
  // Typing indicator
  socket.on('typing:start', (roomId: string) => {
    socket.to(`room:${roomId}`).emit('typing:update', {
      userId: user.id,
      isTyping: true
    })
  })
  
  socket.on('typing:stop', (roomId: string) => {
    socket.to(`room:${roomId}`).emit('typing:update', {
      userId: user.id,
      isTyping: false
    })
  })
  
  // Disconnect
  socket.on('disconnect', () => {
    console.log(`User ${user.id} disconnected`)
  })
})

// Send to specific user (across all servers with Redis)
function sendToUser(userId: string, event: string, data: any) {
  io.to(`user:${userId}`).emit(event, data)
}

// Send to room
function sendToRoom(roomId: string, event: string, data: any) {
  io.to(`room:${roomId}`).emit(event, data)
}

httpServer.listen(3001)
```

### Client (React Hook)
```typescript
import { io, Socket } from 'socket.io-client'
import { useEffect, useRef, useState, useCallback } from 'react'

interface UseSocketOptions {
  url: string
  token: string
  onConnect?: () => void
  onDisconnect?: () => void
  onError?: (error: Error) => void
}

export function useSocket({ url, token, onConnect, onDisconnect, onError }: UseSocketOptions) {
  const socketRef = useRef<Socket | null>(null)
  const [isConnected, setIsConnected] = useState(false)
  
  useEffect(() => {
    const socket = io(url, {
      auth: { token },
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000
    })
    
    socket.on('connect', () => {
      setIsConnected(true)
      onConnect?.()
    })
    
    socket.on('disconnect', () => {
      setIsConnected(false)
      onDisconnect?.()
    })
    
    socket.on('connect_error', (error) => {
      onError?.(error)
    })
    
    socketRef.current = socket
    
    return () => {
      socket.disconnect()
    }
  }, [url, token])
  
  const emit = useCallback(<T>(event: string, data?: any): Promise<T> => {
    return new Promise((resolve, reject) => {
      if (!socketRef.current?.connected) {
        reject(new Error('Not connected'))
        return
      }
      
      socketRef.current.emit(event, data, (response: any) => {
        if (response.success) {
          resolve(response)
        } else {
          reject(new Error(response.error))
        }
      })
    })
  }, [])
  
  const on = useCallback((event: string, handler: (...args: any[]) => void) => {
    socketRef.current?.on(event, handler)
    return () => socketRef.current?.off(event, handler)
  }, [])
  
  return { socket: socketRef.current, isConnected, emit, on }
}

// Usage in component
function ChatRoom({ roomId }: { roomId: string }) {
  const [messages, setMessages] = useState<Message[]>([])
  const { emit, on, isConnected } = useSocket({
    url: 'wss://api.example.com',
    token: authToken
  })
  
  useEffect(() => {
    // Join room
    emit('room:join', roomId)
    
    // Listen for messages
    const unsubscribe = on('message:new', (message: Message) => {
      setMessages(prev => [...prev, message])
    })
    
    return () => {
      emit('room:leave', roomId)
      unsubscribe()
    }
  }, [roomId, emit, on])
  
  const sendMessage = async (text: string) => {
    try {
      await emit('message:send', { roomId, text })
    } catch (error) {
      console.error('Failed to send:', error)
    }
  }
  
  return (
    <div>
      <ConnectionStatus connected={isConnected} />
      <MessageList messages={messages} />
      <MessageInput onSend={sendMessage} />
    </div>
  )
}
```

## Scaling with Redis

```typescript
// Pub/Sub for cross-server communication
import { createClient } from 'redis'

const publisher = createClient({ url: process.env.REDIS_URL })
const subscriber = publisher.duplicate()

await Promise.all([publisher.connect(), subscriber.connect()])

// Publish event
async function publishEvent(channel: string, data: object) {
  await publisher.publish(channel, JSON.stringify(data))
}

// Subscribe to channel
subscriber.subscribe('notifications', (message) => {
  const data = JSON.parse(message)
  // Handle notification
})

// Presence tracking with Redis
class PresenceManager {
  private redis = createClient({ url: process.env.REDIS_URL })
  private readonly PRESENCE_TTL = 60
  
  async setOnline(userId: string, serverId: string) {
    await this.redis.setEx(`presence:${userId}`, this.PRESENCE_TTL, serverId)
    await this.redis.sAdd('online_users', userId)
  }
  
  async setOffline(userId: string) {
    await this.redis.del(`presence:${userId}`)
    await this.redis.sRem('online_users', userId)
  }
  
  async isOnline(userId: string): Promise<boolean> {
    const result = await this.redis.exists(`presence:${userId}`)
    return result === 1
  }
  
  async getOnlineUsers(): Promise<string[]> {
    return this.redis.sMembers('online_users')
  }
  
  async heartbeat(userId: string, serverId: string) {
    await this.redis.setEx(`presence:${userId}`, this.PRESENCE_TTL, serverId)
  }
}
```

## Message Acknowledgment

```typescript
// Server: Message with acknowledgment
socket.on('message:send', async (data, ack) => {
  const messageId = generateId()
  
  try {
    await saveToDatabase(data)
    ack({ success: true, messageId })
  } catch (error) {
    ack({ success: false, error: 'Database error' })
  }
})

// Client: Retry on failure
async function sendWithRetry(data: any, maxRetries = 3) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      const result = await emit('message:send', data)
      return result
    } catch (error) {
      if (i === maxRetries - 1) throw error
      await new Promise(r => setTimeout(r, 1000 * Math.pow(2, i)))
    }
  }
}
```

## Rate Limiting

```typescript
import { RateLimiterMemory } from 'rate-limiter-flexible'

const rateLimiter = new RateLimiterMemory({
  points: 10,      // 10 messages
  duration: 1      // per second
})

io.use(async (socket, next) => {
  socket.use(async ([event, ...args], next) => {
    try {
      await rateLimiter.consume(socket.data.user.id)
      next()
    } catch {
      next(new Error('Too many requests'))
    }
  })
  next()
})
```

## Anti-Patterns

### ❌ No Reconnection Logic
```typescript
// Bad
const ws = new WebSocket(url)
ws.onclose = () => console.log('Disconnected')  // Nothing else!

// Good
ws.onclose = () => {
  setTimeout(() => reconnect(), 1000)
}
```

### ❌ No Message Validation
```typescript
// Bad
socket.on('message', (data) => {
  db.query(`INSERT INTO messages VALUES ('${data.text}')`)  // SQL injection!
})

// Good
socket.on('message', (data) => {
  const validated = messageSchema.parse(data)
  db.query('INSERT INTO messages VALUES (?)', [validated.text])
})
```

### ❌ Sending Large Payloads
```typescript
// Bad
socket.emit('data', { hugeArray: millionItems })

// Good: Paginate or stream
socket.emit('data:chunk', { items: items.slice(0, 100), page: 1, hasMore: true })
```

### ❌ No Authentication
```typescript
// Bad
wss.on('connection', (ws) => {
  // Accept any connection!
})

// Good
server.on('upgrade', async (req, socket, head) => {
  const user = await authenticate(req)
  if (!user) {
    socket.destroy()
    return
  }
  // ... proceed
})
```
