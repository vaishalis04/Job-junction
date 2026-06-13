const { DataTypes, Model } = require("sequelize");
const sequelize = require("../config/db");

// Helper: compute completeness score from profile fields
function computeCompleteness(profile) {
  let score = 0;
  if (profile.headline)        score += 10;
  if (profile.bio)             score += 10;
  if (profile.profile_picture) score += 10;
  if (profile.resume)          score += 15;
  if (profile.location)        score += 5;
  if (profile.expected_salary) score += 5;

  // Skills: stored as JSON array — need at least 3
  const skills = safeParseArray(profile.skills);
  if (skills.length >= 3) score += 15;

  // Education: stored as JSON array — need at least 1
  const education = safeParseArray(profile.education);
  if (education.length >= 1) score += 15;

  // Experience: stored as JSON array — need at least 1
  const experience = safeParseArray(profile.experience);
  if (experience.length >= 1) score += 15;

  return score;
}

function safeParseArray(value) {
  if (!value) return [];
  if (Array.isArray(value)) return value;
  try { return JSON.parse(value) || []; } catch { return []; }
}

function getTier(score) {
  if (score >= 90) return "platinum";
  if (score >= 70) return "gold";
  if (score >= 40) return "silver";
  return "bronze";
}

class JobSeekerProfile extends Model {}

JobSeekerProfile.init(
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    user_id: { type: DataTypes.INTEGER, allowNull: false, unique: true },
    headline: { type: DataTypes.STRING(200), allowNull: true },
    bio: { type: DataTypes.TEXT, allowNull: true },
    date_of_birth: { type: DataTypes.DATEONLY, allowNull: true },
    gender: {
      type: DataTypes.ENUM("male", "female", "other", "prefer_not_to_say"),
      allowNull: true,
    },
    location: { type: DataTypes.STRING(150), allowNull: true },
    resume: { type: DataTypes.STRING(255), allowNull: true },
    profile_picture: { type: DataTypes.STRING(255), allowNull: true },

    // JSON columns — arrays stored as JSON strings in MySQL
    skills: { type: DataTypes.JSON, allowNull: true, defaultValue: [] },
    languages: { type: DataTypes.JSON, allowNull: true, defaultValue: [] },
    education: { type: DataTypes.JSON, allowNull: true, defaultValue: [] },
    experience: { type: DataTypes.JSON, allowNull: true, defaultValue: [] },
    job_type_preference: { type: DataTypes.JSON, allowNull: true, defaultValue: [] },

    expected_salary: { type: DataTypes.INTEGER, allowNull: true },
    completeness_score: { type: DataTypes.INTEGER, defaultValue: 0 },
    completeness_tier: {
      type: DataTypes.ENUM("bronze", "silver", "gold", "platinum"),
      defaultValue: "bronze",
    },
    is_available: { type: DataTypes.BOOLEAN, defaultValue: true },
    is_inactive: { type: DataTypes.BOOLEAN, defaultValue: false },
  },
  {
    sequelize,
    modelName: "JobSeekerProfile",
    tableName: "job_seeker_profiles",
    timestamps: true,
    underscored: true,
    hooks: {
      beforeSave: (profile) => {
        const score = computeCompleteness(profile);
        profile.completeness_score = score;
        profile.completeness_tier  = getTier(score);
      },
    },
  }
);

module.exports = JobSeekerProfile;
