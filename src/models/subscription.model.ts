import mongoose from "mongoose";
import {
  SubscriptionDocument,
  SubscriptionModel,
  SubscriptionSchema,
} from "../interfaces/mongoose.gen";

const SubscriptionSchema: SubscriptionSchema = new mongoose.Schema(
  {
    subscriber: {
      type: mongoose.SchemaTypes.ObjectId,
      ref: "User",
      required: true,
    },
    channel: {
      type: mongoose.SchemaTypes.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

export const Subscription: SubscriptionModel = mongoose.model<
  SubscriptionDocument,
  SubscriptionModel
>("Subscription", SubscriptionSchema);
