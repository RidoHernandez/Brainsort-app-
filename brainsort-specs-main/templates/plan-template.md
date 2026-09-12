# Technical Plan: [Feature Name]

## 1. Architectural Impact
How does this feature interact with our existing stack? Does it require a new database table, a new API endpoint, or modifying an existing middleware?

## 2. API Design (if applicable)
Define the payload syntax.
```json
// POST /api/example
{
  "key": "type"
}
```

## 3. Data Models
List changes to schemas, ORM entities, or database structures.

## 4. Third-Party Integrations
Do we need new external libraries? Why?

## 5. Security & Validation
How will input data be sanitised? Does this expose any sensitive logic?

---
*Note: This document explains "How" the feature relies on our stack. See the `.spec.md` for "What" the feature is.*
