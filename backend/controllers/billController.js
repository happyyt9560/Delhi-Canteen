const { OfflineBill } = require('../models/database');

const clean = value => {
  const bill = value.toObject ? value.toObject() : value;
  delete bill._id;
  delete bill.__v;
  return bill;
};

exports.list = async (req, res) => {
  const bills = await OfflineBill.find().sort({ createdAt: -1 }).lean();
  res.json({ success: true, data: bills.map(clean) });
};

exports.create = async (req, res) => {
  const { billNo, items } = req.body;
  if (!billNo) return res.status(400).json({ success: false, message: 'Bill number is required' });
  if (!Array.isArray(items) || !items.length) return res.status(400).json({ success: false, message: 'At least one bill item is required' });
  if (await OfflineBill.exists({ billNo: String(billNo) })) return res.status(409).json({ success: false, message: 'A bill with this number already exists' });
  const bill = await OfflineBill.create({ ...req.body, billNo: String(billNo), createdBy: req.user.id });
  res.status(201).json({ success: true, data: clean(bill) });
};

exports.updatePayment = async (req, res) => {
  const bill = await OfflineBill.findOne({ billNo: req.params.billNo });
  if (!bill) return res.status(404).json({ success: false, message: 'Bill not found' });
  const totalAmount = Math.max(0, Number(bill.totalAmount) || 0);
  const paidAmount = Math.max(0, Math.min(totalAmount, Number(req.body.paidAmount)));
  bill.paidAmount = paidAmount;
  bill.remainingAmount = Math.max(0, totalAmount - paidAmount);
  await bill.save();
  res.json({ success: true, data: clean(bill) });
};

exports.remove = async (req, res) => {
  const bill = await OfflineBill.findOneAndDelete({ billNo: req.params.billNo });
  if (!bill) return res.status(404).json({ success: false, message: 'Bill not found' });
  res.status(204).send();
};
