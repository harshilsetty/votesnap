import express from 'express';
import { auth, adminAuth, optionalAuth } from '../middleware/auth';
import { AuthRequest } from '../middleware/auth';
import Poll from '../models/Poll';
import User from '../models/User';
import mongoose from 'mongoose';

const router = express.Router();

// Create a new poll
router.post('/', auth, async (req: AuthRequest, res) => {
  try {
    const { title, options, expiryHours, isPublic, allowMultipleVotes, allowMultipleOptions, maxSelectableOptions } = req.body;

    // Validate required fields
    if (!title || !options || !expiryHours) {
      return res.status(400).json({ message: 'Title, options, and expiry hours are required' });
    }

    // Validate title length
    if (title.length < 3 || title.length > 200) {
      return res.status(400).json({ message: 'Title must be between 3 and 200 characters' });
    }

    // Validate options
    if (!Array.isArray(options) || options.length < 2) {
      return res.status(400).json({ message: 'At least 2 options are required' });
    }

    // Validate each option
    for (const option of options) {
      if (typeof option !== 'string' || option.trim().length === 0) {
        return res.status(400).json({ message: 'All options must be non-empty strings' });
      }
    }

    // Validate expiry hours
    const hours = Number(expiryHours);
    if (isNaN(hours) || hours < 1 || hours > 168) {
      return res.status(400).json({ message: 'Expiry hours must be between 1 and 168' });
    }

    // Calculate expiration date
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + hours);

    // Create poll
    const poll = new Poll({
      title: title.trim(),
      options: options.map((text: string) => ({ text: text.trim(), votes: 0 })),
      createdBy: req.user._id,
      expiresAt,
      isPublic: isPublic !== false, // Default to public if not specified
      allowMultipleVotes: !!allowMultipleVotes,
      allowMultipleOptions: !!allowMultipleOptions,
      maxSelectableOptions: allowMultipleOptions ? Math.max(2, Math.min(options.length, Number(maxSelectableOptions) || 2)) : undefined,
    });

    await poll.save();

    res.status(201).json(poll);
  } catch (error) {
    console.error('Error creating poll:', error);
    if (error instanceof Error) {
      return res.status(500).json({ message: error.message });
    }
    res.status(500).json({ message: 'Failed to create poll' });
  }
});

// Get all public polls
router.get('/public', async (req, res) => {
  try {
    console.log('Fetching public polls...');
    
    // First check if we can connect to the database
    const dbState = mongoose.connection.readyState;
    console.log('Database connection state:', dbState);
    
    if (dbState !== 1) {
      console.error('Database not connected. State:', dbState);
      return res.status(500).json({ message: 'Database connection error' });
    }

    const polls = await Poll.find({ isPublic: true })
      .sort({ createdAt: -1 })
      .populate('createdBy', 'name email role profilePic')
      .lean();

    console.log('Raw polls data:', JSON.stringify(polls, null, 2));

    // Add status field to each poll
    const pollsWithStatus = polls.map(poll => {
      try {
        return {
          ...poll,
          status: new Date(poll.expiresAt) < new Date() ? 'expired' : 'active'
        };
      } catch (err) {
        console.error('Error processing poll:', poll._id, err);
        return {
          ...poll,
          status: 'error'
        };
      }
    });

    console.log(`Found ${pollsWithStatus.length} public polls`);
    res.json(pollsWithStatus);
  } catch (error) {
    console.error('Error fetching public polls:', error);
    if (error instanceof Error) {
      console.error('Error details:', error.message);
      console.error('Error stack:', error.stack);
    }
    res.status(500).json({ 
      message: 'Failed to fetch polls',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Get user's polls
router.get('/user', auth, async (req: AuthRequest, res, next) => {
  try {
    console.log('Current user in /polls/user:', req.user);
    console.log(`Fetching polls for user ${req.user._id}...`);
    const polls = await Poll.find({ createdBy: req.user._id })
      .sort({ createdAt: -1 })
      .populate('createdBy', 'name email role profilePic')
      .lean();

    // Add status field to each poll
    const pollsWithStatus = polls.map(poll => ({
      ...poll,
      status: new Date(poll.expiresAt) < new Date() ? 'expired' : 'active'
    }));

    console.log(`Found ${pollsWithStatus.length} polls for user`);
    res.json(pollsWithStatus);
  } catch (error) {
    console.error('Error fetching user polls:', error);
    res.status(500).json({ message: 'Failed to fetch polls' });
  }
});

// Get a specific poll
router.get('/:id', optionalAuth, async (req: AuthRequest, res) => {
  try {
    let poll = await Poll.findById(req.params.id)
      .populate('createdBy', 'name email role profilePic');
    if (!poll) {
      return res.status(404).json({ message: 'Poll not found' });
    }

    const userId = req.user?._id;
    const userRole = req.user?.role;
    // If the user is the creator or an admin, populate voters with emails
    if ((userId && poll.createdBy && poll.createdBy._id && poll.createdBy._id.toString() === userId.toString()) || userRole === 'admin') {
      poll = await Poll.findById(req.params.id)
        .populate('createdBy', 'name email role profilePic')
        .populate('voters', 'email');
      return res.json(poll);
    }

    // Check if poll is private
    if (!poll.isPublic) {
      const accessCode = req.query.accessCode as string;
      if (!accessCode || accessCode !== poll.accessCode) {
        return res.status(403).json({ message: 'Access denied. This is a private poll.' });
      }
    }

    res.json(poll);
  } catch (error) {
    console.error('Error fetching poll:', error);
    res.status(500).json({ message: 'Failed to fetch poll' });
  }
});

// Vote on a poll
router.post('/:id/vote', auth, async (req: AuthRequest, res) => {
  try {
    let { optionId, optionIds, accessCode } = req.body;
    const userId = req.user._id;
    const poll = await Poll.findById(req.params.id);

    if (!poll) {
      return res.status(404).json({ message: 'Poll not found' });
    }

    // Debug log for allowMultipleVotes and allowMultipleOptions
    console.log('Poll allowMultipleVotes:', poll.allowMultipleVotes, 'allowMultipleOptions:', poll.allowMultipleOptions);

    // Check if poll is expired
    if (poll.status === 'expired') {
      return res.status(400).json({ message: 'This poll has expired' });
    }

    // Check if poll is private
    if (!poll.isPublic) {
      if (!accessCode || accessCode !== poll.accessCode) {
        return res.status(403).json({ message: 'Access denied. This is a private poll.' });
      }
    }

    // Prevent multiple votes by the same user if not allowed
    if (poll.allowMultipleVotes === false && poll.voters && poll.voters.some((v: any) => v.toString() === userId.toString())) {
      return res.status(400).json({ message: 'You have already voted in this poll.' });
    }

    // Handle multiple options
    if (poll.allowMultipleOptions) {
      // Accept optionIds as array
      if (!Array.isArray(optionIds) || optionIds.length === 0) {
        return res.status(400).json({ message: 'Please select at least one option to vote.' });
      }
      // Prevent duplicate optionIds
      optionIds = [...new Set(optionIds.map((id: any) => String(id)))];
      // Enforce maxSelectableOptions
      if (poll.maxSelectableOptions && optionIds.length > poll.maxSelectableOptions) {
        return res.status(400).json({ message: `You can select up to ${poll.maxSelectableOptions} options.` });
      }
      // Validate all optionIds
      for (const oid of optionIds) {
        const option = poll.options.find((opt: any) => String(opt._id) === String(oid));
        if (!option) {
          return res.status(400).json({ message: 'Invalid option selected.' });
        }
        option.votes += 1;
      }
      poll.totalVotes = (poll.totalVotes || 0) + 1;
      poll.voters = poll.voters || [];
      poll.voters.push(userId);
      await poll.save();
      return res.json(poll);
    } else {
      // Single option voting
      if (!optionId) {
        return res.status(400).json({ message: 'Please select an option to vote.' });
      }
      const option = poll.options.find((opt: any) => String(opt._id) === String(optionId));
      if (!option) {
        return res.status(400).json({ message: 'Invalid option' });
      }
      option.votes += 1;
      poll.totalVotes = (poll.totalVotes || 0) + 1;
      poll.voters = poll.voters || [];
      poll.voters.push(userId);
      await poll.save();
      return res.json(poll);
    }
  } catch (error) {
    console.error('Error voting:', error);
    res.status(500).json({ message: 'Failed to submit vote' });
  }
});

// Get admin dashboard data
router.get('/admin/dashboard', adminAuth, async (req, res) => {
  try {
    console.log('Fetching admin dashboard data...');
    const polls = await Poll.find()
      .sort({ createdAt: -1 })
      .populate('createdBy', 'name email role profilePic')
      .lean();

    // Add status field to each poll
    const pollsWithStatus = polls.map(poll => ({
      ...poll,
      status: new Date(poll.expiresAt) < new Date() ? 'expired' : 'active'
    }));

    console.log(`Found ${pollsWithStatus.length} polls for admin dashboard`);
    res.json(pollsWithStatus);
  } catch (error) {
    console.error('Error fetching admin dashboard data:', error);
    res.status(500).json({ message: 'Failed to fetch dashboard data' });
  }
});

// Delete a poll
router.delete('/:id', auth, async (req: AuthRequest, res) => {
  try {
    const poll = await Poll.findById(req.params.id);
    
    if (!poll) {
      return res.status(404).json({ message: 'Poll not found' });
    }

    // Check if user is the creator or an admin
    if (poll.createdBy.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to delete this poll' });
    }

    await poll.deleteOne();
    res.json({ message: 'Poll deleted successfully' });
  } catch (error) {
    console.error('Error deleting poll:', error);
    res.status(500).json({ message: 'Failed to delete poll' });
  }
});

// Create a test poll (temporary route for testing)
router.post('/test/create', async (req, res) => {
  try {
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
    console.log('Test poll created:', testPoll);
    res.status(201).json(testPoll);
  } catch (error) {
    console.error('Error creating test poll:', error);
    res.status(500).json({ message: 'Failed to create test poll', error: error instanceof Error ? error.message : 'Unknown error' });
  }
});

// Declare poll results
router.patch('/:id/declare-results', auth, async (req: AuthRequest, res) => {
  try {
    const poll = await Poll.findById(req.params.id);
    if (!poll) {
      return res.status(404).json({ message: 'Poll not found' });
    }
    const creatorId = poll.createdBy._id ? poll.createdBy._id.toString() : poll.createdBy.toString();
    if (creatorId !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to declare results for this poll' });
    }
    poll.resultsDeclared = true;
    await poll.save();
    res.json({ message: 'Results declared', poll });
  } catch (error) {
    console.error('Error declaring results:', error);
    res.status(500).json({ message: 'Failed to declare results' });
  }
});

export default router; 