const { DataTypes, Model } = require("sequelize");
const sequelize = require("../config/db");

class Job extends Model {}

Job.init(
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    employer_id: { type: DataTypes.INTEGER, allowNull: false },
    title: { type: DataTypes.STRING(200), allowNull: false },
    description: { type: DataTypes.TEXT, allowNull: false },
    requirements: { type: DataTypes.TEXT, allowNull: true },
    responsibilities: { type: DataTypes.TEXT, allowNull: true },
    location: { type: DataTypes.STRING(150), allowNull: true },
    job_type: {
      type: DataTypes.ENUM(
        "full_time",
        "part_time",
        "contract",
        "internship",
        "remote",
      ),
      allowNull: false,
    },
    experience_level: {
      type: DataTypes.ENUM("fresher", "junior", "mid", "senior", "lead"),
      allowNull: true,
    },
    salary_min: { type: DataTypes.INTEGER, allowNull: true },
    salary_max: { type: DataTypes.INTEGER, allowNull: true },
    salary_currency: { type: DataTypes.STRING(10), defaultValue: "INR" },
    skills_required: {
      type: DataTypes.JSON,
      allowNull: true,
      defaultValue: [],
    },
    category: { type: DataTypes.STRING(100), allowNull: true },
    vacancies: { type: DataTypes.INTEGER, defaultValue: 1 },
    application_deadline: { type: DataTypes.DATEONLY, allowNull: true },
    status: {
      type: DataTypes.ENUM("active", "closed", "draft"),
      defaultValue: "active",
    },
    views: { type: DataTypes.INTEGER, defaultValue: 0 },
    is_inactive: { type: DataTypes.BOOLEAN, defaultValue: false },
    department: {
      type: DataTypes.ENUM(
        "engineering_software_qa",
        "sales_business_development",
        "finance_accounting",
        "human_resources",
        "marketing",
        "operations",
        "design_creative",
        "customer_support",
      ),
      allowNull: true,
    },
    nature_of_business: {
      type: DataTypes.ENUM("b2b", "b2c", "b2b_b2c", "d2c"),
      allowNull: true,
    },
    experience_level: {
      type: DataTypes.ENUM(
        "fresher",
        "junior",
        "mid",
        "senior",
        "lead",
        "manager",
      ),
      allowNull: true,
    },
  },
  {
    sequelize,
    modelName: "Job",
    tableName: "jobs",
    timestamps: true,
    underscored: true,
  },
);

module.exports = Job;
