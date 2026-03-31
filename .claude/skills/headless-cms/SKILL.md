---
name: headless-cms
description: 
---

---
name: headless-cms
description: Expert headless CMS integration with Contentful, Sanity, Strapi, and content modeling patterns
---

# Headless CMS Specialist

You are an expert in headless CMS architecture. Apply these principles for flexible content management.

## Core Philosophy

- **Content as data** — Structured, API-first content
- **Separation of concerns** — Content from presentation
- **Future-proof** — Multi-channel content delivery
- **Developer experience** — Type-safe queries, good DX

## Content Modeling

### Best Practices
```
┌─────────────────────────────────────────────────────────────┐
│                    CONTENT MODELING                         │
├─────────────────────────────────────────────────────────────┤
│  1. Start with user needs, not admin convenience            │
│  2. Separate structure from presentation                    │
│  3. Use references for shared content                       │
│  4. Plan for localization from the start                    │
│  5. Keep content types focused (single responsibility)      │
│  6. Use consistent naming conventions                       │
└─────────────────────────────────────────────────────────────┘
```

### Example: Blog Schema
```typescript
// Content Types

// Author
{
  name: 'author',
  fields: [
    { name: 'name', type: 'string', required: true },
    { name: 'slug', type: 'slug', source: 'name' },
    { name: 'bio', type: 'text' },
    { name: 'avatar', type: 'image' },
    { name: 'social', type: 'object', fields: [
      { name: 'twitter', type: 'url' },
      { name: 'github', type: 'url' },
      { name: 'linkedin', type: 'url' }
    ]}
  ]
}

// Category
{
  name: 'category',
  fields: [
    { name: 'title', type: 'string', required: true },
    { name: 'slug', type: 'slug', source: 'title' },
    { name: 'description', type: 'text' },
    { name: 'color', type: 'color' }
  ]
}

// Post
{
  name: 'post',
  fields: [
    { name: 'title', type: 'string', required: true },
    { name: 'slug', type: 'slug', source: 'title' },
    { name: 'excerpt', type: 'text', maxLength: 200 },
    { name: 'content', type: 'richText' },
    { name: 'featuredImage', type: 'image' },
    { name: 'author', type: 'reference', to: 'author' },
    { name: 'categories', type: 'array', of: 'reference', to: 'category' },
    { name: 'publishedAt', type: 'datetime' },
    { name: 'seo', type: 'object', fields: [
      { name: 'metaTitle', type: 'string' },
      { name: 'metaDescription', type: 'text' },
      { name: 'ogImage', type: 'image' }
    ]}
  ]
}
```

## Sanity

### Schema Definition
```typescript
// sanity/schemas/post.ts
import { defineType, defineField } from 'sanity'

export const post = defineType({
  name: 'post',
  title: 'Blog Post',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
      validation: Rule => Rule.required().max(100)
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: { source: 'title', maxLength: 96 },
      validation: Rule => Rule.required()
    }),
    defineField({
      name: 'author',
      title: 'Author',
      type: 'reference',
      to: [{ type: 'author' }]
    }),
    defineField({
      name: 'content',
      title: 'Content',
      type: 'blockContent'  // Custom rich text
    }),
    defineField({
      name: 'publishedAt',
      title: 'Published At',
      type: 'datetime'
    })
  ],
  preview: {
    select: {
      title: 'title',
      author: 'author.name',
      media: 'featuredImage'
    },
    prepare({ title, author, media }) {
      return {
        title,
        subtitle: author ? `by ${author}` : '',
        media
      }
    }
  }
})
```

### GROQ Queries
```typescript
// lib/sanity.ts
import { createClient } from '@sanity/client'
import imageUrlBuilder from '@sanity/image-url'

export const client = createClient({
  projectId: process.env.SANITY_PROJECT_ID!,
  dataset: process.env.SANITY_DATASET!,
  apiVersion: '2024-01-01',
  useCdn: process.env.NODE_ENV === 'production'
})

const builder = imageUrlBuilder(client)
export const urlFor = (source: any) => builder.image(source)

// Queries
export const queries = {
  allPosts: `*[_type == "post" && publishedAt < now()] | order(publishedAt desc) {
    _id,
    title,
    slug,
    excerpt,
    publishedAt,
    "author": author->{name, slug, avatar},
    "categories": categories[]->{title, slug, color},
    featuredImage
  }`,
  
  postBySlug: `*[_type == "post" && slug.current == $slug][0] {
    _id,
    title,
    slug,
    content,
    publishedAt,
    "author": author->{name, bio, avatar, social},
    "categories": categories[]->{title, slug},
    featuredImage,
    seo
  }`,
  
  relatedPosts: `*[_type == "post" && slug.current != $slug && count(categories[@._ref in $categoryIds]) > 0] | order(publishedAt desc) [0...3] {
    _id,
    title,
    slug,
    excerpt,
    featuredImage
  }`
}

// Fetch functions
export async function getAllPosts() {
  return client.fetch(queries.allPosts)
}

export async function getPostBySlug(slug: string) {
  return client.fetch(queries.postBySlug, { slug })
}
```

### Type Generation
```bash
# Generate TypeScript types from Sanity schema
npx sanity typegen generate
```

```typescript
// Generated types
import type { Post, Author, Category } from './sanity.types'

async function getPost(slug: string): Promise<Post | null> {
  return client.fetch(queries.postBySlug, { slug })
}
```

## Contentful

### Content Model (Management API)
```typescript
import contentful from 'contentful-management'

const client = contentful.createClient({
  accessToken: process.env.CONTENTFUL_MANAGEMENT_TOKEN!
})

async function createPostContentType() {
  const space = await client.getSpace(process.env.CONTENTFUL_SPACE_ID!)
  const environment = await space.getEnvironment('master')
  
  const contentType = await environment.createContentTypeWithId('post', {
    name: 'Blog Post',
    displayField: 'title',
    fields: [
      {
        id: 'title',
        name: 'Title',
        type: 'Symbol',
        required: true,
        validations: [{ size: { max: 100 } }]
      },
      {
        id: 'slug',
        name: 'Slug',
        type: 'Symbol',
        required: true,
        validations: [{ unique: true }]
      },
      {
        id: 'content',
        name: 'Content',
        type: 'RichText'
      },
      {
        id: 'author',
        name: 'Author',
        type: 'Link',
        linkType: 'Entry',
        validations: [{ linkContentType: ['author'] }]
      },
      {
        id: 'publishedAt',
        name: 'Published At',
        type: 'Date'
      }
    ]
  })
  
  await contentType.publish()
}
```

### Delivery API
```typescript
import { createClient, Entry } from 'contentful'

const client = createClient({
  space: process.env.CONTENTFUL_SPACE_ID!,
  accessToken: process.env.CONTENTFUL_ACCESS_TOKEN!
})

// Types
interface PostFields {
  title: string
  slug: string
  content: Document
  author: Entry<AuthorFields>
  publishedAt: string
}

interface AuthorFields {
  name: string
  bio: string
  avatar: Asset
}

// Fetch functions
export async function getAllPosts(): Promise<Entry<PostFields>[]> {
  const response = await client.getEntries<PostFields>({
    content_type: 'post',
    order: ['-fields.publishedAt'],
    include: 2  // Include linked entries
  })
  
  return response.items
}

export async function getPostBySlug(slug: string): Promise<Entry<PostFields> | null> {
  const response = await client.getEntries<PostFields>({
    content_type: 'post',
    'fields.slug': slug,
    include: 2,
    limit: 1
  })
  
  return response.items[0] || null
}

// Rich Text Rendering
import { documentToReactComponents } from '@contentful/rich-text-react-renderer'
import { BLOCKS, INLINES } from '@contentful/rich-text-types'

const renderOptions = {
  renderNode: {
    [BLOCKS.EMBEDDED_ASSET]: (node) => {
      const { url, title } = node.data.target.fields.file
      return <img src={url} alt={title} />
    },
    [INLINES.HYPERLINK]: (node, children) => (
      <a href={node.data.uri} target="_blank" rel="noopener noreferrer">
        {children}
      </a>
    )
  }
}

function PostContent({ content }: { content: Document }) {
  return <>{documentToReactComponents(content, renderOptions)}</>
}
```

## Strapi

### Model Definition
```json
// src/api/post/content-types/post/schema.json
{
  "kind": "collectionType",
  "collectionName": "posts",
  "info": {
    "singularName": "post",
    "pluralName": "posts",
    "displayName": "Post"
  },
  "attributes": {
    "title": {
      "type": "string",
      "required": true,
      "maxLength": 100
    },
    "slug": {
      "type": "uid",
      "targetField": "title"
    },
    "content": {
      "type": "richtext"
    },
    "excerpt": {
      "type": "text",
      "maxLength": 200
    },
    "featuredImage": {
      "type": "media",
      "allowedTypes": ["images"]
    },
    "author": {
      "type": "relation",
      "relation": "manyToOne",
      "target": "api::author.author",
      "inversedBy": "posts"
    },
    "categories": {
      "type": "relation",
      "relation": "manyToMany",
      "target": "api::category.category"
    },
    "publishedAt": {
      "type": "datetime"
    }
  }
}
```

### REST API Client
```typescript
import qs from 'qs'

const STRAPI_URL = process.env.STRAPI_URL!

interface StrapiResponse<T> {
  data: T
  meta: {
    pagination?: {
      page: number
      pageSize: number
      pageCount: number
      total: number
    }
  }
}

export async function fetchAPI<T>(
  path: string,
  params: Record<string, any> = {}
): Promise<T> {
  const query = qs.stringify(params, { encodeValuesOnly: true })
  const url = `${STRAPI_URL}/api${path}${query ? `?${query}` : ''}`
  
  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${process.env.STRAPI_TOKEN}`
    }
  })
  
  if (!response.ok) {
    throw new Error(`Strapi error: ${response.status}`)
  }
  
  return response.json()
}

export async function getAllPosts() {
  return fetchAPI<StrapiResponse<Post[]>>('/posts', {
    populate: ['author', 'categories', 'featuredImage'],
    sort: ['publishedAt:desc'],
    filters: {
      publishedAt: { $notNull: true }
    }
  })
}

export async function getPostBySlug(slug: string) {
  const response = await fetchAPI<StrapiResponse<Post[]>>('/posts', {
    populate: ['author.avatar', 'categories', 'featuredImage', 'seo'],
    filters: { slug: { $eq: slug } }
  })
  
  return response.data[0] || null
}
```

## Preview Mode (Next.js)

```typescript
// app/api/preview/route.ts
import { draftMode } from 'next/headers'
import { redirect } from 'next/navigation'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const secret = searchParams.get('secret')
  const slug = searchParams.get('slug')
  
  // Validate secret
  if (secret !== process.env.PREVIEW_SECRET) {
    return new Response('Invalid token', { status: 401 })
  }
  
  // Enable draft mode
  draftMode().enable()
  
  // Redirect to the post
  redirect(`/blog/${slug}`)
}

// app/api/exit-preview/route.ts
export async function GET() {
  draftMode().disable()
  redirect('/')
}
```

```typescript
// lib/sanity.ts
import { draftMode } from 'next/headers'

export function getClient() {
  const { isEnabled } = draftMode()
  
  return createClient({
    ...config,
    useCdn: !isEnabled,
    token: isEnabled ? process.env.SANITY_PREVIEW_TOKEN : undefined
  })
}
```

## Incremental Static Regeneration

```typescript
// app/blog/[slug]/page.tsx
import { getPostBySlug, getAllPosts } from '@/lib/cms'

export async function generateStaticParams() {
  const posts = await getAllPosts()
  return posts.map(post => ({ slug: post.slug }))
}

export const revalidate = 60  // Revalidate every 60 seconds

export default async function PostPage({ params }: { params: { slug: string } }) {
  const post = await getPostBySlug(params.slug)
  
  if (!post) notFound()
  
  return <PostContent post={post} />
}
```

### On-Demand Revalidation
```typescript
// app/api/revalidate/route.ts
import { revalidatePath, revalidateTag } from 'next/cache'

export async function POST(request: Request) {
  const body = await request.json()
  
  // Verify webhook signature
  if (!verifyWebhookSignature(request, body)) {
    return new Response('Invalid signature', { status: 401 })
  }
  
  // Revalidate specific paths or tags
  if (body.type === 'post') {
    revalidatePath(`/blog/${body.slug}`)
    revalidateTag('posts')
  }
  
  return Response.json({ revalidated: true })
}
```

## Anti-Patterns

### ❌ Storing Presentation Data in CMS
```typescript
// Bad: Storing CSS/layout info in content
{
  title: "My Post",
  backgroundColor: "#ff0000",
  fontSize: "24px",
  gridColumns: 3
}

// Good: Content only, presentation in code
{
  title: "My Post",
  variant: "featured"  // Semantic meaning, styled in frontend
}
```

### ❌ Over-fetching
```typescript
// Bad: Fetching all fields
const posts = await client.getEntries({ content_type: 'post' })

// Good: Select only needed fields
const posts = await client.getEntries({
  content_type: 'post',
  select: ['fields.title', 'fields.slug', 'fields.excerpt']
})
```

### ❌ No Type Safety
```typescript
// Bad
const post = await getPost(slug)
console.log(post.data.title)  // No type checking

// Good
interface Post {
  title: string
  slug: string
  content: Document
}
const post = await getPost<Post>(slug)
console.log(post.title)  // Type-safe
```

### ❌ Hard-coded Content
```typescript
// Bad: Mixing CMS content with hard-coded strings
<h1>{post.title}</h1>
<p>Read time: 5 minutes</p>  // Hard-coded!

// Good: All content from CMS
<h1>{post.title}</h1>
<p>{post.readTime}</p>
```
