const { DataTypes, Model } = require("sequelize");
const sequelize = require("../config/db");

class Application extends Model {}

Application.init(
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    job_id: { type: DataTypes.INTEGER, allowNull: false },
    applicant_id: { type: DataTypes.INTEGER, allowNull: false },
    resume: { type: DataTypes.STRING(255), allowNull: true },
    cover_letter: { type: DataTypes.TEXT, allowNull: true },
    status: {
      type: DataTypes.ENUM("applied", "shortlisted", "interview", "rejected", "hired"),
      defaultValue: "applied",
    },
    employer_notes: { type: DataTypes.TEXT, allowNull: true },
    is_withdrawn: { type: DataTypes.BOOLEAN, defaultValue: false },
  },
  {
    sequelize,
    modelName: "Application",
    tableName: "applications",
    timestamps: true,
    underscored: true,
    indexes: [
      { unique: true, fields: ["job_id", "applicant_id"] }, // one application per job per user
    ],
  }
);

module.exports = Application;
