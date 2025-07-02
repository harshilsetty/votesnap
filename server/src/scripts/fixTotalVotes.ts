import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Poll from '../models/Poll';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/votesnap';

async function fixTotalVotes() {
  await mongoose.connect(MONGODB_URI);
  const polls = await Poll.find();
  let updated = 0;

  for (const poll of polls) {
    const sum = poll.options.reduce((acc: number, opt: any) => acc + (opt.votes || 0), 0);
    if (poll.totalVotes !== sum) {
      poll.totalVotes = sum;
      await poll.save();
      updated++;
      console.log(`Updated poll ${poll._id}: totalVotes set to ${sum}`);
    }
  }

  console.log(`Done! Updated ${updated} poll(s).`);
  await mongoose.disconnect();
}

fixTotalVotes().catch(err => {
  console.error('Error fixing totalVotes:', err);
  process.exit(1);
}); 