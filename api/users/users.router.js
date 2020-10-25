const { Router } = require("express");
const Joi = require("joi");
const multer = require("multer");
const path = require("path");

const storage = multer.diskStorage({
  destination: "public/images/",
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname);
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, file.fieldname + "-" + uniqueSuffix + ext);
  },
});
const upload = multer({ storage });

const router = Router();

const controller = require("./users.controller");

const registerUserSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required().min(4),
});

router.post("/register", async (req, res) => {
  const { error } = await controller.validate(registerUserSchema, req.body);
  if (error) {
    res.status(400).json(error.details[0].message);
  }
  const message = await controller.register(req.body);
  if (message.id) {
    res.json({
      user: { email: message.email, subscription: message.subscription },
    });
  }
  res.status(409).json(message);
});

router.post("/login", async (req, res) => {
  const { error } = await controller.validate(registerUserSchema, req.body);
  if (error) {
    res.status(400).json(error.details[0].message);
  }
  const message = await controller.login(req.body);
  if (message.token) {
    res.json(message);
  }
  res.status(401).json(message);
});

router.post("/logout", controller.checkToken, controller.logout);
router.get("/users/current", controller.checkToken, (req, res) => {
  if (req.user) {
    res.status(200).json({
      user: {
        email: req.user.email,
        subscription: req.user.subscription,
      },
    });
  }
  res.status(401).json({ message: "Not authorized" });
});

router.patch(
  "/users/avatars",
  controller.checkToken,
  upload.single("avatar"),
  async (req, res) => {
    req.file = {
      ...req.file,
      path: `localhost:3000${req.file.path.split("public")[1]}`,
    };
    console.log("req.file", req.file);
    const user = await controller.changeAvatar(req, res);
    if (user) res.json({ avatarUrl: user.avatarUrl });
  }
);

module.exports = router;
