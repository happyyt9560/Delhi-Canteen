const { Order, Customer } = require('../models/database');

const clean = value => {
  const item = value.toObject ? value.toObject() : value;
  delete item.password;
  delete item._id;
  delete item.__v;
  return item;
};
const find = (id, user) => Order.findOne({ id, deliveryBoyId: user.id });
const present = async order => {
  const customer = await Customer.findOne({ id: order.customerId }).lean() || {};
  return { ...clean(order), customerName: customer.name || 'Customer', phone: customer.phone || '—' };
};

exports.profile = (req, res) => res.json({ success: true, data: clean(req.user) });
exports.today = async (req, res) => res.json({ success: true, data: await Promise.all((await Order.find({ deliveryBoyId: req.user.id, status: { $ne: 'Delivered' } }).lean()).map(present)) });
exports.history = async (req, res) => res.json({ success: true, data: await Promise.all((await Order.find({ deliveryBoyId: req.user.id, status: 'Delivered' }).lean()).map(present)) });
exports.todayDelivered = async (req, res) => {
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  const end = new Date(start);
  end.setDate(end.getDate() + 1);
  const orders = await Order.find({ deliveryBoyId: req.user.id, status: 'Delivered', deliveredAt: { $gte: start, $lt: end } }).sort({ deliveredAt: -1 }).lean();
  res.json({ success: true, data: await Promise.all(orders.map(present)) });
};
exports.detail = async (req, res) => {
  const order = await find(req.params.id, req.user);
  if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
  res.json({ success: true, data: await present(order) });
};
exports.reached = async (req, res) => {
  const order = await Order.findOneAndUpdate({ id: req.params.id, deliveryBoyId: req.user.id }, { status: 'Reached' }, { new: true });
  if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
  res.json({ success: true, data: await present(order) });
};
exports.complete = async (req, res) => {
  const order = await find(req.params.id, req.user);
  if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
  const { verifiedItems, receivedAmount, paymentReceivedMode, customerId } = req.body;
  if (!Array.isArray(verifiedItems) || verifiedItems.length !== order.items.length) return res.status(400).json({ success: false, message: 'All products must be verified' });
  const enteredId = String(customerId || '').trim().toUpperCase();
  const customer = await Customer.findOne({ id: order.customerId }).lean();
  if (!enteredId || !customer || enteredId !== String(customer.id).trim().toUpperCase()) return res.status(400).json({ success: false, message: 'Customer DC ID does not match this order' });
  if (order.paymentMode === 'COD') {
    if (Number(receivedAmount) < order.total) return res.status(400).json({ success: false, message: `Complete amount of ₹${order.total} is required` });
    if (!['Cash', 'Online Payment'].includes(paymentReceivedMode)) return res.status(400).json({ success: false, message: 'Valid payment received mode is required' });
    order.receivedAmount = Number(receivedAmount);
    order.paymentReceivedMode = paymentReceivedMode;
  }
  order.status = 'Delivered';
  order.deliveredAt = new Date();
  await order.save();
  res.json({ success: true, data: await present(order) });
};
exports.dashboard = async (req, res) => {
  const all = await Order.find({ deliveryBoyId: req.user.id }).lean();
  const delivered = all.filter(order => order.status === 'Delivered');
  const pending = all.filter(order => order.status !== 'Delivered');
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  const end = new Date(start);
  end.setDate(end.getDate() + 1);
  const deliveredToday = delivered.filter(order => order.deliveredAt && new Date(order.deliveredAt) >= start && new Date(order.deliveredAt) < end);
  res.json({ success: true, data: { today: all.length, pending: pending.length, delivered: delivered.length, cashCollected: deliveredToday.filter(order => order.paymentMode === 'COD').reduce((sum, order) => sum + (order.receivedAmount || 0), 0) } });
};
