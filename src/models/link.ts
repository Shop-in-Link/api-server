import mongoose, { Schema, Document } from 'mongoose';
import { IUser } from './user';

/**
 * Link schema.
 */
const linkSchema = new Schema({
    marketFqdn: { type: String, required: true, lowercase: true, index: true },
    productPath: { type: String, required: true },
    productParameter: { type: String, required: false },
    shopInLinkPath: { type: String, required: true, unique: true },
    owner: { type: Schema.Types.ObjectId, ref: 'User' },
    visitors: { type: Number, required: true, default: 0 },
    expiresAt: { type: Date, required: false },
    expiresView: { type: Number, required: false },
}, { timestamps: true, toJSON: { virtuals: true } });

linkSchema.virtual('productUrl').get(function(this: ILink): string {
    return `${this.marketFqdn}${this.productPath}${this.productParameter}`;
});

/**
 * Link interface.
 */
export interface ILink extends Document {
    marketFqdn: string;
    productPath: string;
    productParameter?: string;
    readonly productUrl: string;
    shopInLinkPath: string;
    owner: IUser['_id'];
    visitors: number;
    expiresAt?: string;
    expiresView?: number;
    createdAt: string;
    updatedAt: string;
}

export default mongoose.model<ILink>('Link', linkSchema);
