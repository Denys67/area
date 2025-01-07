import { Request, Response } from "express";
import User from "../models/User";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import passport from "passport";

export const registerUser = async (req: Request, res: Response) => {
  try {
    const { username, email, password } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = new User({ username, email, password: hashedPassword });
    await newUser.save();

    res.status(201).json({ message: "User registered successfully" });
  } catch (error) {
    console.error("Error in registerUser:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const loginUser = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }

    const isPasswordCorrect = await bcrypt.compare(password, user.password);
    if (!isPasswordCorrect) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign(
      { userId: user._id, email: user.email },
      process.env.JWT_SECRET || "your-secret-key",
      { expiresIn: "1h" }
    );

    res.status(200).json({ message: "Login successful", token });
  } catch (error) {
    console.error("Error in loginUser:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const googleLogin = passport.authenticate("google", {
  scope: ["profile", "email"],
});

export const googleCallback = async (req: Request, res: Response) => {
  try {
    const user = req.user as any;

    const existingUser = await User.findOne({ email: user.email });

    if (existingUser) {
      const jwtSecret = process.env.JWT_SECRET || "your-secret-key";
      const token = jwt.sign(
        { userId: existingUser._id, email: existingUser.email },
        jwtSecret,
        { expiresIn: "1h" }
      );
      return res.status(200).json({ message: "Login successful", token });
    }

    const newUser = new User({
      username: user.displayName || user.email.split("@")[0],
      email: user.email,
      oauthId: user.id,
      provider: "google",
    });

    await newUser.save();

    const jwtSecret = process.env.JWT_SECRET || "your-secret-key";
    const token = jwt.sign(
      { userId: newUser._id, email: newUser.email },
      jwtSecret,
      { expiresIn: "1h" }
    );

    res.status(201).json({ message: "User registered successfully via Google", token });
  } catch (error) {
    console.error("Error in googleCallback:", error);
    res.status(500).json({ message: "Server error" });
  }
};
