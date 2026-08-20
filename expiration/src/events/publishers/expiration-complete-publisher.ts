import {
  Subjects,
  Publisher,
  ExpirationCompleteEvent,
} from '@omaretickets/common';

export class ExpirationCompletePublisher extends Publisher<ExpirationCompleteEvent> {
  readonly subject = Subjects.ExpirationComplete;
}
