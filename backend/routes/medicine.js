import express from 'express';
import Medicine from '../models/medicine.js';
import Pharmacy from '../models/pharmacy.js';
import protect from '../middleware/authMiddleware.js';  // For pharmacy auth check

const router = express.Router();

// Create Medicine (for pharmacies to add medicines)
router.post('/', protect, async (req, res) => {
  const { name, description, price, stock, instructions } = req.body;

  try {
    // Get pharmacy ID from logged in user
    const pharmacy = await Pharmacy.findOne({ userId: req.user.id });
    if (!pharmacy) {
      return res.status(404).json({ success: false, message: 'Pharmacy not found' });
    }

    // Create medicine
    const newMedicine = new Medicine({
      name,
      description,
      price,
      stock,
      instructions,
      pharmacyId: pharmacy._id
    });

    await newMedicine.save();

    res.status(201).json({ success: true, data: newMedicine });
  } catch (err) {
    console.error('Error creating medicine:', err);
    res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
});

// Get All Medicines (public for now, could be restricted)
router.get('/', protect, async (req, res) => {
  try {
    // Get pharmacy linked to logged-in user
    const pharmacy = await Pharmacy.findOne({ userId: req.user.id });
    if (!pharmacy) {
      return res.status(404).json({ success: false, message: 'Pharmacy not found' });
    }

    // Get medicines linked to that pharmacy
    const medicines = await Medicine.find({ pharmacyId: pharmacy._id });

    res.json({ success: true, data: medicines });
  } catch (err) {
    console.error('Error fetching medicines:', err);
    res.status(500).json({ success: false, message: 'Server error', error: err.message });
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
// Update Medicine
router.put('/:id', protect, async (req, res) => {
  const { name, description, price, stock, instructions } = req.body;

  try {
    // Get pharmacy ID from logged-in user
    const pharmacy = await Pharmacy.findOne({ userId: req.user.id });
    if (!pharmacy) {
      return res.status(404).json({ success: false, message: 'Pharmacy not found' });
    }

    // Find medicine that belongs to this pharmacy
    const medicine = await Medicine.findOne({ _id: req.params.id, pharmacyId: pharmacy._id });
    if (!medicine) {
      return res.status(404).json({ success: false, message: 'Medicine not found' });
    }

    // Update fields
    medicine.name = name || medicine.name;
    medicine.description = description || medicine.description;
    medicine.price = price !== undefined ? price : medicine.price;
    medicine.stock = stock !== undefined ? stock : medicine.stock;
    medicine.instructions = instructions || medicine.instructions;

    await medicine.save();

    res.json({ success: true, data: medicine });
  } catch (err) {
    console.error('Error updating medicine:', err);
    res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
});



// Delete Medicine (for pharmacies)
router.delete('/:id', protect, async (req, res) => {
  try {
    const pharmacy = await Pharmacy.findOne({ userId: req.user.id });
    if (!pharmacy) {
      return res.status(404).json({ success: false, message: 'Pharmacy not found' });
    }

    // Delete only if the medicine belongs to this pharmacy
    const deletedMedicine = await Medicine.findOneAndDelete({
      _id: req.params.id,
      pharmacyId: pharmacy._id
    });

    if (!deletedMedicine) {
      return res.status(404).json({ success: false, message: 'Medicine not found or not yours' });
    }

    res.json({ success: true, message: 'Medicine deleted successfully' });
  } catch (err) {
    console.error('Error deleting medicine:', err);
    res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
});


export default router;
