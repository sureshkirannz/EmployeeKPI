import { storage } from "./storage";
import { hashPassword } from "./auth";

async function seed() {
  console.log("Seeding database...");

  try {
    // Create admin user
    const adminExists = await storage.getUserByUsername("admin");
    if (!adminExists) {
      const adminPasswordHash = await hashPassword("admin123");
      await storage.createUser({
        username: "admin",
        passwordHash: adminPasswordHash,
        role: "admin",
        employeeName: "System Administrator",
      });
      console.log("✓ Admin user created (username: admin, password: admin123)");
    } else {
      console.log("✓ Admin user already exists");
    }

    console.log("\nDatabase seeded successfully!");
    console.log("\nLogin credentials:");
    console.log("Admin: username=admin, password=admin123");
  } catch (error) {
    console.error("Error seeding database:", error);
    throw error;
  }
}

seed()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
