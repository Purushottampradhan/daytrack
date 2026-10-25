import mongoose from 'mongoose';

const profileSchema = new mongoose.Schema(
  {
    _id: { type: String, required: true },
    display_name: { type: String, default: null },
    timezone: { type: String, default: 'UTC' },
    day_boundary_hour: { type: Number, default: 0, min: 0, max: 6 },
    streak_freezes_remaining: { type: Number, default: 2 },
    week_starts_on: { type: String, enum: ['monday', 'sunday'], default: 'monday' },
    confetti_enabled: { type: Boolean, default: true },
    theme: {
      type: String,
      enum: ['system', 'light', 'dark', 'ocean', 'sunset'],
      default: 'system',
    },
  },
  { timestamps: { createdAt: 'created_at', updatedAt: false }, _id: false }
);

profileSchema.set('toJSON', {
  virtuals: false,
  transform(_doc, ret) {
    ret.id = ret._id;
    delete ret._id;
    delete ret.__v;
    return ret;
  },
});

export const Profile = mongoose.model('Profile', profileSchema);
