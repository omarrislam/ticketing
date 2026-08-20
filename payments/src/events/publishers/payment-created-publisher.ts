import { Subjects, Publisher, PaymentCreatedEvent } from '@omaretickets/common';

export class PaymentCreatedPublisher extends Publisher<PaymentCreatedEvent> {
  readonly subject = Subjects.PaymentCreated;
}
