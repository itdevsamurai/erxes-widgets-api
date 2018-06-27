import { Document, Schema, Model, model } from 'mongoose';
import * as Random from 'meteor-random';

interface ICallout {
  title: string,
  body: string,
  buttonText: string,
  featuredImage: string,
  skip: boolean,
};

interface ISubmission {
  customerId: string,
  submittedAt: Date,
};

interface IFormDocument extends Document {
  _id: string,
  title: string,
  description: string,
  code: string,
  buttonText: string,
  themeColor: string,
  callout: ICallout,
  viewCount: number,
  contactsGathered: number,
  submissions: ISubmission[],
};

interface IFormModel extends Model<IFormDocument> {
  increaseViewCount(formId: string): Promise<string>
  increaseContactsGathered(formId: string): Promise<string>
  addSubmission(formId: string, customerId: string): Promise<string>
}

// schema for form's callout component
const CalloutSchema = new Schema(
  {
    title: String,
    body: String,
    buttonText: String,
    featuredImage: String,
    skip: Boolean,
  },
  { _id: false },
);

const SubmissionSchema = new Schema(
  {
    customerId: String,
    submittedAt: Date,
  },
  { _id: false },
);

const FormSchema = new Schema({
  _id: {
    type: String,
    unique: true,
    default: () => Random.id(),
  },
  title: String,
  description: String,
  code: String,
  buttonText: String,
  themeColor: String,
  callout: CalloutSchema,
  viewCount: Number,
  contactsGathered: Number,
  submissions: [SubmissionSchema],
});

class Form {
  /**
   * Increase form view count
   * @param  {String} formId - id of a form to update
   * @return {Promise} Existing form object
   */
  static async increaseViewCount(formId) {
    const formObj = await Forms.findOne({ _id: formId });

    let viewCount = 0;

    if (formObj.viewCount) {
      viewCount = formObj.viewCount;
    }

    viewCount++;

    await Forms.update({ _id: formId }, { viewCount });

    return formId;
  }

  /**
   * Increase form submitted count
   * @param  {String} formId - id of a form to update
   * @return {Promise} Existing form object
   */
  static async increaseContactsGathered(formId) {
    const formObj = await Forms.findOne({ _id: formId });

    let contactsGathered = 0;

    if (formObj.contactsGathered) {
      contactsGathered = formObj.contactsGathered;
    }

    contactsGathered++;

    await Forms.update({ _id: formId }, { contactsGathered });

    return formId;
  }

  /**
   * Add customer to submitted customer ids
   * @param  {String} formId - id of a form to update
   * @param  {String} customerId - id of a customer who submitted
   * @return {Promise} Existing form object
   */
  static async addSubmission(formId, customerId) {
    const submittedAt = new Date();

    await Forms.update({ _id: formId }, { $push: { submissions: { customerId, submittedAt } } });

    return formId;
  }
}

FormSchema.loadClass(Form);

const Forms = model<IFormDocument, IFormModel>('forms', FormSchema);

export default Forms;
