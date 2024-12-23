import { Request, Response } from "express";
import { validationResult } from "express-validator";
import { CommitmentService } from "../services/commitment.service";
import { catchAsync } from "../utils/catchAsync";
import { AuthError } from "../utils/errors";
import { Attestify } from "../utils/lib"
import { Commitment } from "../models/Commitment";
import { deriveCommitmentXpubKey } from "../utils/xpubservice";
import { User } from "../models/User";

export class CommitmentController {
  static createCommitment = catchAsync(async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new AuthError("Validation error", 400, errors.array());
    }

    const { committer, assetPayload } = req.body;
    const committee = req.user?.user.id;

    // Initialize Attestify with the payload
    const attestify = new Attestify({
      committee,
      committer,
      assetPayload
    });

    // Create the commitment
    const commitmentPayload = attestify.createCommitment();
    
    // Store in database
    const commitment = await CommitmentService.createCommitment(
      commitmentPayload.commitmentId,
      commitmentPayload.committee,
      commitmentPayload.committer,
      commitmentPayload.assetPayload,
      commitmentPayload.status,
    );

    res.status(201).json(commitment);
  });

  static acceptCommitment = catchAsync(async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new AuthError("Validation error", 400, errors.array());
    }
  
    const { commitmentId, mnemonic } = req.body;
    const userId = req.user?.user.id;

    const committee = await User.findById(req.user?.user.id);
    console.log("commitee", committee)
  
    // Get commitment from database
    const commitment = await Commitment.findById(commitmentId).lean();
  
    if (!commitment) {
      throw new Error('Commitment not found');
    }
  
    // Initialize Attestify with existing commitment
    const attestify = new Attestify(commitment);
  

      // Then accept the commitment with the signature
    const updatedPayload = attestify.accept(mnemonic, committee?.xpubkey);
    console.log(updatedPayload, "updatedPayload")
  
    // Update in database
    const updatedCommitment = await CommitmentService.updateCommitment(
      commitment._id,
      updatedPayload
    );
  
    res.json(updatedPayload);
  });

  static acknowledgeCommitment = catchAsync(async (req: Request, res: Response) => {
    const { commitmentId, mnemonic } = req.body;
    const userId = req.user?.user.id;

    const commitment = await Commitment.findById(commitmentId).lean();
    if (!commitment) {
      throw new Error('Commitment not found');
    }

    console.log("commitment", commitment)
    const attestify = new Attestify(commitment);
    
    const updatedPayload = attestify.acknowledge(mnemonic);

     // Update in database
     const updatedCommitment = await CommitmentService.updateCommitment(
      commitment._id,
      updatedPayload
    );
    console.log("udpatedPyaload", updatedPayload)
    
    // const updatedCommitment = await CommitmentService.(
    //   commitmentId,
    //   userId,
    //   updatedPayload.committeeSignature
    // );

    res.json(updatedPayload);
  });

  static dischargeCommitment = catchAsync(async (req: Request, res: Response) => {
    const { commitmentId, mnemonic } = req.body;
    const userId = req.user?.user.id;

    const commitment = await Commitment.findById(commitmentId);
    const attestify = new Attestify(commitment);
    
    const updatedPayload = attestify.discharge(mnemonic, userId);

    console.log(updatedPayload)
    
    // const dischargedCommitment = await CommitmentService.dischargeCommitment(
    //   commitmentId,
    //   userId,
    //   updatedPayload.dischargeSignature
    // );

    res.json(updatedPayload);
  });
}