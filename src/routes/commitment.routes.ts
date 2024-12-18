import { Router } from 'express';
import { check } from 'express-validator';
import { CommitmentController } from '../controllers/commitment.controller'; 
import { authMiddleware } from '../middleware/auth.middleware';

const router = Router();

const createCommitmentValidation = [
  check('committer', 'Committer ID is required').not().isEmpty(),
  check('assetPayload', 'Asset payload is required').not().isEmpty(),
  check('assetPayload.assetName', 'Asset name is required').not().isEmpty(),
  check('assetPayload.quantity', 'Quantity is required and must be a number').isFloat({ min: 0 }),
  check('assetPayload.unit', 'Unit is required').not().isEmpty()
];

const signCommitmentValidation = [
  check('commitmentId', 'Commitment ID is required').not().isEmpty(),
  check('mnemonic', 'mnemonic is required').not().isEmpty()
];

router.post(
  '/create', 
  authMiddleware, 
  createCommitmentValidation, 
  CommitmentController.createCommitment
);

router.post(
  '/sign', 
  authMiddleware, 
  signCommitmentValidation, 
  CommitmentController.signCommitment
);

router.get(
  '/my-commitments', 
  authMiddleware, 
  CommitmentController.getUserCommitments
);

router.get(
  '/:id', 
  authMiddleware, 
  CommitmentController.getCommitmentById
);

router.post(
  '/discharge', 
  authMiddleware, 
  CommitmentController.dischargeCommitment
);

export const commitmentRoutes = router;