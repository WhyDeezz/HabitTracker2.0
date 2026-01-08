import { Schema, model, Document } from "mongoose";

export interface IHabit extends Document {
  user: Schema.Types.ObjectId;
  name: string;
  microIdentity: string;
  type: 'build' | 'break';
  goal: number;
  activeDays: number[];
  reminderEnabled: boolean;
  reminderTime: string | null;
  visibility: 'public' | 'private';
  duration: number;
  // Progress/Streak tracking could be more complex, but starting simple
  completions: string[]; // Array of ISO date strings YYYY-MM-DD
  createdAt: Date;
  updatedAt: Date;
}

const HabitSchema = new Schema<IHabit>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    microIdentity: {
      type: String,
      required: true,
      trim: true,
    },
    type: {
      type: String,
      enum: ['build', 'break'],
      default: 'build',
    },
    goal: {
      type: Number,
      required: true,
      default: 1,
    },
    activeDays: {
      type: [Number],
      default: [1, 2, 3, 4, 5, 6, 7], // Monday=1 ... Sunday=7
    },
    reminderEnabled: {
      type: Boolean,
      default: false,
    },
    reminderTime: {
      type: String, // HH:MM
      default: null,
    },
    visibility: {
      type: String,
      enum: ['public', 'private'],
      default: 'private', 
    },
    duration: {
      type: Number,
      default: 21,
    },
    completions: {
      type: [String],
      default: [],
    },
  },
  { timestamps: true }
);

const Habit = model<IHabit>("Habit", HabitSchema);
export default Habit;
