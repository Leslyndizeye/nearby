import mongoose from 'mongoose';

const medicineSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String },
  price: { type: String },
  stock: { type: String },
  instructions: { type: String },
}, { timestamps: true });

const Medicine = mongoose.model('Medicine', medicineSchema);

export default Medicine;
