import { Publisher, OrderCreatedEvent, Subjects } from '@omaretickets/common';

export class OrderCreatedPublisher extends Publisher<OrderCreatedEvent> {
  subject: Subjects.OrderCreated = Subjects.OrderCreated;
}
