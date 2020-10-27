const { Router } = require("express");
const Joi = require("joi");

const controller = require("./contacts.controller");

router = Router();

router.get("/test", (req, res) => {
  res.json({
    message: "Hello 🙌🏻",
  });
});

router.get("/", async (req, res, next) => {
  try {
    const contacts = await controller.listContacts();
    res.json(contacts);
  } catch (error) {
    next(error);
  }
});

router.get("/:contactId", async (req, res, next) => {
  try {
    const { contactId } = req.params;
    const contact = await controller.getById(contactId);
    res.json(contact);
  } catch (error) {
    next(error);
  }
});

const contactScheme = Joi.object({
  name: Joi.string().required(),
  email: Joi.string().email().required(),
  password: Joi.string().required(),
  phone: Joi.string(),
});

router.post("/", async (req, res, next) => {
  try {
    const { error } = controller.validate(contactScheme, req.body);
    if (error) next(error);

    const createdContact = await controller.addContact(req.body);

    res.json(createdContact);
  } catch (error) {
    next(error);
  }
});

router.delete("/:contactId", async (req, res, next) => {
  try {
    const { contactId } = req.params;
    const message = await controller.removeContact(contactId);

    res.json({ removed: message });
  } catch (error) {
    next(error);
  }
});

const updateScheme = Joi.object({
  name: Joi.string(),
  email: Joi.string().email(),
  password: Joi.string(),
  phone: Joi.string(),
});

router.patch("/:contactId", async (req, res, next) => {
  try {
    const { error } = controller.validate(updateScheme, req.body);
    if (error) {
      res.status(400);
      return res.json({ message: "Missing fields" });
    }
    const { contactId } = req.params;
    const updated = await controller.updateContact(contactId, req.body);
    res.json(updated);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
