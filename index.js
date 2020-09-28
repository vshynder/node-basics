const express = require("express");
const morgan = require("morgan");
const cors = require("cors");
const Joi = require("joi");

const app = express();

const PORT = process.env.PORT || 3000;

const {
  listContacts,
  getContactById,
  addContact,
  removeContact,
  updateContact,
} = require("./contacts");
const { required } = require("yargs");

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

  res.status(404);
  res.json({ message: "Not found" });
});

const contactScheme = Joi.object({
  name: Joi.string().required(),
  email: Joi.string().email().required(),
  password: Joi.string().required(),
});

const updateScheme = Joi.object({
  name: Joi.string(),
  email: Joi.string().email(),
  password: Joi.string(),
});

app.post("/api/contacts", async (req, res) => {
  const { error } = contactScheme.validate(req.body);
  if (error) {
    res.status(400);
    return res.json({ message: "Missing required field" });
  }

  const { name, email, phone } = req.body;
  const createdContact = await addContact(name, email, phone);

  res.json({ createdContact });
});

app.delete("/api/contacts/:contactId", async (req, res) => {
  const { contactId } = req.params;
  const message = await removeContact(Number.parseInt(contactId));
  if (message === "not found") {
    res.status(404);
    res.json({ message: "Not found" });
  }

  res.json({ message: "Contact deleted" });
});

app.patch("/api/contacts/:contactId", async (req, res) => {
  const { error } = updateScheme.validate(req.body);
  if (error) {
    res.status(400);
    return res.json({ message: "Missing fields" });
  }

  const { contactId } = req.params;
  const ans = await updateContact(contactId, req.body);
  if (ans) {
    return res.json({ contact: ans });
  }
  res.status(404);
  res.json({ message: "Not found" });
});

app.listen(PORT, () => console.log(`Server started on prot ${PORT}`));
