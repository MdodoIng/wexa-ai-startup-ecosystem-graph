# StartupGraph - Startup Ecosystem & Investment Network

A full-stack graph database application built with **CognoDB** (Neo4j-compatible) that models the startup ecosystem — tracking startups, investors, founders, funding rounds, and markets as an interconnected graph.

## Why a Graph Database?

A relational database would struggle with this use case because the most valuable insights come from **relationships and paths**, not isolated entities:

| Question                                        | SQL Complexity                  | Graph Complexity         |
| ----------------------------------------------- | ------------------------------- | ------------------------ |
| "Which investors have exposure to AI startups?" | Multiple JOINs across 4+ tables | Single 2-hop traversal   |
| "Find founders advising their competitors"      | Self-joins + recursive CTEs     | Natural pattern match    |
| "Shortest path for a warm intro"                | Nearly impossible efficiently   | Built-in shortestPath()  |
| "Which competing startups share investors?"     | Complex subqueries              | Direct relationship walk |

Graph databases treat relationships as first-class citizens, making multi-hop traversals (2-4 hops) performant and expressive. The `shortestPath` and variable-length path queries would require recursive CTEs or application-level code in SQL, but are native operations in Cypher.

## Data Model

(:Startup)-[:RAISED]->(:FundingRound)<-[:INVESTED_IN]-(:Investor)
(:Founder)-[:FOUNDED]->(:Startup)
(:Startup)-[:OPERATES_IN]->(:Market)
(:Startup)-[:COMPETES_WITH]->(:Startup)
(:Founder)-[:ADVISOR]->(:Startup)
(:Investor)-[:CO_INVESTOR]->(:Investor)

### Node Types

- **Startup**: Companies with stage, valuation, employees, HQ
- **Investor**: VCs, accelerators, hedge funds with AUM and focus
- **Founder**: People with roles and backgrounds
- **FundingRound**: Individual rounds with amount, date, valuation
- **Market**: Industry verticals with size and growth

### Relationship Types

- **FOUNDED**: Founder → Startup (with date)
- **INVESTED_IN**: Investor → FundingRound (with amount)
- **RAISED**: Startup → FundingRound
- **OPERATES_IN**: Startup → Market
- **COMPETES_WITH**: Startup ↔ Startup
- **ADVISOR**: Founder → Startup (with expertise)
- **CO_INVESTOR**: Investor ↔ Investor (with shared round count)

## Tech Stack

- **Database**: CognoDB Cloud (Neo4j-compatible, Bolt protocol)
- **Backend**: Node.js, Express, official Neo4j driver
- **Frontend**: React, React Router, D3.js (force-directed graph), Lucide icons
- **Protocol**: Bolt 5.0+ over `bolt+s://`

## Setup Instructions

### 1. Create CognoDB Cloud Instance

1. Go to [https://console.cognodb.com/signup](https://console.cognodb.com/signup) and create a free account
2. Create a free (c0) instance and pick a region
3. Save your connection URI: `bolt+s://<instance-id>.databases.cognodb.cloud`
4. Copy the generated password (shown exactly once!)

### 2. Clone and Install

```bash
git clone <repo-url>
cd wexa-cognodb-app
npm run install:all
```
