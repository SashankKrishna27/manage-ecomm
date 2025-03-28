import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type CategoryDocument = Category & Document;

@Schema()
export class Category {
  @Prop({ type: String, required: true })
  name: string;

  @Prop({ type: Types.ObjectId, ref: 'Category', default: null })
  parentId: Types.ObjectId | null;

  @Prop({ default: [] })
  path: string[];

  @Prop({ default: true })
  isActive: boolean;

  @Prop({ default: Date.now, type: Date, immutable: true })
  createdAt: Date;

  @Prop({ type: Date })
  updatedAt: Date;
}

export const CategorySchema = SchemaFactory.createForClass(Category);
