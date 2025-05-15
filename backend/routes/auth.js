import express from 'express';
import User from '../models/user.js';
import Pharmacy from '../models/pharmacy.js'
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
// import { protect } from '../middleware/authMiddleware.js'; 

const router = express.Router();

// Signup Endpoint (Updated)
router.post('/signup', async (req, res) => {
    try {
        // Check if user exists
        let check = await User.findOne({ email: req.body.email });
        if (check) {
            return res.status(400).json({
                success: false,
                errors: "A user with this email already exists"
            });
        }

        // Validate role
        if (!['user', 'admin', 'pharmacy'].includes(req.body.role)) {
            return res.status(400).json({
                success: false,
                errors: "Invalid role specified"
            });
        }

        // Create new user
        const user = new User({
            name: req.body.name,
            email: req.body.email,
            password: req.body.password,
            role: req.body.role,
        });

        await user.save();

        // Create JWT token
        const data = {
            user: {
                id: user.id
            }
        }
        
        const token = jwt.sign(data, 'pharmacy_secret_key');
        
        res.json({
            success: true,
            token,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
                pharmacyName: user.pharmacyName
            }
        });
    } catch (error) {
        console.error("Error in signup:", error);
        res.status(500).json({
            success: false,
            errors: "Server error, please try again"
        });
    }
});

// Login Endpoint (Updated to use bcrypt)
router.post('/login', async (req, res) => {
    try {
        let user = await User.findOne({ email: req.body.email });   
        
        if (user) {
            const passMatch = await bcrypt.compare(req.body.password, user.password);
            
            if (passMatch) {
                const data = {
                    user: {
                        id: user.id
                    }
                }
                
                const token = jwt.sign(data, 'pharmacy_secret_key');
                
                res.json({
                    success: true,
                    token,
                    user: {
                        id: user.id,
                        name: user.name,
                        email: user.email,
                        role: user.role,
                        pharmacyName: user.pharmacyName
                    }
                });
            } else {
                res.json({ success: false, errors: "Incorrect password" });
            }
        } else {
            res.json({ success: false, errors: "User not found" });
        } 
    } catch (error) {
        console.error("Error in login:", error);
        res.status(500).json({
            success: false,
            errors: "Server error, please try again"
        });
    }
});

export default router;