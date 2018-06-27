import { Document, Schema, Model, model } from 'mongoose';
import * as Random from 'meteor-random';
import Brands from './Brands';

interface IFormData {
  loadType: string,
  successAction?: string,
  fromEmail?: string,
  userEmailTitle?: string,
  userEmailContent?: string,
  adminEmails?: string[],
  adminEmailTitle?: string,
  adminEmailContent?: string,
  thankContent?: string,
  redirectUrl?: string,
};

interface IIntegrationDocument extends Document {
  _id: string,
  name: string,
  brandId: string,
  languageCode: string,
  formId: string,
  kind: string,
  formData: IFormData,
  messengerData: object,
  uiOptions: object,
};

interface IIntegrationModel extends Model<IIntegrationDocument> {
  getIntegration(
    brandCode: string,
    kind: string,
    brandObject?: boolean
  ): IIntegrationDocument
}

const IntegrationSchema = new Schema({
  _id: {
    type: String,
    unique: true,
    default: () => Random.id(),
  },
  name: String,
  brandId: String,
  languageCode: String,
  formId: String,
  kind: String,
  formData: Object,
  messengerData: Object,
  uiOptions: Object,
});

class Integration {
  /**
   * Get integration
   * @param  {String} brandCode
   * @param  {String} kind
   * @param  {Boolean} brandObject: Determines to include brand object
   * @return {Promise} Existing integration object
   */
  static async getIntegration(brandCode, kind, brandObject = false) {
    const brand = await Brands.findOne({ code: brandCode });

    if (!brand) {
      throw new Error('Brand not found');
    }

    const integration = await Integrations.findOne({ brandId: brand._id, kind });

    if (brandObject) {
      return {
        integration,
        brand,
      };
    }

    return integration;
  }
}

IntegrationSchema.loadClass(Integration);

const Integrations = model<IIntegrationDocument, IIntegrationModel>(
  'integrations',
  IntegrationSchema
);

export default Integrations;
