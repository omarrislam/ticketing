import mongoose from 'mongoose';
import { OrderStatus } from '@omaretickets/common';
import { TicketDoc } from './ticket';

export { OrderStatus };

interface OrderAttrs {
  userId: string;
  status: OrderStatus;
  expiresAt: Date;
  ticket: TicketDoc;
}

interface orderDoc extends mongoose.Document {
  id: string;
  userId: string;
  status: OrderStatus;
  expiresAt: Date;
  ticket: TicketDoc;
  version: number;
}

interface OrderModel extends mongoose.Model<orderDoc> {
  build(attrs: OrderAttrs): orderDoc;
}

const orderSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true },
    status: {
      type: String,
      required: true,
      enum: Object.values(OrderStatus),
      default: OrderStatus.Created,
    },
    expiresAt: { type: mongoose.Schema.Types.Date },
    ticket: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Ticket',
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
  return new Order(attrs);
};
const Order = mongoose.model<orderDoc, OrderModel>('Order', orderSchema);

export { Order };
