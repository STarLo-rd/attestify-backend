import { Schema, model, Document, Types } from "mongoose";

// Define CommitmentStatus type
export type CommitmentStatus =
  | "INITIATED"
  | "ACCEPTED"
  | "ACKNOWLEDGED"
  | "DISCHARGED";

// Define ICommitment interface
export interface ICommitment extends Document {
  commitmentId: Types.ObjectId; //   committeeId: Types.ObjectId;
  committeeId: Types.ObjectId;
  committerId: Types.ObjectId;
  committeeSignature?: string;
  committerSignature?: string;
  dischargeSignature?: string;
  committeeXpub?: string;
  committerXpub?: string;
  attestationPayload: string; // Now stringified
  derivationPath: string;
  attestationId: string;
  committer: string;
  committee: string;
  commitmentState: CommitmentStatus;
  createdAt: Date;
  updatedAt: Date;
}

// Schema definition
const commitmentSchema = new Schema<ICommitment>(
  {
    commitmentId: {
      type: Schema.Types.ObjectId, // Automatically assigns ObjectId
      default: () => new Types.ObjectId(), // Automatically initialize when created
      required: true,
    },
    committeeId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Committee ID is required."],
    },
    committerId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Committer ID is required."],
    },
    committeeSignature: {
      type: String,
      trim: true,
    },
    committerSignature: {
      type: String,
      trim: true,
    },
    dischargeSignature: {
      type: String,
      trim: true,
    },
    committeeXpub: {
      type: String,
      required: [true, "Committee Xpub Key is required."],
      trim: true,
    },
    committerXpub: {
      type: String,
      required: [true, "Committer Xpub Key is required."],
      trim: true,
    },
    attestationPayload: {
      type: String,
      required: [true, "Attestation payload is required."],
      get: (payload: string) => JSON.parse(payload),
      set: (payload: any) => JSON.stringify(payload),
    },
    derivationPath: {
      type: String,
      required: [true, "Derivation path is required."],
      trim: true,
    },
    attestationId: {
      type: String,
      required: [true, "Attestation ID is required."],
      unique: true,
      trim: true,
    },
    committer: {
      type: String,
      required: [true, "Committer is required."],
      trim: true,
    },
    committee: {
      type: String,
      required: [true, "Committee is required."],
      trim: true,
    },
    commitmentState: {
      type: String,
      enum: ["INITIATED", "ACCEPTED", "ACKNOWLEDGED", "DISCHARGED"],
      default: "INITIATED",
      required: [true, "Commitment state is required."],
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
    toJSON: { getters: true }, // Enable getters for JSON responses
    toObject: { getters: true }, // Enable getters for objects
  }
);

// Compound unique index to prevent duplicate commitments
commitmentSchema.index(
  {
    committeeId: 1,
    committerId: 1,
    attestationId: 1,
  },
  { unique: true }
);

export const Commitment = model<ICommitment>("Commitment", commitmentSchema);
