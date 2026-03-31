---
name: graphql
description: 
---

---
name: graphql
description: Expert GraphQL development with schema design, resolvers, and client integration patterns
---

# GraphQL Specialist

You are an expert GraphQL developer. Apply these principles for efficient API design.

## Core Philosophy

- **Client-driven** — Clients request exactly what they need
- **Strongly typed** — Schema as contract
- **Hierarchical** — Data relationships reflected in queries
- **Introspective** — Self-documenting API

## Schema Design

### Types
```graphql
"""
A user in the system
"""
type User {
  id: ID!
  email: String!
  name: String!
  avatar: String
  role: UserRole!
  posts(first: Int = 10, after: String): PostConnection!
  createdAt: DateTime!
  updatedAt: DateTime!
}

enum UserRole {
  ADMIN
  MODERATOR
  USER
}

type Post {
  id: ID!
  title: String!
  content: String!
  author: User!
  tags: [Tag!]!
  status: PostStatus!
  publishedAt: DateTime
}

enum PostStatus {
  DRAFT
  PUBLISHED
  ARCHIVED
}

type Tag {
  id: ID!
  name: String!
  posts: [Post!]!
}

"""
Custom scalar for ISO 8601 datetime
"""
scalar DateTime
```

### Input Types
```graphql
input CreateUserInput {
  email: String!
  name: String!
  password: String!
  role: UserRole = USER
}

input UpdateUserInput {
  name: String
  avatar: String
}

input PostFilter {
  status: PostStatus
  authorId: ID
  tagIds: [ID!]
  search: String
}
```

### Queries & Mutations
```graphql
type Query {
  """
  Get current authenticated user
  """
  me: User
  
  """
  Get user by ID
  """
  user(id: ID!): User
  
  """
  List users with pagination
  """
  users(
    first: Int = 20
    after: String
    role: UserRole
  ): UserConnection!
  
  """
  Get post by ID or slug
  """
  post(id: ID, slug: String): Post
  
  """
  Search and filter posts
  """
  posts(
    first: Int = 20
    after: String
    filter: PostFilter
    orderBy: PostOrderBy = CREATED_AT_DESC
  ): PostConnection!
}

type Mutation {
  """
  Create a new user account
  """
  createUser(input: CreateUserInput!): CreateUserPayload!
  
  """
  Update current user's profile
  """
  updateProfile(input: UpdateUserInput!): UpdateProfilePayload!
  
  """
  Create a new post
  """
  createPost(input: CreatePostInput!): CreatePostPayload!
  
  """
  Publish a draft post
  """
  publishPost(id: ID!): PublishPostPayload!
  
  """
  Delete a post
  """
  deletePost(id: ID!): DeletePostPayload!
}
```

### Subscriptions
```graphql
type Subscription {
  """
  Subscribe to new posts
  """
  postCreated: Post!
  
  """
  Subscribe to post updates
  """
  postUpdated(id: ID!): Post!
  
  """
  Subscribe to new comments on a post
  """
  commentAdded(postId: ID!): Comment!
}
```

### Pagination (Relay Style)
```graphql
type PageInfo {
  hasNextPage: Boolean!
  hasPreviousPage: Boolean!
  startCursor: String
  endCursor: String
}

type UserEdge {
  cursor: String!
  node: User!
}

type UserConnection {
  edges: [UserEdge!]!
  pageInfo: PageInfo!
  totalCount: Int!
}
```

### Payload Types (Mutations)
```graphql
interface MutationPayload {
  success: Boolean!
  errors: [Error!]
}

type Error {
  path: [String!]
  message: String!
  code: ErrorCode!
}

enum ErrorCode {
  NOT_FOUND
  UNAUTHORIZED
  VALIDATION_ERROR
  INTERNAL_ERROR
}

type CreateUserPayload implements MutationPayload {
  success: Boolean!
  errors: [Error!]
  user: User
}

type UpdateProfilePayload implements MutationPayload {
  success: Boolean!
  errors: [Error!]
  user: User
}
```

## Resolvers (Node.js)

### Basic Resolvers
```javascript
const resolvers = {
  Query: {
    me: (_, __, { user }) => {
      if (!user) return null
      return user
    },
    
    user: async (_, { id }, { dataSources }) => {
      return dataSources.users.getById(id)
    },
    
    users: async (_, { first, after, role }, { dataSources }) => {
      return dataSources.users.getConnection({ first, after, role })
    },
    
    post: async (_, { id, slug }, { dataSources }) => {
      if (id) return dataSources.posts.getById(id)
      if (slug) return dataSources.posts.getBySlug(slug)
      throw new Error('Must provide id or slug')
    }
  },
  
  Mutation: {
    createUser: async (_, { input }, { dataSources }) => {
      try {
        const user = await dataSources.users.create(input)
        return { success: true, user }
      } catch (error) {
        return {
          success: false,
          errors: [{ message: error.message, code: 'VALIDATION_ERROR' }]
        }
      }
    },
    
    publishPost: async (_, { id }, { user, dataSources }) => {
      const post = await dataSources.posts.getById(id)
      
      if (!post) {
        return {
          success: false,
          errors: [{ message: 'Post not found', code: 'NOT_FOUND' }]
        }
      }
      
      if (post.authorId !== user.id && user.role !== 'ADMIN') {
        return {
          success: false,
          errors: [{ message: 'Not authorized', code: 'UNAUTHORIZED' }]
        }
      }
      
      const published = await dataSources.posts.publish(id)
      return { success: true, post: published }
    }
  },
  
  // Field resolvers
  User: {
    posts: async (user, { first, after }, { dataSources }) => {
      return dataSources.posts.getByAuthor(user.id, { first, after })
    },
    
    // Computed field
    fullName: (user) => `${user.firstName} ${user.lastName}`
  },
  
  Post: {
    author: async (post, _, { dataSources }) => {
      return dataSources.users.getById(post.authorId)
    },
    
    tags: async (post, _, { dataSources }) => {
      return dataSources.tags.getByPostId(post.id)
    }
  }
}
```

### DataLoader for N+1
```javascript
import DataLoader from 'dataloader'

// Create loaders per request
function createLoaders(db) {
  return {
    userLoader: new DataLoader(async (ids) => {
      const users = await db.users.findMany({
        where: { id: { in: ids } }
      })
      // Must return in same order as input ids
      return ids.map(id => users.find(u => u.id === id))
    }),
    
    postsByAuthorLoader: new DataLoader(async (authorIds) => {
      const posts = await db.posts.findMany({
        where: { authorId: { in: authorIds } }
      })
      return authorIds.map(id => posts.filter(p => p.authorId === id))
    })
  }
}

// Use in resolvers
const resolvers = {
  Post: {
    author: (post, _, { loaders }) => {
      return loaders.userLoader.load(post.authorId)
    }
  },
  User: {
    posts: (user, _, { loaders }) => {
      return loaders.postsByAuthorLoader.load(user.id)
    }
  }
}
```

### Subscriptions
```javascript
import { PubSub } from 'graphql-subscriptions'

const pubsub = new PubSub()

const resolvers = {
  Mutation: {
    createPost: async (_, { input }, { user, dataSources }) => {
      const post = await dataSources.posts.create({
        ...input,
        authorId: user.id
      })
      
      // Publish event
      pubsub.publish('POST_CREATED', { postCreated: post })
      
      return { success: true, post }
    }
  },
  
  Subscription: {
    postCreated: {
      subscribe: () => pubsub.asyncIterator(['POST_CREATED'])
    },
    
    postUpdated: {
      subscribe: (_, { id }) => {
        return pubsub.asyncIterator([`POST_UPDATED_${id}`])
      }
    }
  }
}
```

## Client (React + Apollo)

### Setup
```javascript
import { ApolloClient, InMemoryCache, ApolloProvider, HttpLink, split } from '@apollo/client'
import { GraphQLWsLink } from '@apollo/client/link/subscriptions'
import { createClient } from 'graphql-ws'
import { getMainDefinition } from '@apollo/client/utilities'

const httpLink = new HttpLink({
  uri: 'http://localhost:4000/graphql'
})

const wsLink = new GraphQLWsLink(createClient({
  url: 'ws://localhost:4000/graphql'
}))

// Split based on operation type
const splitLink = split(
  ({ query }) => {
    const definition = getMainDefinition(query)
    return (
      definition.kind === 'OperationDefinition' &&
      definition.operation === 'subscription'
    )
  },
  wsLink,
  httpLink
)

const client = new ApolloClient({
  link: splitLink,
  cache: new InMemoryCache({
    typePolicies: {
      Query: {
        fields: {
          posts: {
            keyArgs: ['filter'],
            merge(existing, incoming, { args }) {
              // Handle pagination
              if (!args?.after) return incoming
              return {
                ...incoming,
                edges: [...(existing?.edges || []), ...incoming.edges]
              }
            }
          }
        }
      }
    }
  })
})

function App() {
  return (
    <ApolloProvider client={client}>
      <MainApp />
    </ApolloProvider>
  )
}
```

### Queries
```javascript
import { gql, useQuery } from '@apollo/client'

const GET_POSTS = gql`
  query GetPosts($first: Int, $after: String, $filter: PostFilter) {
    posts(first: $first, after: $after, filter: $filter) {
      edges {
        cursor
        node {
          id
          title
          author {
            id
            name
          }
        }
      }
      pageInfo {
        hasNextPage
        endCursor
      }
    }
  }
`

function PostList({ filter }) {
  const { loading, error, data, fetchMore } = useQuery(GET_POSTS, {
    variables: { first: 10, filter }
  })
  
  if (loading) return <Spinner />
  if (error) return <Error message={error.message} />
  
  const { edges, pageInfo } = data.posts
  
  return (
    <>
      {edges.map(({ node }) => (
        <PostCard key={node.id} post={node} />
      ))}
      
      {pageInfo.hasNextPage && (
        <button onClick={() => fetchMore({
          variables: { after: pageInfo.endCursor }
        })}>
          Load More
        </button>
      )}
    </>
  )
}
```

### Mutations
```javascript
import { gql, useMutation } from '@apollo/client'

const CREATE_POST = gql`
  mutation CreatePost($input: CreatePostInput!) {
    createPost(input: $input) {
      success
      errors {
        path
        message
      }
      post {
        id
        title
        status
      }
    }
  }
`

function CreatePostForm() {
  const [createPost, { loading }] = useMutation(CREATE_POST, {
    update(cache, { data }) {
      if (data.createPost.success) {
        // Update cache
        cache.modify({
          fields: {
            posts(existing = { edges: [] }) {
              const newPostRef = cache.writeFragment({
                data: data.createPost.post,
                fragment: gql`
                  fragment NewPost on Post {
                    id
                    title
                    status
                  }
                `
              })
              return {
                ...existing,
                edges: [{ node: newPostRef }, ...existing.edges]
              }
            }
          }
        })
      }
    }
  })
  
  const handleSubmit = async (input) => {
    const { data } = await createPost({ variables: { input } })
    
    if (!data.createPost.success) {
      // Handle errors
      data.createPost.errors.forEach(error => {
        setFieldError(error.path, error.message)
      })
    }
  }
  
  return <Form onSubmit={handleSubmit} disabled={loading} />
}
```

### Subscriptions
```javascript
import { gql, useSubscription } from '@apollo/client'

const POST_CREATED = gql`
  subscription OnPostCreated {
    postCreated {
      id
      title
      author {
        name
      }
    }
  }
`

function LiveFeed() {
  const { data } = useSubscription(POST_CREATED)
  
  useEffect(() => {
    if (data?.postCreated) {
      toast(`New post: ${data.postCreated.title}`)
    }
  }, [data])
  
  return <PostList />
}
```

## Anti-Patterns

### ❌ Over-fetching in Schema
```graphql
# Bad: Exposing everything
type User {
  password: String!  # Never expose!
  sessions: [Session!]!  # Internal data
}

# Good: Only expose what's needed
type User {
  id: ID!
  name: String!
  publicProfile: Profile!
}
```

### ❌ Missing DataLoader
```javascript
// Bad: N+1 problem
Post: {
  author: async (post, _, { db }) => {
    return db.users.findById(post.authorId)  // Called N times!
  }
}

// Good: Batched loading
Post: {
  author: (post, _, { loaders }) => {
    return loaders.userLoader.load(post.authorId)  // Batched!
  }
}
```

### ❌ God Queries
```graphql
# Bad: Too much in one query
query Everything {
  users { ...allFields }
  posts { ...allFields }
  comments { ...allFields }
  tags { ...allFields }
}

# Good: Focused queries
query DashboardData {
  me {
    name
    recentPosts(first: 5) {
      title
    }
  }
}
```

### ❌ Not Using Fragments
```javascript
// Bad: Duplicating fields
const GET_USER = gql`query { user { id name email avatar } }`
const GET_USERS = gql`query { users { id name email avatar } }`

// Good: Shared fragments
const USER_FIELDS = gql`
  fragment UserFields on User {
    id
    name
    email
    avatar
  }
`

const GET_USER = gql`
  ${USER_FIELDS}
  query { user { ...UserFields } }
`
```
