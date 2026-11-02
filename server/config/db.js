import mongoose from 'mongoose';

/**
 * Connects to MongoDB database using Mongoose.
 * Adheres to Single Responsibility Principle: isolated database connection logic.
 */
export const connectDB = async () => {
  const mongoURI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/taskflow';
  
  try {
    const conn = await mongoose.connect(mongoURI, {
      autoIndex: true,
    });
    console.log(`[Database] MongoDB Connected successfully to: ${conn.connection.host}/${conn.connection.name}`);
  } catch (error) {
    console.error(`[Database Error] Failed to connect to MongoDB: ${error.message}`);
    process.exit(1);
  }
};
