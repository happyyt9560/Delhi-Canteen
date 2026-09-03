const mongoose = require('mongoose');

const customerSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true, index: true },
  role: { type: String, default: 'customer', immutable: true },
  name: { type: String, required: true, trim: true },
  email: { type: String, lowercase: true, trim: true, sparse: true, unique: true },
  phone: { type: String, required: true, trim: true, unique: true },
  password: { type: String, required: true },
  source: { type: String, enum: ['online', 'admin', 'admin-import'], default: 'online' },
  address: { type: String, trim: true, default: '' },
  photo: String,
  status: { type: String, enum: ['Active', 'Inactive'], default: 'Active' },
  lastLoginAt: Date
}, { timestamps: true, collection: 'customers' });

module.exports = mongoose.models.Customer || mongoose.model('Customer', customerSchema);
