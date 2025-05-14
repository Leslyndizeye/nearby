import express from 'express';
import Medicine from '../models/medicine.js';
// import { protect } from '../middleware/authMiddleware.js';  // For pharmacy auth check

const router = express.Router();

// Create Medicine (for pharmacies to add medicines)
router.post('/',  async (req, res) => {
  const { name, description, brand, category } = req.body;
  try {
    const newMedicine = new Medicine({ name, description, brand, category });
    await newMedicine.save();
    res.status(201).json(newMedicine);
  } catch (err) {
    res.status(400).json({ message: 'Failed to create medicine', error: err.message });
  }
});

// Get All Medicines (public for now, could be restricted)
router.get('/', async (req, res) => {
  try {
    const medicines = await Medicine.find();
    res.json(medicines);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching medicines', error: err.message });
  }
});

// Get Single Medicine Info (for specific pharmacy inventory, if needed)
router.get('/:id', async (req, res) => {
  try {
    const medicine = await Medicine.findById(req.params.id);
    if (!medicine) {
      return res.status(404).json({ message: 'Medicine not found' });
    }
    res.json(medicine);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching medicine info', error: err.message });
  }
});

// Update Medicine Info (for pharmacies)
router.put('/:id',  async (req, res) => {
  const { name, description, brand, category } = req.body;
  try {
    const updatedMedicine = await Medicine.findByIdAndUpdate(
      req.params.id,
      { name, description, brand, category },
      { new: true }
    );
    if (!updatedMedicine) {
      return res.status(404).json({ message: 'Medicine not found' });
    }
    res.json(updatedMedicine);
  } catch (err) {
    res.status(500).json({ message: 'Error updating medicine', error: err.message });
  }
});

// Delete Medicine (for pharmacies)
router.delete('/:id',  async (req, res) => {
  try {
    const deletedMedicine = await Medicine.findByIdAndDelete(req.params.id);
    if (!deletedMedicine) {
      return res.status(404).json({ message: 'Medicine not found' });
    }
    res.json({ message: 'Medicine deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Error deleting medicine', error: err.message });
  }
});

export default router;
