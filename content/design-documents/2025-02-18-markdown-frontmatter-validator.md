---
title: "Markdown Frontmatter Validator"
date: "2025-02-18"
authors:
  - "jathurchan"
projects:
  - "63"
  - "102"
---

## Background

DiveCode.io is built using Next.js and uses Markdown files (stored in the `content/` directory) that include YAML frontmatter metadata. This metadata is essential for page generation, project linking (issue with label `project`), related content mapping, author attribution and overall site generation.

Because the content is updated frequently, manually reviewing frontmatter metadata during code reviews has become both time-consuming and error-prone. Missing required fields, incorrect data types, or invalid links can slip through, potentially leading to runtime failures without providing clear feedback.

To address these challenges, we need an automated validation mechanism. This tool should run both locally during development and as part of our CI/CD pipeline (for instance, on GitHub before merging pull requests), ensuring accurate metadata and reducing the likelihood of errors.

## Problem Statement

The goal is to implement a reliable and efficient `validateMarkdownFrontMatter` method in Typescript. Specifically, it should:

1. Validate all required and optional fields according to a predefined schema
2. Provide clear, actionable error messages
3. Ensure type safety and consistency
4. Be maintainable and extensible

## Proposed Solution

Several approaches for automatically validating the Markdown frontmatter were considered:

### 1. Using AJV (Another JSON Schema Validator)

Pros:

- Mature and widely adopted with a robust ecosystem.
- Leverages JSON Schema for clear and declarative definitions.
- Excellent error reporting and support for complex validation (including custom formats).
- Can automatically enforce strict validation rules (e.g., no additional properties).

Cons:

- Requires understanding of JSON Schema syntax.
- Some learning curve for configuring custom formats (e.g., converting date strings to Date objects).

### 2. Zod

Pros:

- TypeScript-first library with excellent integration, providing static type inference.
- Intuitive API for many developers familiar with functional programming.
- Clear error messages and composability.

Cons:

- Slightly less mature ecosystem compared to AJV.
- Some limitations when working with highly complex validation logic or non-standard formats.

#### 3. Custom Validation Code

Pros:

- Fully customizable and flexible.
- No dependencies on external libraries.
- Tailored error messages and control over the validation process.

Cons:

- Reinvents the wheel and increases maintenance burden.
- Harder to scale as the complexity of metadata requirements grows.
- Higher risk of introducing bugs in the validation logic.

### Recommended Solution

Using AJV with a well-defined JSON Schema to validate and parse Markdown frontmatter as it is easy to extend the schema as new fields and constraints arise, get clear and structured error messages, and set maintenable validation rules.

## Implementation Plan

- Define the JSON schema.
- Implement the validator.
- Write comprehensive tests.
