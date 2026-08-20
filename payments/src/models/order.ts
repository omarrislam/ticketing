import mongoose from 'mongoose';
import { OrderStatus } from '@omaretickets/common';
import { updateIfCurrentPlugin } from 'mongoose-update-if-current';
interface OrderAttrs {
  id: string;
  version: number;
  userId: string;
  price: number;
  status: OrderStatus;
}

interface OrderDoc extends mongoose.Document {
  id: string;
  version: number;
  userId: string;
  price: number;
  status: OrderStatus;
}

interface OrderModel extends mongoose.Model<OrderDoc> {
  build(attrs: OrderAttrs): OrderDoc;
}

const orderSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      required: true,
    },
  },
  {
    toJSON: {
      transform(doc, ret) {
        const wrapped = ret as any;
        wrapped.id = wrapped._id;
        delete wrapped._id;
      },
    },
  },
);

orderSchema.set('versionKey', 'version');
// Optimistic concurrency control. mongoose-update-if-current can't be used here:
// mongoose 9 ships kareem 3, which dropped callback-style middleware, so the
// plugin's `pre('save', function (next) { ... next(); })` throws. This hook does
// the same thing in the async style mongoose 9 expects.
orderSchema.pre('save', function () {
  this.$where = { version: this.get('version') };
  this.increment();
});

orderSchema.statics.build = (attrs: OrderAttrs) => {
  return new Order({
    _id: attrs.id,
    version: attrs.version,
    userId: attrs.userId,
    price: attrs.price,
    status: attrs.status,
  });
};

const Order = mongoose.model<OrderDoc, OrderModel>('Order', orderSchema);

export { Order };
