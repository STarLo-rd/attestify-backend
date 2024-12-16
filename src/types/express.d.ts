import { UserDocument } from '../models/User';

declare global {
  namespace Express {
    interface Request {
      user?: {
        user: {
          id: string;
        };
      };
    }
  }
}