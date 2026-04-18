import mongoose from "mongoose"

const mongoUri = process.env.MONGODB_URI ?? ""

if (!mongoUri) {
  throw new Error("Missing MONGODB_URI in environment variables")
}

declare global {
  var __mongooseConnection:
    | {
        conn: typeof mongoose | null
        promise: Promise<typeof mongoose> | null
      }
    | undefined
}

const cached = global.__mongooseConnection ?? {
  conn: null,
  promise: null,
}

global.__mongooseConnection = cached

export async function connectToDatabase() {
  if (cached.conn) {
    return cached.conn
  }

  if (!cached.promise) {
    cached.promise = mongoose.connect(mongoUri, {
      bufferCommands: false,
    })
  }

  cached.conn = await cached.promise
  return cached.conn
}
