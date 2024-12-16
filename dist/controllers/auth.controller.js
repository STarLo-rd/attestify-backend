"use strict";
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthController = void 0;
const express_validator_1 = require("express-validator");
const auth_service_1 = require("../services/auth.service");
const catchAsync_1 = require("../utils/catchAsync");
const errors_1 = require("../utils/errors");
const User_1 = require("../models/User");
class AuthController {
}
exports.AuthController = AuthController;
_a = AuthController;
AuthController.register = (0, catchAsync_1.catchAsync)(async (req, res) => {
    const errors = (0, express_validator_1.validationResult)(req);
    if (!errors.isEmpty()) {
        throw new errors_1.AuthError('Validation error', 400, errors.array());
    }
    const { username, email, password } = req.body;
    const user = await auth_service_1.AuthService.createUser(username, email, password);
    const token = auth_service_1.AuthService.generateToken(user.id);
    res.json({ token });
});
AuthController.login = (0, catchAsync_1.catchAsync)(async (req, res) => {
    const errors = (0, express_validator_1.validationResult)(req);
    if (!errors.isEmpty()) {
        throw new errors_1.AuthError('Validation error', 400, errors.array());
    }
    const { email, password } = req.body;
    const user = await auth_service_1.AuthService.validateUser(email, password);
    const token = auth_service_1.AuthService.generateToken(user.id);
    res.json({ token });
});
AuthController.getProfile = (0, catchAsync_1.catchAsync)(async (req, res) => {
    console.log("called here");
    const user = await User_1.User.findById(req.user?.user.id).select('-password');
    if (!user) {
        throw new errors_1.AuthError('User not found', 404);
    }
    res.json(user);
});
