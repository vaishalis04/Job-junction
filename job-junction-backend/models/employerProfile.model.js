const { DataTypes, Model } = require("sequelize");
const sequelize = require("../config/db");

class EmployerProfile extends Model {}

EmployerProfile.init(
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    user_id: { type: DataTypes.INTEGER, allowNull: false, unique: true },
    company_name: { type: DataTypes.STRING(150), allowNull: false },
    company_logo: { type: DataTypes.STRING(255), allowNull: true },
    company_website: { type: DataTypes.STRING(255), allowNull: true },
    industry: { type: DataTypes.STRING(100), allowNull: true },
    company_size: {
      type: DataTypes.ENUM("1-10", "11-50", "51-200", "201-500", "501-1000", "1000+"),
      allowNull: true,
    },
    founded_year: { type: DataTypes.INTEGER, allowNull: true },
    about_company: { type: DataTypes.TEXT, allowNull: true },
    location: { type: DataTypes.STRING(150), allowNull: true },
    social_links: { type: DataTypes.JSON, allowNull: true, defaultValue: {} },
    is_verified: { type: DataTypes.BOOLEAN, defaultValue: false },
    is_inactive: { type: DataTypes.BOOLEAN, defaultValue: false },
  },
  {
    sequelize,
    modelName: "EmployerProfile",
    tableName: "employer_profiles",
    timestamps: true,
    underscored: true,
  }
);

module.exports = EmployerProfile;
