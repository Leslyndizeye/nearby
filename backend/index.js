const port = 4000;
const express = require("express");
const app = express();
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const cors = require("cors");
const bcrypt = require('bcryptjs');

app.use(cors());
app.use(express.json());

// MongoDB connection
mongoose.connect("mongodb://AgriRise:l2wDepUwTUXBmizU@cluster0-shard-00-00.viifw.mongodb.net:27017,cluster0-shard-00-01.viifw.mongodb.net:27017,cluster0-shard-00-02.viifw.mongodb.net:27017/AgriRise?ssl=true&replicaSet=atlas-14ddpe-shard-0&authSource=admin&retryWrites=true&w=majority&appName=Cluster0")

// User Model
const User = mongoose.model('User', {
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        unique: true,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    role: {
        type: String,
        enum: ['user', 'admin'],
        required: true
    },
    pharmacyName: {
        type: String
    },
    date: {
        type: Date,
        default: Date.now
    }
});

// Signup Endpoint (Updated)
app.post('/signup', async (req, res) => {
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
        if (!['user', 'admin'].includes(req.body.role)) {
            return res.status(400).json({
                success: false,
                errors: "Invalid role specified"
            });
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(req.body.password, salt);

        // Create new user
        const user = new User({
            name: req.body.username,
            email: req.body.email,
            password: hashedPassword,
            role: req.body.role,
            pharmacyName: req.body.role === 'admin' ? req.body.pharmacyName : null
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
app.post('/login', async (req, res) => {
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

// Protected routes middleware
const authenticateToken = (req, res, next) => {
    const token = req.header('auth-token');
    
    if (!token) {
        return res.status(401).json({ errors: "Please authenticate with a valid token" });
    }
    
    try {
        const data = jwt.verify(token, 'pharmacy_secret_key');
        req.user = data.user;
        next();
    } catch (error) {
        return res.status(401).json({ errors: "Please authenticate with a valid token" });
    }
}

// Start server
app.listen(port, (error) => {
    if (!error) {
        console.log("Server is running on port " + port);
    } else {
        console.log("Error starting server: " + error);
    }
});