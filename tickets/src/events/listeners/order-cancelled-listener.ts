import { Listener, OrderCancelledEvent, Subjects } from '@omaretickets/common';
import { Message } from 'node-nats-streaming';
import { queueGroupName } from './queue-group-name';
import { Ticket } from '../../models/ticket';
import { TicketUpdatedPublisher } from '../publishers/ticket-updated-publisher';

export class OrderCancelledListener extends Listener<OrderCancelledEvent> {
  readonly subject: Subjects.OrderCancelled = Subjects.OrderCancelled;
  queueGroupName = queueGroupName;
  async onMessage(data: OrderCancelledEvent['data'], msg: Message) {
    const ticket = await Ticket.findById(data.ticket.id);
    if (!ticket) {
      throw new Error('Ticket not found');
    }

    ticket.set({ orderId: undefined });
    await ticket.save();

    //We need to publish an event saying that the ticket was updated because the order was cancelled and the ticket is now available for purchase again. This is important for other services that might be interested in this change, such as a service that manages ticket availability or a service that handles user notifications.
    //we publish the whole ticket object because the other services might need to know the details of the ticket that was updated, such as its title, price, and userId. This information can be useful for various purposes, such as displaying the updated ticket information to users or performing additional business logic based on the ticket's details.
    await new TicketUpdatedPublisher(this.client).publish({
      id: ticket.id,
      title: ticket.title,
      price: ticket.price,
      userId: ticket.userId,
      orderId: ticket.orderId,
      version: ticket.version,
    });

    msg.ack();
  }
}
