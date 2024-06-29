/* eslint-disable @typescript-eslint/no-explicit-any */
import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { Strategy as FacebookStrategy } from "passport-facebook";
import { UserService } from "../services/UserService";
import { webSocketServer } from "../server"; // WebSocketServer instance'ını import ediyoruz

const userService = new UserService(webSocketServer);

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      callbackURL: process.env.GOOGLE_CALLBACK_URL!, // Çevre değişkeninden okuyoruz
    },
    async (
      accessToken: string,
      refreshToken: string,
      profile: any,
      done: (error: any, user?: any) => void,
    ) => {
      try {
        let user = await userService.findUserByEmail(profile.emails[0].value);
        if (!user) {
          user = await userService.createUser({
            email: profile.emails[0].value,
            firstName: profile.name.givenName,
            lastName: profile.name.familyName,
            isEmailVerified: true,
            password: Math.random().toString(36).slice(-8),
            googleId: profile.id,
          });
        } else if (!user.googleId) {
          await userService.updateUser(user.id, { googleId: profile.id });
        }
        return done(null, user);
      } catch (error) {
        return done(error);
      }
    },
  ),
);

passport.use(
  new FacebookStrategy(
    {
      clientID: process.env.FACEBOOK_APP_ID!,
      clientSecret: process.env.FACEBOOK_APP_SECRET!,
      callbackURL: process.env.FACEBOOK_CALLBACK_URL!, // Çevre değişkeninden okuyoruz
      profileFields: ["id", "emails", "name"],
    },
    async (
      accessToken: string,
      refreshToken: string,
      profile: any,
      done: (error: any, user?: any) => void,
    ) => {
      try {
        let user = await userService.findUserByEmail(profile.emails[0].value);
        if (!user) {
          user = await userService.createUser({
            email: profile.emails[0].value,
            firstName: profile.name.givenName,
            lastName: profile.name.familyName,
            isEmailVerified: true,
            password: Math.random().toString(36).slice(-8),
            facebookId: profile.id,
          });
        } else if (!user.facebookId) {
          await userService.updateUser(user.id, { facebookId: profile.id });
        }
        return done(null, user);
      } catch (error) {
        return done(error);
      }
    },
  ),
);

export default passport;
