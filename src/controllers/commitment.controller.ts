import { NextFunction, Request, Response } from "express";
import { validationResult } from "express-validator";
import { CommitmentService } from "../services/commitment.service";
import { catchAsync } from "../utils/catchAsync";
import { AuthError } from "../utils/errors";
import { Commitment } from "../models/Commitment";
import { User } from "../models/User";
import { Attestation } from "attestify";

export class CommitmentController {
  static createCommitment = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        throw new AuthError("Validation error", 400, errors.array());
      }

      const { committer, assetPayload } = req.body;
      const committee = req.user?.user.id;

      try {
        const commitment = await CommitmentService.createCommitment(
          committee,
          committer,
          assetPayload
        );

        res.status(201).json({
          success: true,
          data: commitment,
        });
      } catch (error) {
        next(error);
      }
    }
  );

  static acknowledgeCommitment = catchAsync(
    async (req: Request, res: Response) => {
      const { commitmentId, mnemonic } = req.body;

      const commitment = await Commitment.findById(commitmentId).lean();
      if (!commitment) {
        throw new AuthError("Commitment not found", 404);
      }

      // Create fresh attestation instance with initial state
      const attestify = new Attestation(
        commitment.committerXpub,
        commitment.committeeXpub,
        "m/44'/60'/0'/0",
        commitment.attestationPayload,
        "",
        "",
        "",
        // Attest.INITIATED,
        commitment.commitmentState,
        commitment.attestationId
      );

      try {
        // Generate committee signature
        const committeeSignature = attestify.sign(mnemonic);

        attestify.setCommitteeSignature(committeeSignature);
        attestify.acknowledgeAttestation();

        const updatedCommitment = await CommitmentService.updateCommitment(
          commitment._id,
          attestify
        );

        res.json({
          success: true,
          data: updatedCommitment,
        });
      } catch (error) {
        console.error("[DEBUG] Acknowledge Error:", error);
        throw error;
      }
    }
  );

  static acceptCommitment = catchAsync(async (req: Request, res: Response) => {
    const { commitmentId, mnemonic } = req.body;

    const commitment = await Commitment.findById(commitmentId).lean();
    if (!commitment) {
      throw new Error("Commitment not found");
    }


    try {
      // Create attestation instance with stored state
      const attestify = new Attestation(
        commitment.committerXpub,
        commitment.committeeXpub,
        "m/44'/60'/0'/0",
        commitment.attestationPayload,
        "",
        commitment.committeeSignature,
        "",
        commitment.commitmentState,
        commitment.attestationId
      );

      // Generate committer signature
      const committerSignature = attestify.sign(mnemonic);

      attestify.setCommitterSignature(committerSignature);
      attestify.acceptAttestation();

      const updatedCommitment = await CommitmentService.updateCommitment(
        commitment._id,
        attestify
      );

      res.json({
        success: true,
        data: updatedCommitment,
      });
    } catch (error) {
      console.error("[DEBUG] Accept Error:", error);
      throw error;
    }
  });

  static dischargeCommitment = catchAsync(
    async (req: Request, res: Response) => {
      const { commitmentId, mnemonic } = req.body;

      const commitment = await Commitment.findById(commitmentId).lean();
      if (!commitment) {
        throw new Error("Commitment not found");
      }

      try {
        // Create attestation instance with current state
        const attestify = new Attestation(
          commitment.committerXpub,
          commitment.committeeXpub,
          "m/44'/60'/0'/0",
          commitment.attestationPayload,
          commitment.committerSignature,
          commitment.committeeSignature,
          "", // Start with empty discharge signature
          commitment.commitmentState,
          commitment.attestationId
        );

        // Generate and set discharge signature
        const dischargeSignature = attestify.sign(mnemonic);

        attestify.setDischargeSignature(dischargeSignature);
        attestify.dischargeAttestation();

        const updatedCommitment = await CommitmentService.updateCommitment(
          commitment._id,
          attestify
        );

        res.json({
          success: true,
          data: updatedCommitment,
        });
      } catch (error) {
        console.error("Discharge Error:", error);
        throw new AuthError(
          error instanceof Error
            ? error.message
            : "Failed to discharge commitment",
          400
        );
      }
    }
  );
}
