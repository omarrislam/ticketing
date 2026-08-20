import request from 'supertest';
import { app } from '../../app';

it('fails when an email doesnt exist is supplied', async () => {
  await request(app)
    .post('/api/users/signin')
    .send({ email: 'test@ttest.com', password: '1234' })
    .expect(400);
});

it('fails when an incorrect password is supplied', async () => {
  await request(app)
    .post('/api/users/signup')
    .send({ email: 'test@ttest.com', password: '1234' })
    .expect(201);

  await request(app)
    .post('/api/users/signin')
    .send({ email: 'test@ttest.com', password: '134' })
    .expect(400);
});

it('responds with a cookie when given valid credentials', async () => {
  await request(app)
    .post('/api/users/signup')
    .send({ email: 'test@ttest.com', password: '1234' })
    .expect(201);

  const response = await request(app)
    .post('/api/users/signin')
    .send({ email: 'test@ttest.com', password: '1234' })
    .expect(200);

  expect(response.get('Set-Cookie')).toBeDefined();
});
