import { Schema, model, Document } from 'mongoose';

export interface IUser {
  username: string;
  email: string;
  password: string;
  xpubkey: string;
  createdAt: Date;
}

export interface UserDocument extends Document, IUser {}

const userSchema = new Schema<UserDocument>({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    minlength: 3,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
  },
  password: {
    type: String,
    required: true,
    minlength: 6,
  },
  xpubkey: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export const User = model<UserDocument>('User', userSchema);
