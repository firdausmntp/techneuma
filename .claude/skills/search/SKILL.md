---
name: search
description: 
---

---
name: search
description: Expert search implementation with Elasticsearch, Algolia, Meilisearch, and full-text search patterns
---

# Search Specialist

You are an expert in search implementation. Apply these principles for fast, relevant search experiences.

## Core Philosophy

- **Relevance** — Return what users actually want
- **Speed** — Sub-100ms response times
- **Fault tolerance** — Typos, synonyms, partial matches
- **Faceting** — Filter and explore results

## Search Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    SEARCH PIPELINE                          │
├─────────────────────────────────────────────────────────────┤
│  1. INDEXING                                                │
│     Source Data → Transform → Index Documents               │
│                                                             │
│  2. QUERYING                                                │
│     User Input → Parse → Search → Rank → Return             │
│                                                             │
│  3. RELEVANCE TUNING                                        │
│     Analyzers → Boosting → Synonyms → Personalization       │
└─────────────────────────────────────────────────────────────┘
```

## Meilisearch

### Setup & Indexing
```typescript
import { MeiliSearch } from 'meilisearch'

const client = new MeiliSearch({
  host: process.env.MEILISEARCH_HOST!,
  apiKey: process.env.MEILISEARCH_API_KEY
})

// Create index with settings
async function setupProductsIndex() {
  const index = client.index('products')
  
  // Configure searchable attributes (order matters for relevance)
  await index.updateSearchableAttributes([
    'name',
    'description',
    'brand',
    'categories',
    'tags'
  ])
  
  // Configure filterable attributes
  await index.updateFilterableAttributes([
    'price',
    'brand',
    'categories',
    'inStock',
    'rating'
  ])
  
  // Configure sortable attributes
  await index.updateSortableAttributes([
    'price',
    'rating',
    'createdAt'
  ])
  
  // Configure ranking rules
  await index.updateRankingRules([
    'words',
    'typo',
    'proximity',
    'attribute',
    'sort',
    'exactness',
    'rating:desc'  // Custom rule
  ])
  
  // Synonyms
  await index.updateSynonyms({
    'phone': ['smartphone', 'mobile', 'cellphone'],
    'laptop': ['notebook', 'computer'],
    'tv': ['television', 'screen']
  })
}

// Index documents
async function indexProducts(products: Product[]) {
  const index = client.index('products')
  
  // Transform for search
  const documents = products.map(p => ({
    id: p.id,
    name: p.name,
    description: p.description,
    brand: p.brand,
    categories: p.categories,
    tags: p.tags,
    price: p.price,
    inStock: p.inStock,
    rating: p.rating,
    image: p.images[0],
    createdAt: p.createdAt.getTime()
  }))
  
  await index.addDocuments(documents)
}
```

### Searching
```typescript
async function searchProducts(query: string, options: SearchOptions = {}) {
  const index = client.index('products')
  
  const result = await index.search(query, {
    // Pagination
    limit: options.limit ?? 20,
    offset: options.offset ?? 0,
    
    // Filters
    filter: buildFilters(options.filters),
    
    // Sorting
    sort: options.sort ? [options.sort] : undefined,
    
    // Facets
    facets: ['brand', 'categories', 'rating'],
    
    // Highlighting
    attributesToHighlight: ['name', 'description'],
    highlightPreTag: '<mark>',
    highlightPostTag: '</mark>',
    
    // Return only needed fields
    attributesToRetrieve: ['id', 'name', 'price', 'image', 'brand']
  })
  
  return {
    hits: result.hits,
    total: result.estimatedTotalHits,
    facets: result.facetDistribution,
    processingTimeMs: result.processingTimeMs
  }
}

function buildFilters(filters?: Record<string, any>): string | undefined {
  if (!filters) return undefined
  
  const conditions: string[] = []
  
  if (filters.minPrice !== undefined) {
    conditions.push(`price >= ${filters.minPrice}`)
  }
  if (filters.maxPrice !== undefined) {
    conditions.push(`price <= ${filters.maxPrice}`)
  }
  if (filters.brands?.length) {
    conditions.push(`brand IN [${filters.brands.map(b => `"${b}"`).join(', ')}]`)
  }
  if (filters.categories?.length) {
    conditions.push(`categories IN [${filters.categories.map(c => `"${c}"`).join(', ')}]`)
  }
  if (filters.inStock) {
    conditions.push('inStock = true')
  }
  if (filters.minRating) {
    conditions.push(`rating >= ${filters.minRating}`)
  }
  
  return conditions.length > 0 ? conditions.join(' AND ') : undefined
}
```

## Algolia

### Setup
```typescript
import algoliasearch from 'algoliasearch'

const client = algoliasearch(
  process.env.ALGOLIA_APP_ID!,
  process.env.ALGOLIA_ADMIN_KEY!
)

const index = client.initIndex('products')

// Configure index
await index.setSettings({
  searchableAttributes: [
    'name',
    'unordered(description)',
    'brand',
    'categories'
  ],
  attributesForFaceting: [
    'filterOnly(price)',
    'brand',
    'categories',
    'rating'
  ],
  customRanking: [
    'desc(popularity)',
    'desc(rating)'
  ],
  synonyms: [
    {
      objectID: 'phone-synonyms',
      type: 'synonym',
      synonyms: ['phone', 'smartphone', 'mobile']
    }
  ],
  typoTolerance: true,
  minWordSizefor1Typo: 4,
  minWordSizefor2Typos: 8
})
```

### Search with InstantSearch (React)
```typescript
import { InstantSearch, SearchBox, Hits, RefinementList, Pagination } from 'react-instantsearch'
import algoliasearch from 'algoliasearch/lite'

const searchClient = algoliasearch(
  process.env.NEXT_PUBLIC_ALGOLIA_APP_ID!,
  process.env.NEXT_PUBLIC_ALGOLIA_SEARCH_KEY!
)

function SearchPage() {
  return (
    <InstantSearch searchClient={searchClient} indexName="products">
      <div className="search-layout">
        <aside className="filters">
          <h3>Brand</h3>
          <RefinementList attribute="brand" limit={10} showMore />
          
          <h3>Categories</h3>
          <RefinementList attribute="categories" />
          
          <h3>Rating</h3>
          <RatingMenu attribute="rating" />
        </aside>
        
        <main className="results">
          <SearchBox placeholder="Search products..." />
          <Stats />
          <Hits hitComponent={ProductHit} />
          <Pagination />
        </main>
      </div>
    </InstantSearch>
  )
}

function ProductHit({ hit }) {
  return (
    <article>
      <img src={hit.image} alt={hit.name} />
      <h2>
        <Highlight attribute="name" hit={hit} />
      </h2>
      <p>
        <Snippet attribute="description" hit={hit} />
      </p>
      <span className="price">${hit.price}</span>
    </article>
  )
}
```

## Elasticsearch

### Index Setup
```typescript
import { Client } from '@elastic/elasticsearch'

const client = new Client({
  node: process.env.ELASTICSEARCH_URL,
  auth: {
    apiKey: process.env.ELASTICSEARCH_API_KEY!
  }
})

// Create index with mappings
async function createProductsIndex() {
  await client.indices.create({
    index: 'products',
    body: {
      settings: {
        analysis: {
          analyzer: {
            product_analyzer: {
              type: 'custom',
              tokenizer: 'standard',
              filter: ['lowercase', 'asciifolding', 'product_synonyms', 'product_stemmer']
            }
          },
          filter: {
            product_synonyms: {
              type: 'synonym',
              synonyms: [
                'phone, smartphone, mobile',
                'laptop, notebook'
              ]
            },
            product_stemmer: {
              type: 'stemmer',
              language: 'english'
            }
          }
        }
      },
      mappings: {
        properties: {
          name: {
            type: 'text',
            analyzer: 'product_analyzer',
            fields: {
              keyword: { type: 'keyword' },
              suggest: { type: 'completion' }
            }
          },
          description: {
            type: 'text',
            analyzer: 'product_analyzer'
          },
          brand: {
            type: 'keyword'
          },
          categories: {
            type: 'keyword'
          },
          price: {
            type: 'float'
          },
          rating: {
            type: 'float'
          },
          inStock: {
            type: 'boolean'
          },
          createdAt: {
            type: 'date'
          }
        }
      }
    }
  })
}
```

### Complex Search Query
```typescript
async function searchProducts(query: string, filters: any, options: any) {
  const must: any[] = []
  const filter: any[] = []
  
  // Full-text search with boosting
  if (query) {
    must.push({
      multi_match: {
        query,
        fields: ['name^3', 'description', 'brand^2', 'categories'],
        type: 'best_fields',
        fuzziness: 'AUTO'
      }
    })
  }
  
  // Filters
  if (filters.brands?.length) {
    filter.push({ terms: { brand: filters.brands } })
  }
  if (filters.categories?.length) {
    filter.push({ terms: { categories: filters.categories } })
  }
  if (filters.minPrice || filters.maxPrice) {
    filter.push({
      range: {
        price: {
          gte: filters.minPrice,
          lte: filters.maxPrice
        }
      }
    })
  }
  if (filters.inStock) {
    filter.push({ term: { inStock: true } })
  }
  
  const result = await client.search({
    index: 'products',
    body: {
      query: {
        bool: {
          must: must.length ? must : [{ match_all: {} }],
          filter
        }
      },
      // Sorting
      sort: options.sort ? [
        { [options.sort.field]: options.sort.order }
      ] : [
        '_score',
        { rating: 'desc' }
      ],
      // Pagination
      from: options.offset || 0,
      size: options.limit || 20,
      // Aggregations for facets
      aggs: {
        brands: {
          terms: { field: 'brand', size: 50 }
        },
        categories: {
          terms: { field: 'categories', size: 50 }
        },
        price_ranges: {
          range: {
            field: 'price',
            ranges: [
              { to: 50 },
              { from: 50, to: 100 },
              { from: 100, to: 500 },
              { from: 500 }
            ]
          }
        },
        avg_rating: {
          avg: { field: 'rating' }
        }
      },
      // Highlighting
      highlight: {
        fields: {
          name: {},
          description: { fragment_size: 150 }
        },
        pre_tags: ['<mark>'],
        post_tags: ['</mark>']
      }
    }
  })
  
  return {
    hits: result.hits.hits.map(hit => ({
      ...hit._source,
      _score: hit._score,
      _highlight: hit.highlight
    })),
    total: result.hits.total.value,
    aggregations: result.aggregations
  }
}
```

### Autocomplete / Suggestions
```typescript
async function getSuggestions(prefix: string) {
  const result = await client.search({
    index: 'products',
    body: {
      suggest: {
        product_suggest: {
          prefix,
          completion: {
            field: 'name.suggest',
            size: 5,
            fuzzy: {
              fuzziness: 'AUTO'
            }
          }
        }
      }
    }
  })
  
  return result.suggest.product_suggest[0].options.map(opt => ({
    text: opt.text,
    score: opt._score
  }))
}
```

## PostgreSQL Full-Text Search

```typescript
// For simpler use cases, PostgreSQL works well

// Create search index
await prisma.$executeRaw`
  ALTER TABLE products ADD COLUMN IF NOT EXISTS search_vector tsvector;
  
  UPDATE products SET search_vector = 
    setweight(to_tsvector('english', coalesce(name, '')), 'A') ||
    setweight(to_tsvector('english', coalesce(description, '')), 'B') ||
    setweight(to_tsvector('english', coalesce(brand, '')), 'C');
  
  CREATE INDEX IF NOT EXISTS products_search_idx ON products USING gin(search_vector);
`

// Search function
async function searchProducts(query: string) {
  const results = await prisma.$queryRaw`
    SELECT 
      id, name, description, price, 
      ts_rank(search_vector, websearch_to_tsquery('english', ${query})) as rank,
      ts_headline('english', description, websearch_to_tsquery('english', ${query}),
        'StartSel=<mark>, StopSel=</mark>, MaxWords=35, MinWords=15'
      ) as highlight
    FROM products
    WHERE search_vector @@ websearch_to_tsquery('english', ${query})
    ORDER BY rank DESC
    LIMIT 20
  `
  
  return results
}
```

## Search UI Component

```typescript
'use client'

import { useState, useCallback } from 'react'
import { useDebounce } from 'use-debounce'

interface SearchResult {
  id: string
  name: string
  description: string
  highlight?: Record<string, string[]>
}

export function SearchBox() {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResult[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [debouncedQuery] = useDebounce(query, 300)
  
  const search = useCallback(async (q: string) => {
    if (!q.trim()) {
      setResults([])
      return
    }
    
    setIsLoading(true)
    try {
      const response = await fetch(`/api/search?q=${encodeURIComponent(q)}`)
      const data = await response.json()
      setResults(data.hits)
    } catch (error) {
      console.error('Search failed:', error)
    } finally {
      setIsLoading(false)
    }
  }, [])
  
  useEffect(() => {
    search(debouncedQuery)
  }, [debouncedQuery, search])
  
  return (
    <div className="search-container">
      <input
        type="search"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search..."
        aria-label="Search"
      />
      
      {isLoading && <Spinner />}
      
      {results.length > 0 && (
        <ul className="search-results" role="listbox">
          {results.map((result) => (
            <li key={result.id} role="option">
              <a href={`/products/${result.id}`}>
                <span 
                  dangerouslySetInnerHTML={{ 
                    __html: result.highlight?.name?.[0] || result.name 
                  }} 
                />
              </a>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
```

## Anti-Patterns

### ❌ Searching on Every Keystroke
```typescript
// Bad: API call on every character
<input onChange={(e) => search(e.target.value)} />

// Good: Debounce
const [debouncedQuery] = useDebounce(query, 300)
useEffect(() => { search(debouncedQuery) }, [debouncedQuery])
```

### ❌ No Loading/Empty States
```typescript
// Bad
return <Results data={results} />

// Good
if (isLoading) return <Skeleton />
if (results.length === 0) return <EmptyState query={query} />
return <Results data={results} />
```

### ❌ Indexing Everything
```typescript
// Bad: Index full HTML content
await index.addDocument({ content: fullHtmlPage })

// Good: Index only searchable text
await index.addDocument({ 
  title: extractText(page.title),
  content: stripHtml(page.body)
})
```

### ❌ No Typo Tolerance
```typescript
// Bad: Exact match only
query: { match: { name: { query: searchTerm } } }

// Good: With fuzziness
query: { match: { name: { query: searchTerm, fuzziness: 'AUTO' } } }
```
