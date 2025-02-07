const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const orderSchema = new Schema({

  sellerID: {type: String, required: true},
  itemID: {type: String,  required: true},
  quantity: {type: Number, required: true},
  variants: {type: Array, required: true},
  userID: { type: String, required: true },
  paymentID: {type: Number, required: true, unique: true},
  shippingStatus: { type: String, default: 'not_shipped' },
  escrowStatus: { type: String, default: 'payment_not_found' },
  status: {type: String, default: 'pending', },
  sellerAmount: {type: Number, required: true},
  pay_currency: {type: String, required: true},
  sellerID: {type: Array, required: true},
  shippingAddress: { type: String, required: true },
  shippingMode: { type: String, required: true },
  delivered: { type: Date, default: null }
});

module.exports = mongoose.model('Order', orderSchema);
