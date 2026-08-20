import express from 'express';
import 'express-async-errors';
import cookieSession from 'cookie-session';
import { errorHandler, NotFoundError, currentUser } from '@omaretickets/common';
import { deleteOrdersRouter } from './routes/delete';
import { indexOrdersRouter } from './routes/index';
import { newOrdersRouter } from './routes/new';
import { showOrdersRouter } from './routes/show';
const app = express();
//this is needed because express is behind a proxy (ingress-nginx) meaning that the request is coming from a proxy and not directly from the client. This is important for security reasons, as it allows express to correctly identify the client's IP address and other information.
app.set('trust proxy', true);
app.use(express.json());
app.use(
  cookieSession({
    signed: false,
    secure: process.env.NODE_ENV !== 'test', //this is needed because in test environment we don't have https, so we need to disable the secure flag for cookie-session to work properly. In production, we want to keep it enabled for security reasons.
  }),
);
app.use(currentUser);
app.use(deleteOrdersRouter);
app.use(indexOrdersRouter);
app.use(newOrdersRouter);
app.use(showOrdersRouter);
app.all('*', () => {
  throw new NotFoundError();
});

app.use(errorHandler);
export { app };
