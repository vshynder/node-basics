const express = require("express");
const mongoose = require("mongoose");
const morgan = require("morgan");
const cors = require("cors");
const Joi = require("joi");
require("dotenv").config();

const app = express();

const PORT = process.env.PORT || 3000;
const CONNECT_DB = process.env.DB_CONNECTION_STRING || "";

mongoose
  .connect(CONNECT_DB, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false,
  })
  .then(() => {
    console.log("Database connection successful");
  })
  .catch((error) => {
    console.log(error);
    process.exit(1);
  });

const {
  listContacts,
  getContactById,
  addContact,
  removeContact,
  updateContact,
} = require("./contacts");

app.use(morgan("dev"));
app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.json({
    message: "Hello 🙌🏻",
  });
});

app.get("/api/contacts", async (req, res) => {
  const contacts = await listContacts();
  res.json({
    contacts,
  });
});

app.get("/api/contacts/:contactId", async (req, res) => {
  const { contactId } = req.params;
  const contact = await getContactById(contactId);
  if (contact) {
    return res.json({ contact });
  }

  res.status(404).json({ message: "no such contact" });
});

const contactScheme = Joi.object({
  name: Joi.string().required(),
  email: Joi.string().email().required(),
  password: Joi.string().required(),
  phone: Joi.string(),
});

const updateScheme = Joi.object({
  name: Joi.string(),
  email: Joi.string().email(),
  password: Joi.string(),
  phone: Joi.string(),
});

app.post("/api/contacts", async (req, res) => {
  const { error } = contactScheme.validate(req.body);
  if (error) {
    res.status(400);
    return res.json({ message: "Missing required field" });
  }

  const { name, email, phone, password } = req.body;
  const createdContact = await addContact(name, email, phone, password);

  res.json({ createdContact });
});

app.delete("/api/contacts/:contactId", async (req, res) => {
  const { contactId } = req.params;
  console.log(contactId);
  const message = await removeContact(contactId);

  res.json(message);
});

app.patch("/api/contacts/:contactId", async (req, res) => {
  const { error } = updateScheme.validate(req.body);
  if (error) {
    res.status(400);
    return res.json({ message: "Missing fields" });
  }

  const { contactId } = req.params;
  const ans = await updateContact(contactId, req.body);
  return res.json(ans);
});

app.listen(PORT, () => console.log(`Server started on prot ${PORT}`));
