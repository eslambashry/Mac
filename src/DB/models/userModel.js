import { model, Schema } from "mongoose";

const userSchema = new Schema({
    userName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, enum: ['user', 'admin'], default: 'user' },
    phone:{type:String},
    createdAt: { type: Date, default: Date.now },
    image: {
        imageLink: { type: String },
        public_id: { type: String }
    },
    token: { type: String },
    isActive: { type: String, default: "Active" },
    customId: { type: String  }
},{ timestamps: true })

export const UserModel = model("User", userSchema)

 