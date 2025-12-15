# Neo4j Graph Schema for TeacherHelper

This document describes the Neo4j graph database schema for storing semantic relationships between books, chunks, and other entities in the TeacherHelper knowledge base.

## Overview

Neo4j is used alongside PostgreSQL (with pgvector) to store graph relationships that enable:

- Semantic connections between related chunks
- Topic/concept hierarchies
- Cross-book relationships
- Knowledge graph queries for enhanced retrieval

## Node Types

### Book Node

Represents a book in the knowledge base.

```cypher
(:Book {
  id: String,           // Matches PostgreSQL Book.id (cuid)
  title: String,
  subject: String,
  gradeBand: String,
  language: String
})
```

### Chunk Node

Represents a text chunk from a book.

```cypher
(:Chunk {
  id: String,           // Matches PostgreSQL Chunk.id (cuid)
  bookId: String,       // Reference to parent book
  chapter: String?,
  section: String?,
  pageStart: Int?,
  pageEnd: Int?,
  tokenCount: Int,
  sequence: Int,
  hash: String          // For deduplication
})
```

### Concept Node

Represents an extracted concept/topic from chunks.

```cypher
(:Concept {
  id: String,
  name: String,
  type: String,         // e.g., "TOPIC", "TERM", "STANDARD"
  subject: String?,
  gradeBand: String?
})
```

### Standard Node (Future)

Represents educational standards (Common Core, NGSS, etc.)

```cypher
(:Standard {
  id: String,
  code: String,         // e.g., "CCSS.ELA-LITERACY.RI.6.1"
  description: String,
  subject: String,
  gradeLevel: String,
  framework: String     // e.g., "CommonCore", "NGSS"
})
```

## Relationship Types

### CONTAINS

Book contains chunks.

```cypher
(:Book)-[:CONTAINS {sequence: Int}]->(:Chunk)
```

### FOLLOWS

Sequential ordering of chunks within a book.

```cypher
(:Chunk)-[:FOLLOWS]->(:Chunk)
```

### RELATED_TO

Semantic similarity between chunks (based on embeddings).

```cypher
(:Chunk)-[:RELATED_TO {
  score: Float,         // Similarity score (0-1)
  method: String        // "embedding", "keyword", "manual"
}]->(:Chunk)
```

### MENTIONS

Chunk mentions a concept.

```cypher
(:Chunk)-[:MENTIONS {
  frequency: Int,
  prominence: Float     // How prominently featured (0-1)
}]->(:Concept)
```

### COVERS

Chunk covers an educational standard.

```cypher
(:Chunk)-[:COVERS {
  alignment: Float      // How well it aligns (0-1)
}]->(:Standard)
```

### PREREQUISITE_OF

Concept prerequisite relationships for learning paths.

```cypher
(:Concept)-[:PREREQUISITE_OF]->(:Concept)
```

## Indexes

```cypher
// Primary indexes
CREATE INDEX chunk_id_idx FOR (c:Chunk) ON (c.id);
CREATE INDEX book_id_idx FOR (b:Book) ON (b.id);
CREATE INDEX concept_name_idx FOR (co:Concept) ON (co.name);

// Composite indexes for common queries
CREATE INDEX chunk_book_idx FOR (c:Chunk) ON (c.bookId);
CREATE INDEX concept_subject_idx FOR (co:Concept) ON (co.subject);
```

## Common Query Patterns

### Find Related Chunks

```cypher
MATCH (c:Chunk {id: $chunkId})-[:RELATED_TO]->(related:Chunk)
WHERE related.bookId <> c.bookId  // Cross-book relationships
RETURN related
ORDER BY r.score DESC
LIMIT 10
```

### Find Chunks by Concept

```cypher
MATCH (co:Concept {name: $conceptName})<-[:MENTIONS]-(c:Chunk)
RETURN c
ORDER BY c.sequence
```

### Build Concept Map for Book

```cypher
MATCH (b:Book {id: $bookId})-[:CONTAINS]->(c:Chunk)-[:MENTIONS]->(co:Concept)
WITH co, COUNT(c) as mentions
RETURN co.name, mentions
ORDER BY mentions DESC
```

### Find Learning Path

```cypher
MATCH path = (start:Concept {name: $startConcept})-[:PREREQUISITE_OF*1..5]->(end:Concept {name: $endConcept})
RETURN path
ORDER BY LENGTH(path)
LIMIT 1
```

## Data Synchronization

### PostgreSQL -> Neo4j Sync

When a chunk is created in PostgreSQL:

1. Create corresponding Chunk node in Neo4j
2. Store Neo4j node ID in PostgreSQL `Chunk.neo4jNodeId`
3. Create CONTAINS relationship to Book
4. Create FOLLOWS relationship to previous chunk

### Embedding-Based Relationships

After embeddings are generated:

1. Compute similarity scores between chunk embeddings
2. Create RELATED_TO relationships for chunks with similarity > threshold
3. Store relationship scores

### Concept Extraction

After NLP processing:

1. Extract concepts/entities from chunk text
2. Create or find existing Concept nodes
3. Create MENTIONS relationships with frequency/prominence

## Best Practices

1. **Keep nodes lightweight**: Store full text in PostgreSQL, only metadata in Neo4j
2. **Use batch operations**: Create relationships in batches for performance
3. **Maintain referential integrity**: Always sync PostgreSQL and Neo4j IDs
4. **Prune weak relationships**: Periodically remove RELATED_TO edges below threshold
5. **Index strategically**: Only index properties used in WHERE clauses

## Future Considerations

- **Multi-tenancy**: Add `tenantId` property to all nodes
- **Versioning**: Track relationship changes over time
- **Standards Alignment**: Import educational standards and align chunks
- **User Interactions**: Track which chunks users find helpful
