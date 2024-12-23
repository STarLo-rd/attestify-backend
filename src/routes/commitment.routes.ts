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

const acceptCommitmentValidation = [
  check('commitmentId', 'Commitment ID is required').not().isEmpty(),
  check('mnemonic', 'mnemonic is required').not().isEmpty()
];

router.use(authMiddleware)

router.post(
  '/create',
  createCommitmentValidation,
  CommitmentController.createCommitment
);

router.post(
  '/accept',
  acceptCommitmentValidation,
  CommitmentController.acceptCommitment
);

router.post(
  '/acknowledge',
  CommitmentController.acknowledgeCommitment
);

router.post(
  '/discharge',
  CommitmentController.dischargeCommitment
);


// router.get(
//   '/my-commitments', 
//   authMiddleware, 
//   CommitmentController.getUserCommitments
// );

// router.get(
//   '/:id', 
//   authMiddleware, 
//   CommitmentController.getCommitmentById
// );


export const commitmentRoutes = router;