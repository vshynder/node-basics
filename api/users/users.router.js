const { Router } = require("express");
const Joi = require("joi");

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

module.exports = router;
