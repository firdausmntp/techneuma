---
name: authentication
description: Expert authentication and authorization patterns including OAuth, JWT, sessions, and security best practices
---

# Authentication Specialist

You are an expert in authentication and authorization. Apply these principles for secure identity management.

## Core Philosophy

- **Defense in depth** — Multiple security layers
- **Least privilege** — Minimal access by default
- **Secure by default** — Safe defaults, opt-in for risky features
- **Audit everything** — Log all auth events

## Authentication Methods

### Password-Based (with bcrypt)
```typescript
import bcrypt from 'bcrypt'

const SALT_ROUNDS = 12

// Hash password
async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS)
}

// Verify password
async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash)
}

// Registration
async function register(email: string, password: string) {
  // Validate password strength
  if (!isStrongPassword(password)) {
    throw new Error('Password does not meet requirements')
  }
  
  // Check if user exists
  const existing = await db.user.findUnique({ where: { email } })
  if (existing) {
    // Don't reveal if email exists (timing attack prevention)
    throw new Error('Registration failed')
  }
  
  const hashedPassword = await hashPassword(password)
  
  return db.user.create({
    data: {
      email,
      password: hashedPassword,
      emailVerified: false
    }
  })
}

// Login
async function login(email: string, password: string) {
  const user = await db.user.findUnique({ where: { email } })
  
  // Always hash even if user doesn't exist (timing attack prevention)
  const isValid = user 
    ? await verifyPassword(password, user.password)
    : await verifyPassword(password, '$2b$12$fakehashtopreventtiming')
  
  if (!user || !isValid) {
    throw new Error('Invalid credentials')
  }
  
  // Check account status
  if (user.locked) {
    throw new Error('Account locked')
  }
  
  return user
}
```

### JWT (JSON Web Tokens)
```typescript
import jwt from 'jsonwebtoken'

interface TokenPayload {
  userId: string
  email: string
  role: string
}

const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET!
const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET!

// Generate tokens
function generateTokens(user: User) {
  const payload: TokenPayload = {
    userId: user.id,
    email: user.email,
    role: user.role
  }
  
  const accessToken = jwt.sign(payload, ACCESS_TOKEN_SECRET, {
    expiresIn: '15m'
  })
  
  const refreshToken = jwt.sign(
    { userId: user.id },
    REFRESH_TOKEN_SECRET,
    { expiresIn: '7d' }
  )
  
  return { accessToken, refreshToken }
}

// Verify access token
function verifyAccessToken(token: string): TokenPayload {
  try {
    return jwt.verify(token, ACCESS_TOKEN_SECRET) as TokenPayload
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      throw new AuthError('Token expired', 'TOKEN_EXPIRED')
    }
    throw new AuthError('Invalid token', 'INVALID_TOKEN')
  }
}

// Refresh access token
async function refreshAccessToken(refreshToken: string) {
  try {
    const { userId } = jwt.verify(refreshToken, REFRESH_TOKEN_SECRET) as { userId: string }
    
    // Check if refresh token is revoked
    const isRevoked = await db.revokedToken.findUnique({
      where: { token: refreshToken }
    })
    
    if (isRevoked) {
      throw new AuthError('Token revoked', 'TOKEN_REVOKED')
    }
    
    const user = await db.user.findUnique({ where: { id: userId } })
    if (!user) {
      throw new AuthError('User not found', 'USER_NOT_FOUND')
    }
    
    return generateTokens(user)
  } catch (error) {
    throw new AuthError('Invalid refresh token', 'INVALID_TOKEN')
  }
}

// Middleware
function authMiddleware(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization
  
  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Missing token' })
  }
  
  const token = authHeader.slice(7)
  
  try {
    req.user = verifyAccessToken(token)
    next()
  } catch (error) {
    if (error instanceof AuthError && error.code === 'TOKEN_EXPIRED') {
      return res.status(401).json({ error: 'Token expired', code: 'TOKEN_EXPIRED' })
    }
    return res.status(401).json({ error: 'Invalid token' })
  }
}
```

### Session-Based
```typescript
import session from 'express-session'
import RedisStore from 'connect-redis'
import { Redis } from 'ioredis'

const redis = new Redis(process.env.REDIS_URL)

app.use(session({
  store: new RedisStore({ client: redis }),
  secret: process.env.SESSION_SECRET!,
  name: 'sid',  // Don't use default 'connect.sid'
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',  // HTTPS only in prod
    httpOnly: true,     // No JS access
    sameSite: 'lax',    // CSRF protection
    maxAge: 24 * 60 * 60 * 1000  // 24 hours
  }
}))

// Login
app.post('/login', async (req, res) => {
  const { email, password } = req.body
  
  const user = await authenticate(email, password)
  
  // Regenerate session to prevent fixation
  req.session.regenerate((err) => {
    if (err) return res.status(500).json({ error: 'Session error' })
    
    req.session.userId = user.id
    req.session.role = user.role
    
    res.json({ success: true })
  })
})

// Logout
app.post('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) return res.status(500).json({ error: 'Logout failed' })
    
    res.clearCookie('sid')
    res.json({ success: true })
  })
})

// Auth middleware
function requireAuth(req: Request, res: Response, next: NextFunction) {
  if (!req.session.userId) {
    return res.status(401).json({ error: 'Not authenticated' })
  }
  next()
}
```

## OAuth 2.0 / OIDC

### Provider Setup (NextAuth.js)
```typescript
// app/api/auth/[...nextauth]/route.ts
import NextAuth from 'next-auth'
import GoogleProvider from 'next-auth/providers/google'
import GitHubProvider from 'next-auth/providers/github'
import CredentialsProvider from 'next-auth/providers/credentials'

const handler = NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!
    }),
    GitHubProvider({
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!
    }),
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }
        
        const user = await authenticate(credentials.email, credentials.password)
        return user
      }
    })
  ],
  
  callbacks: {
    async jwt({ token, user, account }) {
      // Initial sign in
      if (user) {
        token.userId = user.id
        token.role = user.role
      }
      
      // Add access token from OAuth providers
      if (account) {
        token.accessToken = account.access_token
      }
      
      return token
    },
    
    async session({ session, token }) {
      session.user.id = token.userId as string
      session.user.role = token.role as string
      return session
    },
    
    async signIn({ user, account, profile }) {
      // Custom sign-in logic
      if (account?.provider === 'google') {
        // Check if email is allowed
        const allowedDomains = ['company.com']
        const domain = user.email?.split('@')[1]
        
        if (!allowedDomains.includes(domain!)) {
          return false  // Reject sign-in
        }
      }
      
      return true
    }
  },
  
  pages: {
    signIn: '/login',
    error: '/auth/error'
  },
  
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60  // 30 days
  }
})

export { handler as GET, handler as POST }
```

### Manual OAuth Flow
```typescript
import { OAuth2Client } from 'google-auth-library'

const client = new OAuth2Client(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI
)

// Step 1: Generate auth URL
app.get('/auth/google', (req, res) => {
  const state = generateSecureToken()
  
  // Store state in session for CSRF protection
  req.session.oauthState = state
  
  const url = client.generateAuthUrl({
    access_type: 'offline',
    scope: ['email', 'profile'],
    state
  })
  
  res.redirect(url)
})

// Step 2: Handle callback
app.get('/auth/google/callback', async (req, res) => {
  const { code, state } = req.query
  
  // Verify state for CSRF protection
  if (state !== req.session.oauthState) {
    return res.status(400).json({ error: 'Invalid state' })
  }
  
  // Exchange code for tokens
  const { tokens } = await client.getToken(code as string)
  client.setCredentials(tokens)
  
  // Get user info
  const ticket = await client.verifyIdToken({
    idToken: tokens.id_token!,
    audience: process.env.GOOGLE_CLIENT_ID
  })
  
  const payload = ticket.getPayload()!
  
  // Find or create user
  let user = await db.user.findUnique({
    where: { email: payload.email }
  })
  
  if (!user) {
    user = await db.user.create({
      data: {
        email: payload.email!,
        name: payload.name,
        picture: payload.picture,
        provider: 'google',
        providerId: payload.sub
      }
    })
  }
  
  // Create session
  const { accessToken, refreshToken } = generateTokens(user)
  
  res.redirect(`/auth/success?token=${accessToken}`)
})
```

## Authorization (RBAC)

```typescript
// Role definitions
const ROLES = {
  ADMIN: 'admin',
  MODERATOR: 'moderator',
  USER: 'user',
  GUEST: 'guest'
} as const

type Role = typeof ROLES[keyof typeof ROLES]

// Permission definitions
const PERMISSIONS = {
  // Users
  'users:read': [ROLES.ADMIN, ROLES.MODERATOR],
  'users:write': [ROLES.ADMIN],
  'users:delete': [ROLES.ADMIN],
  
  // Posts
  'posts:read': [ROLES.ADMIN, ROLES.MODERATOR, ROLES.USER],
  'posts:write': [ROLES.ADMIN, ROLES.MODERATOR, ROLES.USER],
  'posts:delete': [ROLES.ADMIN, ROLES.MODERATOR],
  'posts:publish': [ROLES.ADMIN, ROLES.MODERATOR],
  
  // Settings
  'settings:read': [ROLES.ADMIN],
  'settings:write': [ROLES.ADMIN]
} as const

type Permission = keyof typeof PERMISSIONS

// Check permission
function hasPermission(userRole: Role, permission: Permission): boolean {
  const allowedRoles = PERMISSIONS[permission]
  return allowedRoles.includes(userRole)
}

// Middleware
function requirePermission(permission: Permission) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Not authenticated' })
    }
    
    if (!hasPermission(req.user.role, permission)) {
      return res.status(403).json({ error: 'Insufficient permissions' })
    }
    
    next()
  }
}

// Usage
app.get('/admin/users', 
  authMiddleware,
  requirePermission('users:read'),
  async (req, res) => {
    const users = await db.user.findMany()
    res.json(users)
  }
)
```

## Multi-Factor Authentication

```typescript
import speakeasy from 'speakeasy'
import qrcode from 'qrcode'

// Enable 2FA - Step 1: Generate secret
async function enableMFA(userId: string) {
  const secret = speakeasy.generateSecret({
    name: `MyApp:${user.email}`,
    issuer: 'MyApp'
  })
  
  // Store secret temporarily (not yet verified)
  await db.user.update({
    where: { id: userId },
    data: { mfaSecret: secret.base32, mfaEnabled: false }
  })
  
  // Generate QR code
  const qrCode = await qrcode.toDataURL(secret.otpauth_url!)
  
  return { qrCode, secret: secret.base32 }
}

// Enable 2FA - Step 2: Verify and activate
async function verifyMFA(userId: string, token: string) {
  const user = await db.user.findUnique({ where: { id: userId } })
  
  const verified = speakeasy.totp.verify({
    secret: user.mfaSecret!,
    encoding: 'base32',
    token,
    window: 1  // Allow 1 period before/after
  })
  
  if (!verified) {
    throw new Error('Invalid verification code')
  }
  
  // Generate backup codes
  const backupCodes = Array.from({ length: 10 }, () => 
    generateSecureToken(8)
  )
  
  await db.user.update({
    where: { id: userId },
    data: {
      mfaEnabled: true,
      backupCodes: backupCodes.map(code => hashSync(code))
    }
  })
  
  return { backupCodes }
}

// Login with 2FA
async function loginWithMFA(email: string, password: string, mfaToken?: string) {
  const user = await authenticate(email, password)
  
  if (user.mfaEnabled) {
    if (!mfaToken) {
      return { requiresMFA: true }
    }
    
    const verified = speakeasy.totp.verify({
      secret: user.mfaSecret!,
      encoding: 'base32',
      token: mfaToken,
      window: 1
    })
    
    if (!verified) {
      // Check backup codes
      const isBackupCode = await verifyBackupCode(user.id, mfaToken)
      if (!isBackupCode) {
        throw new Error('Invalid 2FA code')
      }
    }
  }
  
  return generateTokens(user)
}
```

## Security Headers & CSRF

```typescript
import helmet from 'helmet'
import csrf from 'csurf'

// Security headers
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", 'data:', 'https:'],
      connectSrc: ["'self'", 'https://api.example.com']
    }
  },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  }
}))

// CSRF protection
app.use(csrf({ cookie: true }))

// Provide token to client
app.get('/csrf-token', (req, res) => {
  res.json({ csrfToken: req.csrfToken() })
})
```

## Anti-Patterns

### ❌ Storing Passwords in Plain Text
```typescript
// Bad
await db.user.create({ data: { password: password } })

// Good
await db.user.create({ data: { password: await bcrypt.hash(password, 12) } })
```

### ❌ JWT in localStorage
```typescript
// Bad: XSS vulnerable
localStorage.setItem('token', accessToken)

// Good: HttpOnly cookie
res.cookie('token', accessToken, { httpOnly: true, secure: true, sameSite: 'strict' })
```

### ❌ Long-Lived Access Tokens
```typescript
// Bad
jwt.sign(payload, secret, { expiresIn: '30d' })

// Good
jwt.sign(payload, secret, { expiresIn: '15m' })  // Use refresh tokens for longer sessions
```

### ❌ No Rate Limiting on Auth Endpoints
```typescript
// Bad: No protection against brute force
app.post('/login', loginHandler)

// Good: Rate limited
import rateLimit from 'express-rate-limit'

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: 'Too many login attempts'
})

app.post('/login', authLimiter, loginHandler)
```

### ❌ Revealing User Existence
```typescript
// Bad: Reveals if email exists
if (!user) throw new Error('User not found')
if (!validPassword) throw new Error('Wrong password')

// Good: Generic error
if (!user || !validPassword) {
  throw new Error('Invalid credentials')
}
```
