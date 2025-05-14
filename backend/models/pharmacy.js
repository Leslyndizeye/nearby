import mongoose from 'mongoose';

const pharmacySchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  address: { type: String, required: true },
  location: {
    type: { type: String, enum: ['Point'], default: 'Point' },
    coordinates: { type: [Number], required: true }  // [lng, lat]
  },
  contact: { type: String },
  medicines: [{
    medicineId: { type: mongoose.Schema.Types.ObjectId, ref: 'Medicine' },
    quantity: { type: Number, default: 0 }
  }]
}, { timestamps: true });

const Pharmacy = mongoose.model('Pharmacy', pharmacySchema);

export default Pharmacy;
