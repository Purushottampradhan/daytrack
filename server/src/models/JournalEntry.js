import mongoose from 'mongoose';

const journalSchema = new mongoose.Schema(
  {
    user_id: { type: String, required: true, index: true },
    log_date: { type: String, required: true },
    content: { type: String, required: true },
  },
  { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } }
);

journalSchema.index({ user_id: 1, log_date: 1 }, { unique: true });

journalSchema.set('toJSON', {
  transform(_doc, ret) {
    ret.id = String(ret._id);
    delete ret._id;
    delete ret.__v;
    return ret;
  },
});

export const JournalEntry = mongoose.model('JournalEntry', journalSchema);
