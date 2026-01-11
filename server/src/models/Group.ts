import { Schema, model, Types } from "mongoose";

export interface IGroup {
  name: string;
  members: Types.ObjectId[];
  creator: Types.ObjectId;
  trackingType: "shared" | "individual";
  duration: number;
  avatar: string; // Emoji
  description: string;
  createdAt: Date;
  isActive: boolean;
  groupStreak: number;
  lastGroupCompletedDate: Date | null;
  memberHabits: { user: Types.ObjectId, habit: Types.ObjectId }[];
  lastCompletedDateIST?: string | null;
}

const GroupSchema = new Schema<IGroup>(
  {
    name: { type: String, required: true, trim: true },
    members: [{ type: Schema.Types.ObjectId, ref: "User" }],
    creator: { type: Schema.Types.ObjectId, ref: "User", required: true },
    trackingType: {
        type: String,
        enum: ["shared", "individual"],
        default: "shared"
    },
    duration: { type: Number, required: true },
    avatar: { type: String, default: "🚀" },
    description: { type: String },
    isActive: { type: Boolean, default: true },
    groupStreak: { type: Number, default: 0 },
    lastGroupCompletedDate: { type: Date, default: null },
    memberHabits: [
        {
            user: { type: Schema.Types.ObjectId, ref: "User" },
            habit: { type: Schema.Types.ObjectId, ref: "Habit" }
        }
    ],
    lastCompletedDateIST: { type: String, default: null }
  },
  { timestamps: true }
);

const Group = model<IGroup>("Group", GroupSchema);
export default Group;
