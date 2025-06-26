import mongoose from 'mongoose';
import Poll from '../models/Poll';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/votesnap';

async function setupDatabase() {
  try {
    // Connect to MongoDB
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    // Create a test poll
    const testPoll = new Poll({
      title: 'What is your favorite programming language?',
      options: [
        { text: 'JavaScript', votes: 0 },
        { text: 'Python', votes: 0 },
        { text: 'Java', votes: 0 },
        { text: 'C++', votes: 0 }
      ],
      createdBy: new mongoose.Types.ObjectId(), // Temporary ID
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
      isPublic: true
    });

    await testPoll.save();
    console.log('Test poll created successfully:', testPoll);

    // Create another test poll
    const anotherPoll = new Poll({
      title: 'Which framework do you prefer for web development?',
      options: [
        { text: 'React', votes: 0 },
        { text: 'Vue', votes: 0 },
        { text: 'Angular', votes: 0 },
        { text: 'Svelte', votes: 0 }
      ],
      createdBy: new mongoose.Types.ObjectId(), // Temporary ID
      expiresAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days from now
      isPublic: true
    });

    await anotherPoll.save();
    console.log('Another test poll created successfully:', anotherPoll);

  } catch (error) {
    console.error('Error setting up database:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

setupDatabase(); 