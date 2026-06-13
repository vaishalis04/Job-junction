require("dotenv").config();
const { sequelize } = require("../models/index");

(async () => {
  try {
    await sequelize.authenticate();
    console.log("✅ MySQL connected");

    // alter: true updates existing tables safely (use force:true to drop & recreate)
    await sequelize.sync({ alter: true });
    console.log("✅ All tables synced successfully");
    process.exit(0);
  } catch (err) {
    console.error("❌ Sync failed:", err.message);
    process.exit(1);
  }
})();
