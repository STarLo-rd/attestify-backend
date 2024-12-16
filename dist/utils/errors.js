"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthError = void 0;
class AuthError extends Error {
    constructor(message, status = 400, errors) {
        super(message);
        this.status = status;
        this.errors = errors;
        Error.captureStackTrace(this, this.constructor);
    }
}
exports.AuthError = AuthError;
