import { Schema, model, models, type InferSchemaType } from "mongoose"

const auditRunSchema = new Schema(
  {
    userId: {
      type: String,
      required: true,
      index: true,
    },
    prompt: {
      type: String,
      required: true,
      trim: true,
      minlength: 3,
      maxlength: 4000,
    },
    analysisDepth: {
      type: String,
      required: true,
      default: "comprehensive",
    },
    inquiryIntent: {
      type: String,
      required: false,
      default: "comprehensive",
    },
    consultedAgents: {
      type: [String],
      required: true,
      default: [],
    },
    result: {
      type: Schema.Types.Mixed,
      required: true,
    },
  },
  {
    timestamps: true,
  }
)

export type AuditRunDocument = InferSchemaType<typeof auditRunSchema> & {
  _id: string
}

export const AuditRunModel = models.AuditRun || model("AuditRun", auditRunSchema)
