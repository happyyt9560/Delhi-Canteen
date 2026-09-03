const mongoose = require('mongoose');

const adminSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true, index: true },
  role: { type: String, enum: ['admin'], default: 'admin', immutable: true },
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, lowercase: true, trim: true, unique: true },
  phone: { type: String, trim: true },
  password: { type: String, required: true },
  shopName: { type: String, trim: true, default: 'Delhi Canteen' },
  shopStatus: { type: String, enum: ['Active', 'Inactive'], default: 'Active' },
  planType: { type: String, enum: ['1 Week', '1 Month', '6 Months', '1 Year', 'Lifetime', 'Custom Days'], default: 'Lifetime' },
  startDate: { type: Date, default: Date.now },
  expiryDate: { type: Date, default: null },
  status: { type: String, enum: ['Active', 'Expired', 'Inactive'], default: 'Active', index: true },
  systemAccount: { type: Boolean, default: false, immutable: true },
  lastLoginAt: Date
}, { timestamps: true, collection: 'admins' });

module.exports = mongoose.models.Admin || mongoose.model('Admin', adminSchema);
