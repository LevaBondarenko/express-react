/**
 * o.e.kurgaev@it.etagi.com
 */
import request from 'superagent';

export default async (endpoint, path, query) => new Promise((resolve, reject) =>
  request
    .post(endpoint)
    .type('form')
    .send({action: 'rest_get'})
    .send({path: path == '/' ? '' : path})
    .send(query)
    .set('Accept', 'application/json')
    .end((err, res) => {
      err ? reject(err) : resolve(res.body);
    })
);
