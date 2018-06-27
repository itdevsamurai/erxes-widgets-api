import { Document, Schema, Model, model } from 'mongoose';
import * as Random from 'meteor-random';

interface IRule {
  _id: string,
  kind: string,
  text: string,
  condition: string,
  value: string,
};

interface IMessenger {
  brandId: string,
  kind: string,
  sentAs: string,
  content: string,
  rules: IRule[],
};

interface IEngageMessageDocument extends Document {
  _id: string,
  kind: string,
  segmentId: string,
  customerIds: string[],
  title: string,
  fromUserId: string,
  method: string,
  email: object,
  messenger: IMessenger,
  isDraft: boolean,
  isLive: boolean,
  stopDate: Date,
  messengerReceivedCustomerIds: string[],
  deliveryReports: object,
};

interface IEngageMessageModel extends Model<IEngageMessageDocument> {
}

const EngageMessageSchema = new Schema({
  _id: { type: String, unique: true, default: () => Random.id() },
  kind: String,
  segmentId: String,
  customerIds: [String],
  title: String,
  fromUserId: String,
  method: String,
  email: Object,
  messenger: Object,
  isDraft: Boolean,
  isLive: Boolean,
  stopDate: Date,
  messengerReceivedCustomerIds: [String],
  deliveryReports: Object,
});

export const EngageMessages = model<IEngageMessageDocument, IEngageMessageModel>('engage_messages', EngageMessageSchema);
