import { model, models, Schema } from "mongoose";

const messageSchema = new Schema(
  {
    authorRole: { type: String, enum: ["student", "admin"], required: true },
    body: { type: String, required: true, maxlength: 4000 },
    createdAt: { type: Date, default: Date.now },
  },
  { _id: false },
);

const querySchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    category: { type: String, required: true, maxlength: 60 },
    subject: { type: String, required: true, maxlength: 180 },
    status: { type: String, enum: ["new", "answered", "closed"], default: "new", index: true },
    messages: { type: [messageSchema], default: [] },
  },
  { timestamps: true, versionKey: "version" },
);

querySchema.index({ userId: 1, updatedAt: -1 });
export const StudentQuery = models.StudentQuery || model("StudentQuery", querySchema);
