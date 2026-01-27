import { model, Schema } from "mongoose";

const ApplicationSchema = new Schema({
  career: {
    type: Schema.Types.ObjectId,
    ref: 'Career',
    required: false,
  },

  fullName: {
    type: String,
    required: true,
  },

  email: {
    type: String,
    required: true,
    lowercase: true,
  },

  phone: {
    type: String,
    required: true,
  },

  cv: {
    fileUrl: String,
    public_id: String,
  },

  customId: {
    type: String,
    required: true,
  },

  status: {
    type: String,
    enum: ['Pending', 'Reviewed', 'Accepted', 'Rejected'],
    default: 'Pending',
  },

}, { timestamps: true });

export const applicationsModel = model('Applications', ApplicationSchema)