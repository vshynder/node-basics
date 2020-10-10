const contactsModel = require("./user.schema");

async function listContacts() {
  const contacts = await contactsModel.find();
  return contacts;
}

async function getContactById(contactId) {
  const contact = await contactsModel.findOne({ _id: contactId });
  return contact;
}

async function removeContact(contactId) {
  console.log(contactId);
  const removed = await contactsModel.findOneAndRemove({ _id: contactId });
  return removed;
}

async function addContact(name, email, phone, password) {
  const newContact = await new contactsModel({
    name,
    email,
    phone,
    password,
  }).save();
  return newContact;
}

async function updateContact(id, update) {
  const updatedContact = await contactsModel.findByIdAndUpdate(
    { _id: id },
    update
  );
  return updatedContact;
}

module.exports = {
  listContacts,
  getContactById,
  removeContact,
  addContact,
  updateContact,
};
