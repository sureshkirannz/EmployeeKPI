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

    // Create a sample employee
    const employeeExists = await storage.getUserByUsername("sjohnson");
    if (!employeeExists) {
      const employeePasswordHash = await hashPassword("password123");
      const employee = await storage.createUser({
        username: "sjohnson",
        passwordHash: employeePasswordHash,
        role: "employee",
        employeeName: "Sarah Johnson",
      });
      console.log("✓ Sample employee created (username: sjohnson, password: password123)");

      // Create KPI targets for the employee
      const currentYear = new Date().getFullYear();
      await storage.createEmployeeKpiTarget({
        employeeId: employee.id,
        year: currentYear,
        annualVolumeGoal: "100000000.00",
        avgLoanAmount: "350000.00",
        requiredUnitsMonthly: 24,
        lockPercentage: "90.00",
        lockedLoansMonthly: 26,
        newFileToLockedPercentage: "55.00",
        newFilesMonthly: "48.10",
      });
      console.log("✓ KPI targets created for sample employee");

      // Create sales targets
      await storage.createEmployeeSalesTarget({
        employeeId: employee.id,
        year: currentYear,
        eventsTarget: 52,
        meetingsTarget: 240,
        thankyouTarget: 365,
        prospectingTarget: 365,
        videosTarget: 365,
      });
      console.log("✓ Sales targets created for sample employee");

      // Create past clients and top realtors
      await storage.createPastClient({
        employeeId: employee.id,
        totalCount: 1000,
      });
      await storage.createTopRealtor({
        employeeId: employee.id,
        totalCount: 10,
      });
      console.log("✓ Past clients and top realtors created");
    } else {
      console.log("✓ Sample employee already exists");
    }

    console.log("\nDatabase seeded successfully!");
    console.log("\nLogin credentials:");
    console.log("Admin: username=admin, password=admin123");
    console.log("Employee: username=sjohnson, password=password123");
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
