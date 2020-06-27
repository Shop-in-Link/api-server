import mongoose, { Schema, Document } from "mongoose";
import { Role } from "./enums/Role";

/**
 * User schema.
 */
const userSchema = new Schema({
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    name: {
        firstName: { type: String, required: true },
        lastName: { type: String, required: true },
        nickName: { type: String, required: true },
    },
    role: { type: String, required: true, enum: [Role.User, Role.Vendor] },
    businessLicense: { type: String, required: false },
    loginAt: { type: Date, required: false },
}, { timestamps: true });

/**
 * User interface.
 */
export interface IUser extends Document {
    email: string;
    password: string;
    name: { firstName: string; lastName: string; nickName: string; };
    role: Role;
    businessLicense?: string;
    loginAt?: string;
    createdAt: string;
    updatedAt: string;
}

export default mongoose.model<IUser>('User', userSchema);
