import { Schema, model, Document } from "mongoose";

export interface IStreak extends Document {
  user: any; // Relaxed from Schema.Types.ObjectId to avoid type conflicts with populated/unpopulated fields
  username: string;
  streakCount: number;
  lastCompletedDate?: Date; // Timestamp of update
  lastCompletedDateIST?: string; // YYYY-MM-DD
  history: string[]; // Array of YYYY-MM-DD
}

const StreakSchema = new Schema<IStreak>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true, // Output 1 streak doc per user
    },
    username: {
      type: String,
      required: true,
    },
    streakCount: {
      type: Number,
      default: 0,
    },
    lastCompletedDate: {
      type: Date,
      default: null,
    },
    lastCompletedDateIST: {
      type: String, // format YYYY-MM-DD
      default: null,
    },
    history: {
      type: [String], // Array of date strings
      default: [],
    },
  },
  { timestamps: true }
);

const Streak = model<IStreak>("Streak", StreakSchema);
export default Streak;
