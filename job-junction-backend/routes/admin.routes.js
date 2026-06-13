const router = require("express").Router();
const Controller = require("../controllers/admin.controller");
const { verifyAccessToken } = require("../helpers/jwt.helper");
const { attachUser, authorize } = require("../middlewares/auth.middleware");

router.use(verifyAccessToken, attachUser, authorize("admin"));

router.get("/dashboard",                       Controller.getDashboardStats);
router.get("/users",                           Controller.getAllUsers);
router.patch("/users/:userId/toggle-status",   Controller.toggleUserStatus);
router.get("/jobs",                            Controller.getAllJobs);
router.patch("/employers/:userId/verify",      Controller.verifyEmployer);
router.get("/top-job-seekers",                 Controller.getTopJobSeekers);

module.exports = router;
