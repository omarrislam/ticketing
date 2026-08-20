import mongoose from 'mongoose';
interface TicketAttrs {
  title: string;
  price: number;
  userId: string;
}

interface TicketDoc extends mongoose.Document {
  id: string;
  title: string;
  price: number;
  userId: string;
  version: number;
  orderId?: string;
}

interface TicketModel extends mongoose.Model<TicketDoc> {
  build(attrs: TicketAttrs): TicketDoc;
}

const ticketSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
    userId: {
      type: String,
      required: true,
    },
    orderId: {
      type: String,
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

ticketSchema.set('versionKey', 'version');
// Optimistic concurrency control. mongoose-update-if-current can't be used here:
// mongoose 9 ships kareem 3, which dropped callback-style middleware, so the
// plugin's `pre('save', function (next) { ... next(); })` throws. This hook does
// the same thing in the async style mongoose 9 expects.
ticketSchema.pre('save', function () {
  this.$where = { version: this.get('version') };
  this.increment();
});

ticketSchema.statics.build = (attrs: TicketAttrs) => {
  return new Ticket(attrs);
};

const Ticket = mongoose.model<TicketDoc, TicketModel>('Ticket', ticketSchema);

export { Ticket };
