import { Schema, model, models, type InferSchemaType } from "mongoose"

export const USER_TYPES = ["enterprise", "normal"] as const
export type UserType = (typeof USER_TYPES)[number]

const userSchema = new Schema(
  {
    fullName: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 120,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      index: true,
      lowercase: true,
      trim: true,
    },
    passwordHash: {
      type: String,
      required: true,
      minlength: 10,
    },
    userType: {
      type: String,
      enum: USER_TYPES,
      required: true,
      index: true,
    },
    enterpriseSubscriptionActive: {
      type: Boolean,
      required: true,
      default: false,
    },
  },
  {
    timestamps: true,
  }
)

userSchema.set("toJSON", {
  transform: (_doc, ret) => {
    const safeRet: { passwordHash?: string; [key: string]: unknown } = {
      ...ret,
    }
    delete safeRet.passwordHash
    return safeRet
  },
})

export type UserDocument = InferSchemaType<typeof userSchema> & {
  _id: string
}

export const UserModel = models.User || model("User", userSchema)
