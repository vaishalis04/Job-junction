const router = require("express").Router();
const Controller = require("../controllers/application.controller");
const { verifyAccessToken } = require("../helpers/jwt.helper");
const { attachUser, authorize } = require("../middlewares/auth.middleware");
const upload = require("../helpers/multer.helper");

router.use(verifyAccessToken, attachUser);

// Job seeker
router.post("/:jobId/apply",       authorize("job_seeker"), upload.single("resume"), Controller.apply);
router.get("/me/my-applications",  authorize("job_seeker"), Controller.getMyApplications);
router.put("/:id/withdraw",        authorize("job_seeker"), Controller.withdraw);

// Employer
router.get("/job/:jobId",          authorize("employer"), Controller.getJobApplications);
router.put("/:id/status",          authorize("employer"), Controller.updateStatus);

module.exports = router;
