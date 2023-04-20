"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConfigService = void 0;
require("dotenv/config");
class ConfigService {
    get(token) {
        const result = process.env[token];
        if (!result) {
            throw new Error(`Missing .env prop - ${token}\n\nDOTENV`);
        }
        return result;
    }
}
exports.ConfigService = ConfigService;
