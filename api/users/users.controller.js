const UserModel = require("./users.model");

const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const sgMail = require("@sendgrid/mail");
const { v4: uuidv4 } = require("uuid");
const Joi = require("joi");

const registerUserSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required().min(4),
});

class UserController {
  async registerRoute(req, res, next) {
    const { error } = await UserController.validate(
      registerUserSchema,
      req.body
    );
    if (error) {
      res.status(400).json(error.details[0].message);
    }
    const message = await UserController.register(req.body);
    if (message.id) {
      res.json({
        user: { email: message.email, subscription: message.subscription },
      });
    }
    res.status(409).json(message);
  }

  static async register({ email, password }) {
    const checkUser = await UserModel.find({ email });
    if (checkUser.length) {
      return { message: "Email in use" };
    }

    const encryptedPassword = await bcrypt.hash(password, 6);

    const verificationToken = uuidv4();
    const createdUser = await new UserModel({
      email,
      password: encryptedPassword,
      verificationToken,
    }).save();

    sgMail.setApiKey(process.env.SENDGRID_API_KEY);

    const verifyLink = `http://localhost:3000/auth/verify/${verificationToken}`;
    const msg = {
      to: email, // Change to your recipient
      from: "shynderv@gmail.com", // Change to your verified sender
      subject: "Verify your accaunt",
      text: "Verification link:",
      html: `<a href=${verifyLink}>Link</a>`,
    };
    sgMail
      .send(msg)
      .then(() => {
        console.log("Email sent");
      })
      .catch((error) => {
        console.error(error);
      });

    return createdUser;
  }

  async loginRoute(req, res, next) {
    const { error } = await UserController.validate(
      registerUserSchema,
      req.body
    );
    if (error) {
      res.status(400).json(error.details[0].message);
    }
    const message = await UserController.login(req.body);
    if (message.token) {
      res.json(message);
    }
    res.status(401).json(message);
  }

  static async login({ email, password }) {
    const foundUser = await UserModel.findOne({ email }).select("-__v");
    if (!foundUser) {
      return { message: "Email or password is wrong" };
    }
    const match = await bcrypt.compare(password, foundUser.password);
    if (match) {
      const user = {
        email: foundUser.email,
        subscription: foundUser.subscription,
      };
      const token = await jwt.sign(
        JSON.stringify(foundUser),
        process.env.JWT_SECRET
      );
      await UserModel.findByIdAndUpdate(foundUser._id, { token });
      return {
        token,
        user,
      };
    }
  }

  getCurrentUser(req, res, next) {
    if (req.user) {
      res.status(200).json({
        user: {
          email: req.user.email,
          subscription: req.user.subscription,
        },
      });
    }
    res.status(401).json({ message: "Not authorized" });
  }

  static async validate(schema, user) {
    return await schema.validate(user);
  }

  async checkToken(req, res, next) {
    try {
      const token = req.headers["authorization"].split(" ")[1];
      const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
      const { _id } = decodedToken;
      const user = await UserModel.findById(_id);
      if (!user) throw new Error();
      req.user = user;
      next();
    } catch (error) {
      res.status(401).json({ message: "Not authorized" });
    }
  }

  async logout(req, res) {
    try {
      const user = await UserModel.findById(req.user._id);
      if (!user) throw new Error();
      await UserModel.findByIdAndUpdate(req.user._id, { token: null });
      return res.status(204).json({ message: "Logged out" });
    } catch (error) {
      res.status(401).json({ message: "Not authorized" });
    }
  }

  static async changeAvatar(req, res) {
    try {
      const user = await UserModel.findByIdAndUpdate(req.user._id, {
        avatarUrl: req.file.path,
      });
      return user;
    } catch (error) {
      res.status(401).json({ message: "Not authorized" });
    }
  }

  async changeAvatarRoute(req, res, next) {
    req.file = {
      ...req.file,
      path: `localhost:3000${req.file.path.split("public")[1]}`,
    };
    const user = await UserController.changeAvatar(req, res);
    if (user) res.json({ avatarUrl: user.avatarUrl });
  }

  async verifyUser(req, res, next) {
    const { verificationToken } = req.params;
    console.log(verificationToken);

    const user = await UserModel.findOne({ verificationToken });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    await UserModel.findOneAndUpdate(
      { _id: user._id },
      {
        verificationToken: null,
      }
    );

    return res.status(200);
  }
}

module.exports = new UserController();
