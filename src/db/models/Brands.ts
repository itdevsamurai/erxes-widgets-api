import * as mongoose from 'mongoose';
import * as Random from 'meteor-random';

const BrandSchema = new mongoose.Schema({
  _id: {
    type: String,
    unique: true,
    default: () => Random.id(),
  },
  code: String,
});

const Brands = mongoose.model('brands', BrandSchema);

export default Brands;
