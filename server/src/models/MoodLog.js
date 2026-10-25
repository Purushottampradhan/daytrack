import mongoose from 'mongoose';

const moodSchema = new mongoose.Schema(
  {
    user_id: { type: String, required: true, index: true },
    log_date: { type: String, required: true },
    mood_score: { type: Number, required: true, min: 1, max: 5 },
    note: { type: String, default: null },
  },
  { timestamps: { createdAt: 'created_at', updatedAt: false } }
);

moodSchema.index({ user_id: 1, log_date: 1 }, { unique: true });

moodSchema.set('toJSON', {
  transform(_doc, ret) {
    ret.id = String(ret._id);
    delete ret._id;
    delete ret.__v;
    return ret;
  },
});

export const MoodLog = mongoose.model('MoodLog', moodSchema);
