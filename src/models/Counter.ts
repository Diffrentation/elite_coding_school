import { Schema, model, models } from "mongoose";
const counterSchema = new Schema({ _id: String, seq: { type: Number, default: 0 } }, { versionKey: false });
export const Counter = models.Counter || model("Counter", counterSchema);
