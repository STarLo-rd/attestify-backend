import { uuidV4 } from "ethers";
import { Commitment, ICommitment } from "../models/Commitment";
import { User } from "../models/User";
import { AuthError } from "../utils/errors";
import { Attest, Attestation } from "attestify";

export class CommitmentService {
  // Helper to ensure consistent payload handling
  private static preparePayload(payload: any): string {
    return typeof payload === "string" ? payload : JSON.stringify(payload);
  }

  static async createCommitment(
    committeeId: string,
    committerId: string,
    assetPayload: ICommitment["attestationPayload"]
  ) {
    // Validate both users exist
    const committee = await User.findById(committeeId);
    const committer = await User.findById(committerId);

    if (!committee || !committer) {
      throw new AuthError("Invalid committee or committer", 400);
    }
    const preparedPayload = this.preparePayload(assetPayload);

    // Construct attestation object
    const attestation = new Attestation(
      committer.xpubkey,
      committee.xpubkey,
      "m/44'/60'/0'/0",
      preparedPayload,
      "",
      "",
      "",
      Attest.INITIATED
    );

    try {
      // Create commitment
      const commitment = new Commitment({
        ...attestation,
        committeeId,
        committerId,
      });
      await commitment.save();

      return commitment;
    } catch (error: any) {
      // Customize error message for duplicate key errors
      if (error.code === 11000) {
        const duplicateKey = error.keyValue || "unknown";
        throw new AuthError(
          `Duplicate key error: A commitment with the same data already exists. Duplicate field: ${JSON.stringify(
            duplicateKey
          )}`,
          409
        );
      }

      // Re-throw other errors
      throw error;
    }
  }

  static async updateCommitment(
    commitmentId: string,
    attestation: any,
  ) {
    const updatePayload = {
      committeeSignature: attestation.committeeSignature,
      committerSignature: attestation.committerSignature,
      dischargeSignature: attestation.dischargeSignature,
      commitmentState: attestation.commitmentState,
    };
    const commitment = await Commitment.findByIdAndUpdate(
      commitmentId,
      { $set: updatePayload },
      { new: true }
    );

    if (!commitment) {
      throw new Error("Failed to update commitment");
    }

    return commitment;
  }

  static async getUserCommitments(userId: string) {
    return Commitment.find({
      $or: [{ committee: userId }, { committer: userId }],
    })
      .populate("committee", "username email")
      .populate("committer", "username email");
  }
}
