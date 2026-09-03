const mongoose = require('mongoose');

const deliveryBoySchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true, index: true },
  role: { type: String, default: 'delivery', immutable: true },
  name: { type: String, required: true, trim: true },
  phone: { type: String, required: true, trim: true, unique: true },
  email: { type: String, lowercase: true, trim: true, sparse: true },
  password: { type: String, required: true },
  vehicleNo: { type: String, trim: true, default: '' },
  licenceNo: { type: String, trim: true, default: '' },
  aadhaar: { type: String, trim: true, default: '' },
  status: { type: String, enum: ['Active', 'Inactive'], default: 'Active' },
  lastLoginAt: Date
}, { timestamps: true, collection: 'delivery_boys' });

module.exports = mongoose.models.DeliveryBoy || mongoose.model('DeliveryBoy', deliveryBoySchema);
