import { Document, Model, Schema, model } from 'mongoose';
import * as Random from 'meteor-random';

import Conversations from './Conversations';

interface IAttachments {
  url: string,
  name: string,
  size: number,
  type: string,
};

interface IMessageDocument extends Document {
  _id: string,
  userId: string,
  conversationId: string,
  customerId: string,
  content: string,
  attachments: IAttachments[],
  createdAt: Date,
  isCustomerRead: Boolean,
  internal: Boolean,
  engageData: Object,
  formWidgetData: Object,
};

interface IMessageModel extends Model<IMessageDocument> {
  createMessage({
    conversationId,
    customerId,
    userId,
    content: message,
    attachments,
    engageData,
    formWidgetData,
  } : {
    conversationId: string,
    content: string,
    customerId?: string,
    userId?: string,
    attachments?: object[],
    engageData?: object,
    formWidgetData?: object[],
  }): Promise<IMessageDocument>

  forceReadCustomerPreviousEngageMessages(
    customerId: string
  ): Promise<IMessageDocument>
}

const AttachmentSchema = new Schema({
  url: { type: String, required: true },
  name: { type: String, required: true },
  size: { type: Number, required: true },
  type: { type: String, required: true },
});

const MessageSchema = new Schema({
  _id: {
    type: String,
    unique: true,
    default: () => Random.id(),
  },
  userId: String,
  conversationId: String,
  customerId: String,
  content: String,
  attachments: [AttachmentSchema],
  createdAt: Date,
  isCustomerRead: Boolean,
  internal: Boolean,
  engageData: Object,
  formWidgetData: Object,
});

class MessageModel {
  /**
   * Create new message
   * @param  {Object} messageObj
   * @return {Promise} New message
   */
  static async createMessage(args) {
    const conversation = await Conversations.findOne({
      _id: args.conversationId,
    });

    // increment messageCount
    await Conversations.findByIdAndUpdate(
      conversation._id,
      {
        messageCount: conversation.messageCount + 1,
        updatedAt: new Date(),
      },
      { new: true },
    );

    // create message
    return Messages.create({
      createdAt: new Date(),
      internal: false,
      ...args,
    });
  }

  // force read previous unread engage messages ============
  static forceReadCustomerPreviousEngageMessages(customerId) {
    const selector = {
      customerId,
      engageData: { $exists: true },
      isCustomerRead: { $ne: true },
    };

    return Messages.update(
      selector,
      { $set: { isCustomerRead: true } },
      { multi: true },
    );

    return Messages.findOne(selector);
  }
}

MessageSchema.loadClass(MessageModel);

const Messages = model<IMessageDocument, IMessageModel>(
  'conversation_messages', MessageSchema
);

export default Messages;
