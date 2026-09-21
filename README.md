# 📋 Kanban AI Web Application

A modern, responsive full-stack Kanban board web application with AI capabilities, built with **Next.js (App Router)**, **TypeScript**, **Tailwind CSS**, and **Prisma ORM**.

---

## 🗄️ Database Architecture & Schema

The data model provides the relational backbone for columns, cards, and subtask checklists with ordering, priority management, and cascade deletions.

### Entity Relationship Diagram (ERD)

```mermaid
erDiagram
    COLUMN ||--o{ CARD : contains
    CARD ||--o{ SUBTASK : contains

    COLUMN {
        string id PK "cuid"
        string title "Column header (e.g. To Do, In Progress)"
        int order "Display order (0-indexed)"
        datetime createdAt "Timestamp"
        datetime updatedAt "Timestamp"
    }

    CARD {
        string id PK "cuid"
        string title "Task title"
        string description "Optional markdown description"
        enum priority "LOW | MEDIUM | HIGH | URGENT"
        int order "Position within column"
        datetime dueDate "Optional completion deadline"
        string columnId FK "References Column(id)"
        datetime createdAt "Timestamp"
        datetime updatedAt "Timestamp"
    }

    SUBTASK {
        string id PK "cuid"
        string title "Checklist item label"
        boolean completed "Checklist completion status"
        int order "Display order within card"
        string cardId FK "References Card(id)"
        datetime createdAt "Timestamp"
        datetime updatedAt "Timestamp"
    }
```

### Models Overview

| Model | Key Fields | Constraints & Relations |
| :--- | :--- | :--- |
| **`Column`** | `id`, `title`, `order`, `createdAt`, `updatedAt` | Has many `Card`s. Indexed on `order`. |
| **`Card`** | `id`, `title`, `description`, `priority`, `order`, `dueDate`, `columnId` | Belongs to `Column` (`onDelete: Cascade`). Has many `Subtask`s. Indexed on `columnId` and `order`. |
| **`Subtask`** | `id`, `title`, `completed`, `order`, `cardId` | Belongs to `Card` (`onDelete: Cascade`). Indexed on `cardId` and `order`. |

---

## 🚀 Getting Started

### 1. Prerequisites
- **Node.js**: `v18+` (tested on Node v20 / v24)
- **npm** or **pnpm**

### 2. Installation & Configuration

Clone the repository and install dependencies:

```bash
git clone https://github.com/devloot-xyz/devloot-open-source-test.git
cd devloot-open-source-test
npm install
```

Copy the environment configuration:

```bash
cp .env.example .env
```

The default `.env` is configured for **SQLite** (`file:./dev.db`), providing an immediate zero-configuration local environment.

> **Using PostgreSQL?**  
> To switch to PostgreSQL, update `provider = "postgresql"` in `prisma/schema.prisma` and provide your connection string in `.env`:
> ```env
> DATABASE_URL="postgresql://user:password@localhost:5432/kanban_db?schema=public"
> ```

---

## 🛠️ Database Management Commands

| Command | Action |
| :--- | :--- |
| `npm run db:generate` | Generates the strongly-typed Prisma Client (`@prisma/client`) |
| `npm run db:migrate` | Runs Prisma migrations in development mode |
| `npm run db:seed` | Seeds the database with default columns (`To Do`, `In Progress`, `Review`, `Done`), realistic cards, and subtasks |
| `npm run db:verify` | Executes the automated test suite verifying models, relations, ordering, and cascade deletions |
| `npm run db:studio` | Launches Prisma Studio GUI at `http://localhost:5555` to browse data |

---

## 🧪 Automated Verification Suite

Run the included verification script to ensure schema integrity and cascade functionality:

```bash
npm run db:verify
```

Expected output:
```text
🧪 Running Database Schema & Relation Verifications...

✅ [1/5] Column count verified: 4 columns loaded in order.
✅ [2/5] Column ordering and default titles match requirements.
✅ [3/5] Cards verified: 7 cards across priorities: HIGH, MEDIUM, LOW, URGENT.
✅ [4/5] Subtasks verified: 15 checklist items correctly linked to parent cards.
  🔄 Testing Cascade Deletions...
✅ [5/5] Cascade deletion validated: Deleting a column automatically cascades to cards and subtasks.

🎉 ALL 5 DATABASE VERIFICATION CHECKS PASSED PERFECTLY! 🚀
```

---

## 📦 Project Structure

```text
├── prisma/
│   ├── migrations/
│   │   └── 20260921193426_init/
│   │       └── migration.sql      # Initial SQL DDL migration
│   ├── schema.prisma              # Prisma relational models and indexes
│   └── seed.ts                    # Reproducible seed script
├── scripts/
│   └── verify-db.ts               # End-to-end database verification script
├── src/
│   └── lib/
│       └── prisma.ts              # Singleton Prisma client instance
├── .env.example                   # Environment configuration template
├── .gitignore                     # Git ignore rules
├── package.json                   # Project scripts and dependencies
└── tsconfig.json                  # Strict TypeScript configuration
```
