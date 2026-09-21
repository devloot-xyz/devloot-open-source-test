import { PrismaClient, Priority } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting database seeding...");

  // Clean existing data in cascade order
  await prisma.subtask.deleteMany();
  await prisma.card.deleteMany();
  await prisma.column.deleteMany();

  console.log("🧹 Cleared existing columns, cards, and subtasks.");

  const defaultColumns = [
    {
      title: "To Do",
      order: 0,
      cards: [
        {
          title: "Implement User Authentication",
          description: "Add support for OAuth and email magic link login using NextAuth or Supabase Auth.",
          priority: Priority.HIGH,
          order: 0,
          dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // in 5 days
          subtasks: [
            { title: "Configure auth provider secrets in .env", completed: false, order: 0 },
            { title: "Create login and signup page UI", completed: false, order: 1 },
            { title: "Implement session middleware for protected routes", completed: false, order: 2 },
          ],
        },
        {
          title: "Setup CI/CD Pipeline with GitHub Actions",
          description: "Automate linting, unit tests, and preview deployments on every Pull Request.",
          priority: Priority.MEDIUM,
          order: 1,
          dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
          subtasks: [
            { title: "Write workflow YAML for tsc and prisma validate", completed: true, order: 0 },
            { title: "Add test coverage badge to README", completed: false, order: 1 },
          ],
        },
        {
          title: "Explore Vector Search for Card Similarity",
          description: "Research embedding models to enable semantic duplicate card detection.",
          priority: Priority.LOW,
          order: 2,
          dueDate: null,
          subtasks: [],
        },
      ],
    },
    {
      title: "In Progress",
      order: 1,
      cards: [
        {
          title: "Design Responsive Kanban Board UI",
          description: "Build clean, accessible drag-and-drop board components using Tailwind CSS and @dnd-kit.",
          priority: Priority.URGENT,
          order: 0,
          dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
          subtasks: [
            { title: "Create Column and Card presentation components", completed: true, order: 0 },
            { title: "Wire drag-and-drop sensor listeners", completed: true, order: 1 },
            { title: "Handle optimistic state updates on card drop", completed: false, order: 2 },
          ],
        },
        {
          title: "Integrate LLM Task Breakdown Service",
          description: "Connect OpenAI or Anthropic API to parse complex task goals into checklist subtasks.",
          priority: Priority.HIGH,
          order: 1,
          dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
          subtasks: [
            { title: "Build prompt template for subtask decomposition", completed: true, order: 0 },
            { title: "Implement streaming response parser", completed: false, order: 1 },
          ],
        },
      ],
    },
    {
      title: "Review",
      order: 2,
      cards: [
        {
          title: "Prisma Schema & Relational Models",
          description: "Setup Column, Card, and Subtask models with cascade deletions, indexes, and seed data.",
          priority: Priority.HIGH,
          order: 0,
          dueDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000),
          subtasks: [
            { title: "Draft schema.prisma with models and relations", completed: true, order: 0 },
            { title: "Generate and test migrations with SQLite", completed: true, order: 1 },
            { title: "Create comprehensive seed script and verification tests", completed: true, order: 2 },
          ],
        },
      ],
    },
    {
      title: "Done",
      order: 3,
      cards: [
        {
          title: "Project Architecture & Repository Initialization",
          description: "Define technology stack: Next.js App Router, TypeScript, Tailwind CSS, Prisma ORM.",
          priority: Priority.MEDIUM,
          order: 0,
          dueDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
          subtasks: [
            { title: "Initialize package.json and tsconfig.json", completed: true, order: 0 },
            { title: "Configure .gitignore and environment variables", completed: true, order: 1 },
          ],
        },
      ],
    },
  ];

  for (const colData of defaultColumns) {
    const { cards, ...colFields } = colData;
    const createdColumn = await prisma.column.create({
      data: {
        ...colFields,
        cards: {
          create: cards.map((card) => {
            const { subtasks, ...cardFields } = card;
            return {
              ...cardFields,
              subtasks: {
                create: subtasks,
              },
            };
          }),
        },
      },
      include: {
        cards: {
          include: {
            subtasks: true,
          },
        },
      },
    });

    console.log(
      `  📁 Column created: "${createdColumn.title}" (order: ${createdColumn.order}) with ${createdColumn.cards.length} cards`
    );
  }

  const columnCount = await prisma.column.count();
  const cardCount = await prisma.card.count();
  const subtaskCount = await prisma.subtask.count();

  console.log("\n✅ Database seeding successfully completed!");
  console.log(`📊 Summary: ${columnCount} Columns, ${cardCount} Cards, ${subtaskCount} Subtasks.`);
}

main()
  .catch((e) => {
    console.error("❌ Seeding failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
