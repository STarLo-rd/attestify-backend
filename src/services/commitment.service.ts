import { uuidV4 } from "ethers";
import { Commitment, ICommitment } from "../models/Commitment";
import { User } from "../models/User";
import { AuthError } from "../utils/errors";
// import { deriveCommitmentXpubKey } from "../utils/lib";

export class CommitmentService {
  static async createCommitment(
    commitmentId: Number,
    committeeId: string,
    committerId: string,
    assetPayload: ICommitment["assetPayload"],
    status: string
  ) {
    // Validate both users exist
    const committee = await User.findById(committeeId);
    const committer = await User.findById(committerId);

    if (!committee || !committer) {
      throw new AuthError("Invalid committee or committer", 400);
    }

    // Check for duplicate commitment
    const existingCommitment = await Commitment.findOne({
      commitmentId: commitmentId,
      committee: committeeId,
      committer: committerId,
      "assetPayload.assetName": assetPayload.assetName,
      "assetPayload.quantity": assetPayload.quantity,
    });

    if (existingCommitment) {
      throw new AuthError("Commitment already exists", 409);
    }

    // Create commitment
    const commitment = new Commitment({
      commitmentId: commitmentId,
      committee: committeeId,
      committer: committerId,
      assetPayload,
      status,
      // commitmentId: uuidV4();
    });

    await commitment.save();

    return commitment;
  }

  static async updateCommitment(commitmentId: string, updates: Partial<ICommitment>) {
    // Update the commitment in the database directly
    const updatedCommitment = await Commitment.findByIdAndUpdate(
      commitmentId,
      { ...updates, updatedAt: new Date() }, // Include updatedAt to keep the record fresh
      { new: true } // Return the updated document
    );
  
    if (!updatedCommitment) {
      throw new Error("Commitment not found");
    }
  
    return updatedCommitment;
  }
  
  

  static async getUserCommitments(userId: string) {
    return Commitment.find({
      $or: [{ committee: userId }, { committer: userId }],
    })
      .populate("committee", "username email")
      .populate("committer", "username email");
  }

  static async getCommitmentById(commitmentId: string, userId: string) {
    const commitment = await Commitment.findById(commitmentId)
      .populate("committee", "username email")
      .populate("committer", "username email");

    if (!commitment) {
      throw new AuthError("Commitment not found", 404);
    }

    // Ensure user is either committee or committer
    const isCreator = commitment.committee._id.toString() === userId;
    const isCommitter = commitment.committer._id.toString() === userId;

    if (!isCreator && !isCommitter) {
      throw new AuthError("Unauthorized to view this commitment", 403);
    }

    return commitment;
  }

 
}
