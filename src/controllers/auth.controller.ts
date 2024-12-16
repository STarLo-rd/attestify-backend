import { Request, Response } from 'express';
import { validationResult } from 'express-validator';
import { AuthService } from '../services/auth.service';
import { catchAsync } from '../utils/catchAsync';
import { AuthError } from '../utils/errors';
import { User } from '../models/User';


export class AuthController {
  static register = catchAsync(async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new AuthError('Validation error', 400, errors.array());
    }

    const { username, email, password } = req.body;
    const user = await AuthService.createUser(username, email, password);
    const token = AuthService.generateToken(user.id);

    res.json({ token });
  });

  static login = catchAsync(async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new AuthError('Validation error', 400, errors.array());
    }

    const { email, password } = req.body;
    const user = await AuthService.validateUser(email, password);
    const token = AuthService.generateToken(user.id);

    res.json({ token });
  });

  static getProfile = catchAsync(async (req: Request, res: Response) => {
    const user = await User.findById(req.user?.user.id).select('-password');
    if (!user) {
      throw new AuthError('User not found', 404);
    }
    res.json(user);
  });
}