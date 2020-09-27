const { promises: fsPromises } = require("fs");
const path = require("path");

// Раскомментируй и запиши значение
const contactsPath = `${path.dirname("./db/contacts.json")}/${path.basename(
  "./db/contacts.json"
)}`;
// TODO: задокументировать каждую функцию
async function listContacts() {
  const dataJson = await fsPromises.readFile(contactsPath, "utf-8");
  const data = JSON.parse(dataJson);
  return data;
}

// try {
//   listContacts().then((data) => console.log(typeof data));
// } catch (err) {
//   console.error(err);
// }

async function getContactById(contactId) {
  const data = await listContacts();
  const contact = data.find((el) => el.id == contactId);
  return contact;
}

async function removeContact(contactId) {
  const data = await listContacts();
  const newContacts = data.filter((el) => el.id !== contactId);
  await fsPromises.writeFile(contactsPath, JSON.stringify(newContacts));
}

async function addContact(name, email, phone) {
  const data = await listContacts();
  const newId = data[data.length - 1].id + 1;
  data[data.length] = {
    id: newId,
    name,
    email,
    phone,
  };
  fsPromises.writeFile(contactsPath, JSON.stringify(data));
}

module.exports = {
  listContacts,
  getContactById,
  removeContact,
  addContact,
};
