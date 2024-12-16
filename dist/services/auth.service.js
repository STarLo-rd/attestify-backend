"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const User_1 = require("../models/User");
const errors_1 = require("../utils/errors");
class AuthService {
    static async hashPassword(password) {
        const salt = await bcryptjs_1.default.genSalt(10);
        return bcryptjs_1.default.hash(password, salt);
    }
    static async comparePasswords(password, hashedPassword) {
        return bcryptjs_1.default.compare(password, hashedPassword);
    }
    static generateToken(userId) {
        return jsonwebtoken_1.default.sign({ user: { id: userId } }, process.env.JWT_SECRET, { expiresIn: '1h' });
    }
    static async createUser(username, email, password) {
        const existingUser = await User_1.User.findOne({ $or: [{ email }, { username }] });
        if (existingUser) {
            throw new errors_1.AuthError('User already exists');
        }
        const hashedPassword = await this.hashPassword(password);
        const user = new User_1.User({
            username,
            email,
            password: hashedPassword
        });
        return user.save();
    }
    static async validateUser(email, password) {
        const user = await User_1.User.findOne({ email });
        if (!user) {
            throw new errors_1.AuthError('Invalid credentials');
        }
        const isValidPassword = await this.comparePasswords(password, user.password);
        if (!isValidPassword) {
            throw new errors_1.AuthError('Invalid credentials');
        }
        return user;
    }
}
exports.AuthService = AuthService;
