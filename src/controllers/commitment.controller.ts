import { Request, Response } from "express";
import { validationResult } from "express-validator";
import { CommitmentService } from "../services/commitment.service";
import { catchAsync } from "../utils/catchAsync";
import { AuthError } from "../utils/errors";
import {
  createCommitmentSignature,
  deriveCommitmentXpubKey,
} from "../utils/lib";
import { Commitment } from "../models/Commitment";

export class CommitmentController {
  static createCommitment = catchAsync(async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new AuthError("Validation error", 400, errors.array());
    }

    const { committer, assetPayload } = req.body;
    const creator = req.user?.user.id;

    const commitment = await CommitmentService.createCommitment(
      creator,
      committer,
      assetPayload
    );

    res.status(201).json(commitment);
  });

  static signCommitment = catchAsync(async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new AuthError("Validation error", 400, errors.array());
    }

    const { commitmentId, mnemonic } = req.body;
    //todo: get the commitment payload using the commitmentId
    const commitment = await Commitment.findById(commitmentId);
    const payload = commitment.assetPayload || {};
    const userId = req.user?.user.id;
    const signature = createCommitmentSignature(payload, mnemonic);

    console.log("signature", signature);
    const updatedCommitment = await CommitmentService.signCommitment(
      commitmentId,
      userId,
      signature
    );

    res.json(updatedCommitment);
  });

  static getUserCommitments = catchAsync(
    async (req: Request, res: Response) => {
      const userId = req.user?.user.id;

      const commitments = await CommitmentService.getUserCommitments(userId);

      res.json(commitments);
    }
  );

  static getCommitmentById = catchAsync(async (req: Request, res: Response) => {
    const commitmentId = req.params.id;
    const userId = req.user?.user.id;

    const commitment = await CommitmentService.getCommitmentById(
      commitmentId,
      userId
    );

    res.json(commitment);
  });

  static dischargeCommitment = catchAsync(
    async (req: Request, res: Response) => {
      const { commitmentId } = req.body;
      const userId = req.user?.user.id;

      const discharedCommitment = await CommitmentService.dischargeCommitment(
        commitmentId,
        userId
      );

      res.json(discharedCommitment);
    }
  );
}
