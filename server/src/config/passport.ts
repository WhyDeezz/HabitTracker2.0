import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import User from "../models/User";
import generateToken from "../utils/generateToken";

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
      callbackURL: "/api/auth/google/callback",
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const existingUser = await User.findOne({ googleId: profile.id });

        if (existingUser) {
          return done(null, existingUser);
        }

        // If user exists with same email but no googleId, link them?
        // For simplicity, we'll check email too.
        const userWithEmail = await User.findOne({
            email: profile.emails?.[0].value
        });

        if (userWithEmail) {
            // Link account
            userWithEmail.googleId = profile.id;
            await userWithEmail.save();
            return done(null, userWithEmail);
        }

        // Create new user
        const newUser = await User.create({
          username: profile.displayName.replace(/\s+/g, "").toLowerCase() + Math.floor(Math.random() * 1000),
          displayName: profile.displayName,
          email: profile.emails?.[0].value,
          googleId: profile.id,
          password: "", // No password for google users
        });

        return done(null, newUser);
      } catch (err: any) {
        return done(err, undefined);
      }
    }
  )
);
