import express from 'express';
import Pharmacy from '../models/pharmacy.js';
import User from '../models/user.js';
import protect  from '../middleware/authMiddleware.js';

const router = express.Router();

// Create Pharmacy from the user (usually done during registration)
router.post('/onboardPharmacy', async (req, res) => {
    try {
        // Ensure user is logged in (check JWT token)
        const user = await User.findById(req.body.userId); // you’ll need to pass userId

        if (!user || user.role !== 'pharmacy') {
            return res.status(400).json({ success: false, errors: "User not found or not a pharmacy" });
        }

        // Create Pharmacy data
        const pharmacy = new Pharmacy({
            userId: user.id,  // reference to User collection
            name: user.name,  // can copy common fields like name from User
            address: req.body.address,
            location: {
              type: 'Point', // Don't forget this
              coordinates: req.body.location.coordinates // ✅ Correct access
            },
            contact: req.body.contact
        });

        await pharmacy.save();

        res.json({
            success: true,
            message: "Pharmacy onboarding complete",
            pharmacy: {
                id: pharmacy.id,
                address: pharmacy.address,
                contact: pharmacy.contact,
                location: pharmacy.location
            }
        });

    } catch (error) {
        console.error("Error in onboarding:", error);
        res.status(500).json({
            success: false,
            errors: "Server error, please try again"
        });
    }
});

// Get Pharmacy Info (for logged-in pharmacy)
router.get('/profile', protect,  async (req, res) => {
  try {
    const pharmacy = await Pharmacy.findOne({ userId: req.user.id });
    if (!pharmacy) {
      return res.status(404).json({ message: 'Pharmacy not found' });
    }
    res.json(pharmacy);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching pharmacy data', error: err.message });
  }
});

// Update Pharmacy Info (for logged-in pharmacy)
router.put('/profile', protect,  async (req, res) => {
  const { address, contact, location } = req.body;
  try {
    const updatedPharmacy = await Pharmacy.findOneAndUpdate(
      { userId: req.user.id },
      { userId: req.user.id, address, contact, location },
      { new: true }
    );
    if (!updatedPharmacy) {
      return res.status(404).json({ message: 'Pharmacy not found' });
    }
    res.json(updatedPharmacy);
  } catch (err) {
    res.status(500).json({ message: 'Error updating pharmacy', error: err.message });
  }
});

// Delete Pharmacy (for admin, or pharmacy itself if needed)
router.delete('/profile', protect,  async (req, res) => {
  try {
    const pharmacy = await Pharmacy.findOneAndDelete({ userId: req.user.id });
    if (!pharmacy) {
      return res.status(404).json({ message: 'Pharmacy not found' });
    }
    res.json({ message: 'Pharmacy deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Error deleting pharmacy', error: err.message });
  }
});

export default router;
