import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();
const dburl = "mongodb://AgriRise:l2wDepUwTUXBmizU@cluster0-shard-00-00.viifw.mongodb.net:27017,cluster0-shard-00-01.viifw.mongodb.net:27017,cluster0-shard-00-02.viifw.mongodb.net:27017/indexing?ssl=true&replicaSet=atlas-14ddpe-shard-0&authSource=admin&retryWrites=true&w=majority&appName=Cluster0"

const connectDB = async () => {
  try {
    await mongoose.connect(dburl, {
    });
    console.log('🟢 Connected to MongoDB Atlas');
  } catch (err) {
    console.error('🔴 MongoDB connection error:', err);
    process.exit(1);
  }
};

export default connectDB;
