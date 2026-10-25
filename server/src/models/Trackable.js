import mongoose from 'mongoose';

const trackableSchema = new mongoose.Schema(
  {
    user_id: { type: String, required: true, index: true },
    type: { type: String, enum: ['habit', 'event'], required: true },
    title: { type: String, required: true },
    description: { type: String, default: null },
    category: { type: String, default: 'Other' },
    group_name: { type: String, default: 'General' },
    color: { type: String, default: '#6366f1' },
    icon: { type: String, default: '✅' },
    sort_order: { type: Number, default: 0 },
    schedule: { type: mongoose.Schema.Types.Mixed, default: { type: 'daily' } },
    target_per_period: { type: Number, default: null },
    starts_at: { type: String, default: null },
    ends_at: { type: String, default: null },
    reminder_time: { type: String, default: null },
    archived: { type: Boolean, default: false },
  },
  { timestamps: { createdAt: 'created_at', updatedAt: false } }
);

trackableSchema.set('toJSON', {
  transform(_doc, ret) {
    ret.id = String(ret._id);
    delete ret._id;
    delete ret.__v;
    return ret;
  },
});

export const Trackable = mongoose.model('Trackable', trackableSchema);
