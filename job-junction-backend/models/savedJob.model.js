const { DataTypes, Model } = require("sequelize");
const sequelize = require("../config/db");

class SavedJob extends Model {}

SavedJob.init(
  {
    id:           { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    user_id:      { type: DataTypes.INTEGER, allowNull: false },
    job_id:       { type: DataTypes.INTEGER, allowNull: false },
  },
  {
    sequelize,
    modelName:  "SavedJob",
    tableName:  "saved_jobs",
    timestamps: true,
    underscored: true,
    indexes: [
      { unique: true, fields: ["user_id", "job_id"] }, 
    ],
  }
);

module.exports = SavedJob;