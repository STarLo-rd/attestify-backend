import { Commitment, ICommitment } from "../models/Commitment";
import { User } from "../models/User";
import { AuthError } from "../utils/errors";
import { deriveCommitmentXpubKey } from "../utils/lib";

export class CommitmentService {
  static async createCommitment(
    creatorId: string,
    committerId: string,
    assetPayload: ICommitment['assetPayload']
  ) {
    // Validate both users exist
    const creator = await User.findById(creatorId);
    const committer = await User.findById(committerId);

    if (!creator || !committer) {
      throw new AuthError("Invalid creator or committer", 400);
    }

    // Check for duplicate commitment
    const existingCommitment = await Commitment.findOne({
      creator: creatorId,
      committer: committerId,
      'assetPayload.assetName': assetPayload.assetName,
      'assetPayload.quantity': assetPayload.quantity
    });

    if (existingCommitment) {
      throw new AuthError("Commitment already exists", 409);
    }

    // Create commitment
    const commitment = new Commitment({
      creator: creatorId,
      committer: committerId,
      assetPayload,
      status: 'INITIATED'
    });

    await commitment.save();

    return commitment;
  }

  static async signCommitment(
    commitmentId: string,
    userId: string,
    signature: string
  ) {
    const commitment = await Commitment.findById(commitmentId);

    if (!commitment) {
      throw new AuthError("Commitment not found", 404);
    }

    // Check if user is either creator or committer
    const isCreator = commitment.creator.toString() === userId;
    const isCommitter = commitment.committer.toString() === userId;

    if (!isCreator && !isCommitter) {
      throw new AuthError("Unauthorized to sign this commitment", 403);
    }

    // Update signature based on user role
    if (isCreator) {
      commitment.committeeSignature = signature;
    } else {
      commitment.committerSignature = signature;
    }

    // Update status if both signatures are present
    if (commitment.committeeSignature && commitment.committerSignature) {
      commitment.status = 'ACKNOWLEDGED';
    }

    await commitment.save();

    return commitment;
  }

  static async getUserCommitments(userId: string) {
    return Commitment.find({
      $or: [{ creator: userId }, { committer: userId }]
    }).populate('creator', 'username email')
      .populate('committer', 'username email');
  }

  static async getCommitmentById(
    commitmentId: string, 
    userId: string
  ) {
    const commitment = await Commitment.findById(commitmentId)
      .populate('creator', 'username email')
      .populate('committer', 'username email');

    if (!commitment) {
      throw new AuthError("Commitment not found", 404);
    }

    // Ensure user is either creator or committer
    const isCreator = commitment.creator._id.toString() === userId;
    const isCommitter = commitment.committer._id.toString() === userId;

    if (!isCreator && !isCommitter) {
      throw new AuthError("Unauthorized to view this commitment", 403);
    }

    return commitment;
  }

  static async dischargeCommitment(
    commitmentId: string, 
    userId: string
  ) {
    const commitment = await Commitment.findById(commitmentId);

    if (!commitment) {
      throw new AuthError("Commitment not found", 404);
    }

    // Validate signatures and user
    if (!commitment.committeeSignature || !commitment.committerSignature) {
      throw new AuthError("Cannot discharge: Missing signatures", 400);
    }

    // Ensure user is either creator or committer
    const isCreator = commitment.creator.toString() === userId;
    const isCommitter = commitment.committer.toString() === userId;

    if (!isCreator && !isCommitter) {
      throw new AuthError("Unauthorized to discharge this commitment", 403);
    }

    // Update status
    commitment.status = 'DISCHARGED';
    await commitment.save();

    return commitment;
  }
}