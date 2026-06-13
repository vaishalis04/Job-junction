const router = require("express").Router();
const Controller = require("../controllers/jobSeeker.controller");
const { verifyAccessToken } = require("../helpers/jwt.helper");
const { attachUser, authorize } = require("../middlewares/auth.middleware");
const upload = require("../helpers/multer.helper");

// Public
router.get("/ranked",     Controller.getRankedProfiles);
router.get("/:userId",    Controller.getProfileById);

// Protected
router.use(verifyAccessToken, attachUser);
router.get("/me/profile",    authorize("job_seeker"), Controller.getMyProfile);
router.post("/me/profile",   authorize("job_seeker"), upload.fields([{ name: "profile_picture", maxCount: 1 }, { name: "resume", maxCount: 1 }]), Controller.upsertProfile);
router.put("/me/profile",    authorize("job_seeker"), upload.fields([{ name: "profile_picture", maxCount: 1 }, { name: "resume", maxCount: 1 }]), Controller.upsertProfile);
router.put("/me/education",  authorize("job_seeker"), Controller.updateEducation);
router.put("/me/experience", authorize("job_seeker"), Controller.updateExperience);

module.exports = router;
