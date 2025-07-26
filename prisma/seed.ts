import { PrismaClient } from "@prisma/client";
import { hashPassword } from "../src/lib/auth";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");

  // Create admin user
  const adminPassword = await hashPassword("admin123");
  const admin = await prisma.user.upsert({
    where: { email: "admin@tangibly.com" },
    update: {},
    create: {
      email: "admin@tangibly.com",
      name: "Admin User",
      password: adminPassword,
      role: "ADMIN",
    },
  });

  // Create regular user
  const userPassword = await hashPassword("user123");
  const user = await prisma.user.upsert({
    where: { email: "user@tangibly.com" },
    update: {},
    create: {
      email: "user@tangibly.com",
      name: "Regular User",
      password: userPassword,
      role: "USER",
    },
  });

  // Create sample posts
  await prisma.post.createMany({
    data: [
      {
        title: "Getting Started with Next.js",
        content:
          "This is a comprehensive guide to building modern web applications with Next.js...",
        published: true,
        authorId: admin.id,
      },
      {
        title: "Building APIs with Prisma",
        content:
          "Learn how to create robust APIs using Prisma and PostgreSQL...",
        published: true,
        authorId: user.id,
      },
      {
        title: "Draft Post",
        content: "This is a draft post that hasn't been published yet...",
        published: false,
        authorId: user.id,
      },
    ],
    skipDuplicates: true,
  });

  console.log("✅ Database seeded successfully!");
  console.log("📧 Admin: admin@tangibly.com (password: admin123)");
  console.log("📧 User: user@tangibly.com (password: user123)");
}

main()
  .catch(e => {
    console.error("❌ Error seeding database:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
