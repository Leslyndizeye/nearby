import mongoose from 'mongoose';

const medicineSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String },
  price: { type: String },
  stock: { type: String },
  instructions: { type: String },
  pharmacyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Pharmacy', required: true }

}, { timestamps: true });

const Medicine = mongoose.model('Medicine', medicineSchema);

export default Medicine;
