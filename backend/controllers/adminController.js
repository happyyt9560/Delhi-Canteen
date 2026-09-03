const bcrypt = require('bcryptjs');
const { Admin, Customer, DeliveryBoy, Order, accountExists, nextId } = require('../models/database');

const present = value => {
  const data = value.toObject ? value.toObject() : { ...value };
  delete data.password;
  delete data._id;
  delete data.__v;
  return data;
};

exports.dashboard = async (req, res) => {
  const [orders, customers, deliveryBoys, onlineRegistrations, adminCreatedAccounts] = await Promise.all([
    Order.countDocuments(), Customer.countDocuments(), DeliveryBoy.countDocuments(),
    Customer.countDocuments({ source: { $nin: ['admin', 'admin-import'] } }),
    Customer.countDocuments({ source: { $in: ['admin', 'admin-import'] } })
  ]);
  res.json({ success: true, data: { orders, customers, deliveryBoys, onlineRegistrations, adminCreatedAccounts } });
};

exports.customers = async (req, res) => {
  res.json({ success: true, data: (await Customer.find().sort({ createdAt: -1 }).lean()).map(present) });
};

exports.deliveryBoys = async (req, res) => {
  res.json({ success: true, data: (await DeliveryBoy.find().sort({ createdAt: -1 }).lean()).map(present) });
};

exports.createDelivery = async (req, res) => {
  const { name, phone, password, vehicleNo, licenceNo, aadhaar, status = 'Active' } = req.body;
  if (!name || !phone || !password || !vehicleNo || !licenceNo || !aadhaar) return res.status(400).json({ success: false, message: 'All delivery boy details are required' });
  if (String(password).length < 6) return res.status(400).json({ success: false, message: 'Password must contain at least 6 characters' });
  if (await accountExists({ phone: String(phone).trim() })) return res.status(409).json({ success: false, message: 'An account with this phone already exists' });
  const member = await DeliveryBoy.create({ id: await nextId(DeliveryBoy, 'DB'), name: String(name).trim(), phone: String(phone).trim(), password: await bcrypt.hash(password, 10), vehicleNo: String(vehicleNo).trim().toUpperCase(), licenceNo: String(licenceNo).trim().toUpperCase(), aadhaar: String(aadhaar).trim(), status });
  res.status(201).json({ success: true, data: present(member) });
};

exports.updateDelivery = async (req, res) => {
  const member = await DeliveryBoy.findOne({ id: req.params.id });
  if (!member) return res.status(404).json({ success: false, message: 'Delivery boy not found' });
  const { name, phone, password, vehicleNo, licenceNo, aadhaar, status } = req.body;
  if (name !== undefined) member.name = String(name).trim();
  if (phone !== undefined) member.phone = String(phone).trim();
  if (vehicleNo !== undefined) member.vehicleNo = String(vehicleNo).trim().toUpperCase();
  if (licenceNo !== undefined) member.licenceNo = String(licenceNo).trim().toUpperCase();
  if (aadhaar !== undefined) member.aadhaar = String(aadhaar).trim();
  if (status !== undefined) member.status = status;
  if (password) { if (String(password).length < 6) return res.status(400).json({ success: false, message: 'Password must contain at least 6 characters' }); member.password = await bcrypt.hash(password, 10); }
  await member.save();
  res.json({ success: true, data: present(member) });
};

exports.deleteDelivery = async (req, res) => {
  const member = await DeliveryBoy.findOneAndDelete({ id: req.params.id });
  if (!member) return res.status(404).json({ success: false, message: 'Delivery boy not found' });
  res.status(204).send();
};

exports.assign = async (req, res) => {
  const member = await DeliveryBoy.findOne({ id: req.body.deliveryBoyId });
  if (!member || String(member.status || 'Active').toLowerCase() !== 'active') return res.status(400).json({ success: false, message: 'Select an active delivery boy' });
  const order = await Order.findOne({ id: req.params.id });
  if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
  if (String(order.status || '').toLowerCase() !== 'accepted') return res.status(400).json({ success: false, message: 'Only accepted orders can be assigned' });
  order.deliveryBoyId = member.id;
  order.deliveryBoyName = member.name;
  order.assignedAt = new Date();
  order.status = 'Assigned';
  await order.save();
  res.json({ success: true, data: present(order) });
};

exports.unassign = async (req, res) => {
  const order = await Order.findOne({ id: req.params.id });
  if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
  if (req.body.deliveryBoyId && String(order.deliveryBoyId || '') !== String(req.body.deliveryBoyId)) return res.status(409).json({ success: false, message: 'This order is assigned to another delivery boy' });
  if (String(order.status || '').toLowerCase() === 'delivered') return res.status(400).json({ success: false, message: 'Delivered orders cannot be removed from a delivery partner' });
  order.deliveryBoyId = undefined;
  order.deliveryBoyName = undefined;
  order.assignedAt = undefined;
  order.status = 'Accepted';
  await order.save();
  res.json({ success: true, data: present(order) });
};
