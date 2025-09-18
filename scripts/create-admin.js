const { sequelize, Admin, initializeDatabase } = require("../lib/sequelize");

async function createDefaultAdmin() {
  try {
    console.log("🚀 Creating default admin user...");

    // Initialize database connection
    await initializeDatabase();

    // Check if admin already exists
    const existingAdmin = await Admin.findOne({
      where: { username: "admin" },
    });

    if (existingAdmin) {
      console.log("✅ Admin user already exists");
      console.log("Username: admin");
      console.log("Password: admin123");
      process.exit(0);
    }

    // Create default admin with plain text password
    const admin = await Admin.create({
      username: "admin",
      password: "admin123",
      role: "SUPER_ADMIN",
      is_active: true,
    });

    console.log("✅ Default admin user created successfully!");
    console.log("Username: admin");
    console.log("Password: admin123");
    console.log("Role: SUPER_ADMIN");
    console.log("ID:", admin.id);

    process.exit(0);
  } catch (error) {
    console.error("❌ Failed to create admin user:", error.message);
    process.exit(1);
  }
}

createDefaultAdmin();
