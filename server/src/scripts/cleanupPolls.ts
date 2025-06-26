import mongoose from 'mongoose';
import Poll from '../models/Poll';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/votesnap';

// CHANGE THIS to your actual user ID (as a string)
const MY_USER_ID = '6841c6ec0d2b379c524bac1d';

async function cleanupPolls() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    // Find polls not created by you
    const orphanPolls = await Poll.find({ createdBy: { $ne: new mongoose.Types.ObjectId(MY_USER_ID) } });
    if (orphanPolls.length === 0) {
      console.log('No orphan/test polls found.');
    } else {
      console.log(`Found ${orphanPolls.length} orphan/test polls. Deleting...`);
      orphanPolls.forEach(poll => {
        console.log(`Deleting poll: ${poll._id} | Title: ${poll.title}`);
      });
      await Poll.deleteMany({ createdBy: { $ne: new mongoose.Types.ObjectId(MY_USER_ID) } });
      console.log('Deleted all orphan/test polls.');
    }
  } catch (error) {
    console.error('Error cleaning up polls:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

cleanupPolls(); 