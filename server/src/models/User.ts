import { Schema, model } from "mongoose";
import bcrypt from "bcryptjs";

export interface IUser {
  username: string;
  email: string; // Fixed: Interface should have the primitive type, not the schema config
  displayName: string;
  friendCode: string;
  friends: any[]; // Array of User ObjectIds
  password?: string; // Optional
  googleId?: string; // Optional
  streak: number;
  lastCompletedDate: Date | null;
  updatedAt: Date;
  matchPassword: (enteredPassword: string) => Promise<boolean>;
  checkStreak: () => Promise<void>;
}

const UserSchema = new Schema<IUser>(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    displayName: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },
    friendCode: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
    },
    friends: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    password: {
      type: String,
      required: false, // Optional for Google Auth users
    },
    googleId: {
      type: String,
      unique: true,
      sparse: true, // Allows multiple nulls
    },
    streak: {
      type: Number,
      required: true,
      default: 0,
    },
    lastCompletedDate: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

// Compare password
UserSchema.methods.matchPassword = async function (enteredPassword: string) {
  if (!this.password) return false;
  return bcrypt.compare(enteredPassword, this.password);
};

// Check and Reset Streak
UserSchema.methods.checkStreak = async function () {
    if (this.lastCompletedDate) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);
        
        const lastDate = new Date(this.lastCompletedDate);
        lastDate.setHours(0, 0, 0, 0);

        // If last completed date is before yesterday, streak is broken
        // e.g. Last = 5th. Today = 7th. Yesterday = 6th. 5 < 6 -> True. Reset.

        
        if (lastDate < yesterday) {

            if (this.streak > 0) {
                this.streak = 0;
                await this.save();
            }
        } else {

        }
    } else {

    }
};

// Hash password before save
UserSchema.pre("save", async function () {
  if (!this.isModified("password") || !this.password) {
    return;
  }

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

const User = model<IUser>("User", UserSchema);
export default User;
