import { Schema, model, Document } from 'mongoose';

export interface IUser {
  username: string;
  email: string;
  password: string;
  createdAt: Date;
}

export interface UserDocument extends IUser, Document {}

const userSchema = new Schema<IUser>({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    minlength: 3
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

export const User = model<UserDocument>('User', userSchema);