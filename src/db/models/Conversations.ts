import { Document, Schema, Model, model } from 'mongoose';
import * as Random from 'meteor-random';
import { mutateAppApi } from '../../utils';

interface IConversationDocument extends Document {
  _id: string,
  createdAt: Date,
  updatedAt: Date,
  content: string,
  customerId: string,
  userId: string,
  integrationId: string,
  number: number,
  messageCount: number,
  status: string,
  readUserIds: string[],
  participatedUserIds: string[],
};

interface STATUSES {
  NEW: 'new',
  OPEN: 'open',
  CLOSED: 'closed',
  ALL_LIST: ['new', 'open', 'closed'],
};

interface IConversationModel extends Model<IConversationDocument> {
  getConversationStatuses(): STATUSES

  createConversation({
    integrationId,
    userId,
    customerId,
    content
  } : {
    integrationId: string,
    userId?: string,
    customerId: string,
    content: string
  }): Promise<IConversationDocument>

  getOrCreateConversation({
    conversationId,
    integrationId,
    customerId,
    message
  } : {
    conversationId?: string,
    integrationId: string,
    customerId: string,
    message: string
  }): Promise<IConversationDocument>
}

const ConversationSchema = new Schema({
  _id: {
    type: String,
    unique: true,
    default: () => Random.id(),
  },
  createdAt: Date,
  updatedAt: Date,
  content: String,
  customerId: String,
  userId: String,
  integrationId: String,
  number: Number,
  messageCount: Number,
  status: String,
  readUserIds: [String],
  participatedUserIds: [String],
});

class ConversationModel extends Model {
  static getConversationStatuses() {
    return {
      NEW: 'new',
      OPEN: 'open',
      CLOSED: 'closed',
      ALL_LIST: ['new', 'open', 'closed'],
    };
  }

  /**
   * Create new conversation
   * @param  {Object} conversationObj
   * @return {Promise} Newly created conversation object
   */
  static async createConversation({ integrationId, userId, customerId, content }) {
    const count = await Conversations.find({ customerId, integrationId }).count();

    const conversation = await Conversations.create({
      customerId,
      userId,
      integrationId,
      content,
      status: Conversations.getConversationStatuses().NEW,
      createdAt: new Date(),
      messageCount: 0,

      // Number is used for denormalization of posts count
      number: count + 1,
    });

    // call app api's create conversation log
    mutateAppApi(`
      mutation {
        activityLogsAddConversationLog(
          conversationId: "${conversation._id}",
          customerId: "${customerId}",
        ) {
          _id
        }
      }`);

    return conversation;
  }

  /**
   * Get or create conversation
   * @param  {Object} doc
   * @return {Promise}
   */
  static getOrCreateConversation(doc) {
    const { conversationId, integrationId, customerId, message } = doc;

    // customer can write a message
    // to the closed conversation even if it's closed
    if (conversationId) {
      return Conversations.findByIdAndUpdate(
        conversationId,
        {
          // mark this conversation as unread
          readUserIds: [],

          // reopen this conversation if it's closed
          status: Conversations.getConversationStatuses().OPEN,
        },
        { new: true },
      );
    }

    // create conversation
    return Conversations.createConversation({
      customerId,
      integrationId,
      content: message,
    });
  }
}

ConversationSchema.loadClass(ConversationModel);

const Conversations = model<IConversationDocument, IConversationModel>(
  'conversations', ConversationSchema
);

export default Conversations;
