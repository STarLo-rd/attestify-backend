import { Schema, model, Document, Types } from "mongoose";

export type CommitmentStatus =
  | "CREATED"
  | "ACCEPTED"
  | "ACKNOWLEDGED"
  | "DISCHARGED";

export interface IAssetPayload {
  assetName: string;
  quantity: number;
  unit: string;
}

export interface ICommitment {
  commitmentId: Number;
  committee: Types.ObjectId;
  committer: Types.ObjectId;
  assetPayload: IAssetPayload;
  status: CommitmentStatus;
  committeeSignature?: string;
  committerSignature?: string;
  committeeXpubKey?: string;
  committerXpubKey?: string;
  commitmentXpubkey?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CommitmentDocument extends Document, ICommitment {}

const commitmentSchema = new Schema<CommitmentDocument>(
  {
    commitmentId: {
      type: Number,
      required: true,
    },
    committee: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    committer: {
      type: Schema.Types.ObjectId,
      ref: "User",
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
      enum: ["CREATED", "ACCEPTED", "ACKNOWLEDGED", "DISCHARGED"],
      default: "CREATED",
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
    committeeXpubKey: {
      type: String,
      trim: true,
    },
    committerXpubKey: {
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
    },
  },
  {
    timestamps: true,
  }
);

// Compound unique index to prevent duplicate commitments
commitmentSchema.index(
  {
    committee: 1,
    committer: 1,
    "assetPayload.assetName": 1,
    "assetPayload.quantity": 1,
  },
  { unique: true }
);

export const Commitment = model<CommitmentDocument>(
  "Commitment",
  commitmentSchema
);
