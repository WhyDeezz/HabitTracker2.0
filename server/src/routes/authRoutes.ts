import express from "express";
import { authUser, registerUser } from "../controllers/authController";

import passport from "passport";

const router = express.Router();

router.post("/signup", registerUser);
router.post("/login", authUser);

// Google Auth
router.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

router.get(
  "/google/callback",
  passport.authenticate("google", { session: false, failureRedirect: "/login" }),
  (req, res) => {
    // Successful authentication, redirect home with token
    const user: any = req.user;
    // We need to generate token here or pass it. 
    // Passport strategy returns user, but we need to issue JWT.
    // Let's create a controller for this or handle it inline.
     const token = require("../utils/generateToken").default(user._id.toString());
     
     // Redirect to frontend with token
     res.redirect(`http://localhost:5173/login?token=${token}&id=${user._id}&username=${user.username}&displayName=${user.displayName}`);
  }
);

export default router;
