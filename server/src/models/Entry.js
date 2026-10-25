import mongoose from 'mongoose';

const entrySchema = new mongoose.Schema(
  {
    trackable_id: { type: String, required: true, index: true },
    user_id: { type: String, required: true, index: true },
    log_date: { type: String, required: true },
    status: { type: String, enum: ['done', 'skipped', 'missed'], required: true },
    value: { type: Number, default: null },
    notes: { type: String, default: null },
  },
  { timestamps: { createdAt: 'created_at', updatedAt: false } }
);

entrySchema.index({ trackable_id: 1, log_date: 1 }, { unique: true });
entrySchema.index({ user_id: 1, log_date: 1 });

entrySchema.set('toJSON', {
  transform(_doc, ret) {
    ret.id = String(ret._id);
    delete ret._id;
    delete ret.__v;
    return ret;
  },
});

export const Entry = mongoose.model('Entry', entrySchema);
