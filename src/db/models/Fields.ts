/*
 * Extra fields for form, customer, company
 */

import { Document, Schema, Model, model } from 'mongoose';
import * as Random from 'meteor-random';

interface IFieldDocument extends Document {
  _id: string,
  contentType: string,
  contentTypeId: string,
  type: string,
  text: string,
  order: number,
  validation?: string,
  description?: string,
  options?: string[],
  isRequired?: boolean,
};

interface IFieldModel extends Model<IFieldDocument> {
}

const FieldSchema = new Schema({
  _id: {
    type: String,
    unique: true,
    default: () => Random.id(),
  },

  // form, customer, company
  contentType: String,

  // formId when contentType is form
  contentTypeId: String,

  type: String,
  validation: {
    type: String,
    optional: true,
  },
  text: String,
  description: {
    type: String,
    optional: true,
  },
  options: {
    type: [String],
    optional: true,
  },
  isRequired: Boolean,
  order: Number,
});

const Fields = model<IFieldDocument, IFieldModel>('fields', FieldSchema);

export default Fields;
