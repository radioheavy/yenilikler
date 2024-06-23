"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const passport_1 = __importDefault(require("passport"));
const passport_google_oauth20_1 = require("passport-google-oauth20");
const passport_facebook_1 = require("passport-facebook");
const UserService_1 = require("../services/UserService");
const server_1 = require("../server"); // WebSocketServer instance'ını import ediyoruz
const userService = new UserService_1.UserService(server_1.webSocketServer);
passport_1.default.use(new passport_google_oauth20_1.Strategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: process.env.GOOGLE_CALLBACK_URL, // Çevre değişkeninden okuyoruz
}, (accessToken, refreshToken, profile, done) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        let user = yield userService.findUserByEmail(profile.emails[0].value);
        if (!user) {
            user = yield userService.createUser({
                email: profile.emails[0].value,
                firstName: profile.name.givenName,
                lastName: profile.name.familyName,
                isEmailVerified: true,
                password: Math.random().toString(36).slice(-8),
                googleId: profile.id
            });
        }
        else if (!user.googleId) {
            yield userService.updateUser(user.id, { googleId: profile.id });
        }
        return done(null, user);
    }
    catch (error) {
        return done(error);
    }
})));
passport_1.default.use(new passport_facebook_1.Strategy({
    clientID: process.env.FACEBOOK_APP_ID,
    clientSecret: process.env.FACEBOOK_APP_SECRET,
    callbackURL: process.env.FACEBOOK_CALLBACK_URL, // Çevre değişkeninden okuyoruz
    profileFields: ['id', 'emails', 'name']
}, (accessToken, refreshToken, profile, done) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        let user = yield userService.findUserByEmail(profile.emails[0].value);
        if (!user) {
            user = yield userService.createUser({
                email: profile.emails[0].value,
                firstName: profile.name.givenName,
                lastName: profile.name.familyName,
                isEmailVerified: true,
                password: Math.random().toString(36).slice(-8),
                facebookId: profile.id
            });
        }
        else if (!user.facebookId) {
            yield userService.updateUser(user.id, { facebookId: profile.id });
        }
        return done(null, user);
    }
    catch (error) {
        return done(error);
    }
})));
exports.default = passport_1.default;
