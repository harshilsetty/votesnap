import mongoose from 'mongoose';
import Poll from '../models/Poll';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/votesnap';

async function createTestPoll() {
  try {
    // Connect to MongoDB
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    // Create a test poll
    const testPoll = new Poll({
      title: 'Test Poll',
      options: [
        { text: 'Option 1', votes: 0 },
        { text: 'Option 2', votes: 0 }
      ],
      createdBy: new mongoose.Types.ObjectId(), // Temporary ID
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours from now
      isPublic: true
    });

    await testPoll.save();
    console.log('Test poll created successfully:', testPoll);
  } catch (error) {
    console.error('Error creating test poll:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

createTestPoll(); 