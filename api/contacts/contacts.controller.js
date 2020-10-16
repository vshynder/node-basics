const ContactModel = require("./contacts.model");

class ContactsController {
  async listContacts() {
    const contacts = await ContactModel.find();
    return contacts;
  }

  async getById(id) {
    const contact = await ContactModel.findById(id);
    return contact;
  }

  async addContact(contact) {
    const newContact = await new ContactModel(contact).save();
    return newContact;
  }

  async removeContact(contact) {
    const removed = await ContactModel.findOneAndRemove({ _id: contact });
    return removed;
  }

  async updateContact(id, contact) {
    await ContactModel.findByIdAndUpdate({ _id: id }, contact);
    return await ContactModel.findById(id);
  }

  validate(schema, contact) {
    return schema.validate(contact);
  }
}

module.exports = new ContactsController();
