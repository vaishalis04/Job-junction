const sequelize = require("../config/db");

const User             = require("./user.model");
const JobSeekerProfile = require("./jobSeekerProfile.model");
const EmployerProfile  = require("./employerProfile.model");
const Job              = require("./job.model");
const Application      = require("./application.model");

// ── Associations ─────────────────────────────────────────────────────────────

// User → JobSeekerProfile (1:1)
User.hasOne(JobSeekerProfile, { foreignKey: "user_id", as: "seekerProfile" });
JobSeekerProfile.belongsTo(User, { foreignKey: "user_id", as: "user" });

// User → EmployerProfile (1:1)
User.hasOne(EmployerProfile, { foreignKey: "user_id", as: "employerProfile" });
EmployerProfile.belongsTo(User, { foreignKey: "user_id", as: "user" });

// User (employer) → Job (1:N)
User.hasMany(Job, { foreignKey: "employer_id", as: "jobs" });
Job.belongsTo(User, { foreignKey: "employer_id", as: "employer" });

// User (seeker) → Application (1:N)
User.hasMany(Application, { foreignKey: "applicant_id", as: "applications" });
Application.belongsTo(User, { foreignKey: "applicant_id", as: "applicant" });

// Job → Application (1:N)
Job.hasMany(Application, { foreignKey: "job_id", as: "applications" });
Application.belongsTo(Job, { foreignKey: "job_id", as: "job" });

module.exports = { sequelize, User, JobSeekerProfile, EmployerProfile, Job, Application };
