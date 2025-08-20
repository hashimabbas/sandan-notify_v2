// models/Logo.ts
import mongoose, { Document, Model, Schema } from '@/app/lib/mongodb';

interface ILogo extends Document {
  name: string;
  data: Buffer;
  contentType: string;
}

const LogoSchema: Schema = new mongoose.Schema({
  name: { type: String, required: true },
  data: { type: Buffer, required: true },
  contentType: { type: String, required: true },
});

const Logo: Model<ILogo> = mongoose.models.Logo || mongoose.model<ILogo>('Logo', LogoSchema);

export default Logo;
export type { ILogo };
