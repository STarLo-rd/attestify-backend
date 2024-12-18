import { Schema, model, Document, Types } from 'mongoose';

export type CommitmentStatus = 'INITIATED' | 'ACKNOWLEDGED' | 'DISCHARGED';

export interface IAssetPayload {
  assetName: string;
  quantity: number;
  unit: string;
}

export interface ICommitment {
  creator: Types.ObjectId;
  committer: Types.ObjectId;
  assetPayload: IAssetPayload;
  status: CommitmentStatus;
  committeeSignature?: string;
  committerSignature?: string;
  commitmentXpubkey?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CommitmentDocument extends Document, ICommitment {}

const commitmentSchema = new Schema<CommitmentDocument>({
  creator: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  committer: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  assetPayload: {
    assetName: {
      type: String,
      required: true,
      trim: true,
    },
    quantity: {
      type: Number,
      required: true,
      min: 0,
    },
    unit: {
      type: String,
      required: true,
      trim: true,
    },
  },
  status: {
    type: String,
    enum: ['INITIATED', 'ACKNOWLEDGED', 'DISCHARGED'],
    default: 'INITIATED',
    required: true,
  },
  committeeSignature: {
    type: String,
    trim: true,
  },
  committerSignature: {
    type: String,
    trim: true,
  },
  commitmentXpubkey: {
    type: String,
    trim: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  }
}, {
  timestamps: true,
});

// Compound unique index to prevent duplicate commitments
commitmentSchema.index({ creator: 1, committer: 1, 'assetPayload.assetName': 1, 'assetPayload.quantity': 1 }, { unique: true });

export const Commitment = model<CommitmentDocument>('Commitment', commitmentSchema);