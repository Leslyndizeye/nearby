import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './db.js';
import pharmacyRoutes from './routes/pharmacy.js';
import medicineRoutes from './routes/medicine.js';
import authRoutes from './routes/auth.js';


connectDB();

// your app.use, routes, etc below...


dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.use('/pharmacy', pharmacyRoutes);
app.use('/medicine', medicineRoutes);  
app.use('/auth', authRoutes);


app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
