
const customerService = require("../services/customerService");

exports.getAll = async (req, res) => {
  const customers = await customerService.findAll();
  res.json(customers);
};

exports.getById = async (req, res) => {
  const customer = await customerService.findById(req.params.id);
  customer
    ? res.json(customer)
    : res.status(404).json({ message: "Customer not found" });
};

exports.create = async (req, res) => {
  const newCustomer = await customerService.create(req.body);
  res.status(201).json(newCustomer);
};

exports.update = async (req, res) => {
  await customerService.update(req.params.id, req.body);
  res.json({ message: "Customer updated successfully" });
};

exports.remove = async (req, res) => {
  await customerService.remove(req.params.id);
  res.json({ message: "Customer deleted successfully" });
};
