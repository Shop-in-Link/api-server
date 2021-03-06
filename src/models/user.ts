import mongoose, { Schema, Document } from 'mongoose';
import { Role } from './enums/Role';

import Link from './link';

/**
 * User schema.
 */
const userSchema = new Schema({
    email: { type: String, required: true, lowercase: true, unique: true },
    password: { type: String, required: true },
    name: {
        firstName: { type: String, required: true },
        lastName: { type: String, required: true },
        nickName: { type: String, required: true },
    },
    role: { type: String, required: true, enum: [Role.User, Role.Vendor] },
    businessLicense: { type: String, required: false },
    points: {
        purchased: { type: Number, required: true, default: 0 },
        earned: { type: Number, required: true, default: 0 }
    },
    loginAt: { type: Date, required: false },
}, { timestamps: true });

// Add hook to remove all user's links.
userSchema.pre<IUser>('remove', async function() {
    await Link.deleteMany({ owner: this._id });
});

/**
 * User interface.
 */
export interface IUser extends Document {
    email: string;
    password: string;
    name: { firstName: string; lastName: string; nickName: string; };
    role: Role;
    businessLicense?: string;
    points: { purchased: number; earned: number; };
    loginAt?: string;
    createdAt: string;
    updatedAt: string;
}

export default mongoose.model<IUser>('User', userSchema);
