import mongoose from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import {
  UserDocument,
  UserModel,
  UserSchema,
} from "../interfaces/mongoose.gen";

const userSchema: UserSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      validate: [/\S+@\S+\.\S+/, "Please enter a valid email address."],
    },
    password: {
      type: String,
      required: true,
      minlength: [6, "Password must be at least 6 characters long."],
      validate: [
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{6,}$/,
        "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character.",
      ],
    },
    fullName: {
      type: String,
      required: true,
      index: true,
    },
    avatar: {
      type: String,
      required: true,
    },
    coverImage: {
      type: String,
    },
    refreshToken: {
      type: String,
      default: null,
    },
    watchHistory: {
      type: [mongoose.Schema.Types.ObjectId],
      ref: "Video",
      default: [],
    },
    //TODO: Add like and dislike fields.
  },
  { timestamps: true }
);

/**
 * Middleware function (pre hook) that is executed before saving a user document.
 * It generates a salt and hashes the password using bcrypt.
 * Using a regular function rather than an arrow function to preserve 'this' context.
 * @param next - Callback function to move to the next middleware in the chain.
 */
userSchema.pre("save", async function (next) {
  if (this.isModified("password")) {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
  }
  next();
});

// We write methods that are to be injected in the schema separately by accessing requiredSchema.methods.[whatever method you want to add].
userSchema.methods.isPasswordValid = async function (password: string) {
  return await bcrypt.compare(password, this.password);
};

userSchema.methods.generateAccessToken = function () {
  return jwt.sign(
    {
      _id: this._id,
      username: this.username,
      email: this.email,
    },
    process.env.ACCESS_TOKEN_SECRET as string,
    {
      expiresIn: process.env.ACCESS_TOKEN_EXPIRY as string,
    }
  );
};

userSchema.methods.generateRefreshToken = function () {
  return jwt.sign(
    { _id: this._id },
    process.env.REFRESH_TOKEN_SECRET as string,
    {
      expiresIn: process.env.REFRESH_TOKEN_EXPIRY as string,
    }
  );
};

export const User: UserModel = mongoose.model<UserDocument, UserModel>(
  "User",
  userSchema
);
