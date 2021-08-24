  //const app = require('./server.js').appOnly();
  const supertest = require('supertest');
  const req = supertest('http://localhost:8089');

  test('Testing to see if Jest works', () => {
    expect(1).toBe(1);
  });

  test('tests ennd point retrieval', async done => {
    const res = await req.get('/test');
    expect(res.status).toBe(200);
    expect(res.body.message).toBe('pass!');
    done();
  });

  test('tests shop retrieval', async done => {
    const res = await req.get('/shop');
    expect(res.status).toBe(200);
    done();
  });

describe('login', ()=>{
  console.warn('cookie needs to set prior to running test')
  let cookie = [ 'connect.sid=s%3Avzi6myZFHtBE61Dc9qjOhz63Ra9hAQWz.J%2F1GgWBzK5H17kKFO3b9tq1ImJl3QeePnuJkZ9F%2B2y8'];
  test('tests log in with super\'s creds', async done =>{
    let res = await req.get('/backend')
      .set('cookie', cookie);
      /*Login redirects to '/backend'*/
      expect(res.status).toBe(301);
      done();
  });

});
