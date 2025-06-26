import mongoose from 'mongoose';

export interface IPoll extends mongoose.Document {
  title: string;
  options: {
    text: string;
    votes: number;
  }[];
  totalVotes: number;
  createdAt: Date;
  expiresAt: Date;
  status: 'active' | 'expired';
  createdBy: mongoose.Types.ObjectId;
  isPublic: boolean;
  accessCode: string;
  allowedVoters: mongoose.Types.ObjectId[];
  voters: mongoose.Types.ObjectId[];
  resultsDeclared: boolean;
}

const pollSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true
  },
  options: [{
    text: {
      type: String,
      required: [true, 'Option text is required'],
      trim: true
    },
    votes: {
      type: Number,
      default: 0
    }
  }],
  totalVotes: {
    type: Number,
    default: 0
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  expiresAt: {
    type: Date,
    required: [true, 'Expiration date is required']
  },
  status: {
    type: String,
    enum: ['active', 'expired'],
    default: 'active'
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  isPublic: {
    type: Boolean,
    default: true
  },
  accessCode: {
    type: String,
    unique: true,
    sparse: true
  },
  allowedVoters: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  voters: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: []
  }],
  resultsDeclared: {
    type: Boolean,
    default: false,
  },
}, {
  timestamps: true
});

// Generate a unique access code before saving
pollSchema.pre('save', async function(next) {
  if (!this.isPublic && !this.accessCode) {
    // Generate a random 8-character code
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code;
    let isUnique = false;

    while (!isUnique) {
      code = '';
      for (let i = 0; i < 8; i++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length));
      }
      
      // Check if code is unique
      const existingPoll = await mongoose.model('Poll').findOne({ accessCode: code });
      if (!existingPoll) {
        isUnique = true;
      }
    }

    this.accessCode = code;
  }
  next();
});

// Update status based on expiration
pollSchema.pre('save', function(next) {
  if (this.isModified('expiresAt') || this.isModified('status')) {
    const now = new Date();
    if (now > this.expiresAt) {
      this.status = 'expired';
    }
  }
  next();
});

export default mongoose.model<IPoll>('Poll', pollSchema); 