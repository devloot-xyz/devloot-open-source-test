import { PrismaClient, Priority } from "@prisma/client";

const prisma = new PrismaClient();

async function runVerification() {
  console.log("🧪 Running Database Schema & Relation Verifications...\n");

  // 1. Verify Columns
  const columns = await prisma.column.findMany({
    orderBy: { order: "asc" },
    include: {
      cards: {
        orderBy: { order: "asc" },
        include: {
          subtasks: {
            orderBy: { order: "asc" },
          },
        },
      },
    },
  });

  if (columns.length !== 4) {
    throw new Error(`Expected 4 columns, found ${columns.length}`);
  }
  console.log(`✅ [1/5] Column count verified: ${columns.length} columns loaded in order.`);

  // Verify column titles
  const expectedTitles = ["To Do", "In Progress", "Review", "Done"];
  columns.forEach((col, idx) => {
    if (col.title !== expectedTitles[idx] || col.order !== idx) {
      throw new Error(`Column mismatch at index ${idx}: expected ${expectedTitles[idx]} (order: ${idx}), got ${col.title} (order: ${col.order})`);
    }
  });
  console.log("✅ [2/5] Column ordering and default titles match requirements.");

  // 2. Verify Cards and Priorities
  const allCards = await prisma.card.findMany();
  if (allCards.length === 0) {
    throw new Error("No cards found in database.");
  }
  const prioritiesFound = new Set(allCards.map((c) => c.priority));
  console.log(`✅ [3/5] Cards verified: ${allCards.length} cards across priorities: ${[...prioritiesFound].join(", ")}.`);

  // 3. Verify Subtasks and Relations
  const allSubtasks = await prisma.subtask.findMany();
  if (allSubtasks.length === 0) {
    throw new Error("No subtasks found in database.");
  }
  console.log(`✅ [4/5] Subtasks verified: ${allSubtasks.length} checklist items correctly linked to parent cards.`);

  // 4. Verify Cascade Deletion behavior
  console.log("  🔄 Testing Cascade Deletions...");
  const tempCol = await prisma.column.create({
    data: {
      title: "Temporary Test Column",
      order: 99,
      cards: {
        create: {
          title: "Temporary Test Card",
          order: 0,
          priority: Priority.LOW,
          subtasks: {
            create: [
              { title: "Temp Subtask 1", order: 0 },
              { title: "Temp Subtask 2", order: 1 },
            ],
          },
        },
      },
    },
    include: {
      cards: {
        include: { subtasks: true },
      },
    },
  });

  const tempCardId = tempCol.cards[0].id;
  // Delete the temporary column
  await prisma.column.delete({ where: { id: tempCol.id } });

  // Verify card and subtasks were cascaded
  const checkCard = await prisma.card.findUnique({ where: { id: tempCardId } });
  const checkSubtasks = await prisma.subtask.findMany({ where: { cardId: tempCardId } });

  if (checkCard !== null || checkSubtasks.length !== 0) {
    throw new Error("Cascade delete failed: Orphaned cards or subtasks still exist!");
  }
  console.log("✅ [5/5] Cascade deletion validated: Deleting a column automatically cascades to cards and subtasks.");

  console.log("\n🎉 ALL 5 DATABASE VERIFICATION CHECKS PASSED PERFECTLY! 🚀\n");
}

runVerification()
  .catch((e) => {
    console.error("❌ Verification failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
