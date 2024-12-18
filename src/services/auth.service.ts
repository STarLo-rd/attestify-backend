import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User, UserDocument } from '../models/User';
import { AuthError } from '../utils/errors';

export class AuthService {
  static async hashPassword(password: string): Promise<string> {
    const salt = await bcrypt.genSalt(10);
    return bcrypt.hash(password, salt);
  }

  static async comparePasswords(password: string, hashedPassword: string): Promise<boolean> {
    return bcrypt.compare(password, hashedPassword);
  }

  static generateToken(userId: string): string {
    return jwt.sign({ user: { id: userId } }, process.env.JWT_SECRET, { expiresIn: '1h' });
  }

  static async createUser(username: string, email: string, password: string, xpubkey: string): Promise<UserDocument> {
    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      throw new AuthError('User already exists');
    }

    const hashedPassword = await this.hashPassword(password);
    const user = new User({
      username,
      email,
      password: hashedPassword,
      xpubkey
    });

    return user.save();
  }

  static async validateUser(email: string, password: string): Promise<UserDocument> {
    const user = await User.findOne({ email });
    if (!user) {
      throw new AuthError('Invalid credentials');
    }

    const isValidPassword = await this.comparePasswords(password, user.password);
    if (!isValidPassword) {
      throw new AuthError('Invalid credentials');
    }

    return user;
  }
}