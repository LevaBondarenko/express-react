import request from 'superagent';
import {extend} from 'lodash';

const API_URL = '/backend/';
const TIMEOUT = 10000;

function post(data, url) {
  return request
    .post(url ? url : API_URL)
    .type('form')
    .set('Accept', 'application/json')
    .timeout(TIMEOUT)
    .send(data);
}

function get(url) {
  return request
    .get(`${API_URL}${url}`)
    .set('Accept', 'application/json');
}

const api = {

  get(what, action = 'user_get_objects_info') {
    return new Promise((resolve, reject) => {
      post({
        action: action,
        what: what
      }).end((err, res) => {
        if(err) {
          reject({err: err, res: res});
        } else if(!res.body.ok) {
          reject({error: res.text});
        } else {
          resolve(res.body.result);
        }
      });
    });
  },

  getPrice(data) {
    return new Promise((resolve, reject) => {
      post(data).end((err, res) => {
        if(err) {
          reject({err: err, res: res});
        } else if(!res.body.ok) {
          reject({error: res.text});
        } else {
          resolve({
            sell: res.body.sell,
            rent: res.body.rent
          });
        }
      });
    });
  },

  getStats(data) {
    return new Promise((resolve, reject) => {
      post(data).end((err, res) => {
        if(err) {
          reject({err: err, res: res});
        } else if(!res.body.ok) {
          reject({error: res.text});
        } else {
          resolve({
            views: res.body.views,
            favs: res.body.favs,
            bids: res.body.bids
          });
        }
      });
    });
  },

  uploadMedia(file, content, dir = 'lk') {
    return new Promise((resolve, reject) => {
      post({
        name: file.name,
        dir: dir,
        value: content
      },
      'https://pics2.etagi.com/upload.php?category=lk-userphoto'
      ).end((err, res) => {
        if(err) {
          reject({err: err, res: res});
        } else {
          resolve(JSON.parse(res.text));
        }
      });
    });
  },

  getHouse(url) {
    return new Promise((resolve, reject) => {
      get(url).end((err, res) => {
        if(err) {
          reject({err: err, res: res});
        } else if(!res.body.ok) {
          reject({error: res.text});
        } else {
          resolve(res.body.data);
        }
      });
    });
  },

  create(data, what) {
    return new Promise((resolve, reject) => {
      post(extend(data, {
        action: 'user_create',
        what: what})
      ).end((err, res) => {
        if(err) {
          reject({err: err, res: res});
        } else if(!res.body.ok) {
          reject({error: res.text});
        } else {
          resolve({
            data: {
              [res.body.data.name]: res.body.data.objects
            }
          });
        }
      });
    });
  },

  update(data, what) {
    return new Promise((resolve, reject) => {
      post(extend(data, {
        action: 'user_update',
        what: what})
      ).end((err, res) => {
        if(err) {
          reject({err: err, res: res});
        } else if(!res.body.ok) {
          reject({error: res.text});
        } else {
          resolve({
            data: {
              [res.body.data.name]: res.body.data.objects
            }
          });
        }
      });
    });
  },

  saveMedia(data) {
    return new Promise((resolve, reject) => {
      post(data).end((err, res) => {
        if(err) {
          reject({err: err, res: res});
        } else if(!res.body.ok) {
          reject({error: res.text});
        } else {
          resolve(res.body.data);
        }
      });
    });
  },

  rise(oid) {
    return new Promise((resolve, reject) => {
      post({
        action: 'user_rise_object',
        id: oid
      }).end((err, res) => {
        if(err) {
          reject({err: err, res: res});
        } else if(!res.body.ok) {
          reject({error: res.text});
        } else {
          resolve(res.body.data);
        }
      });
    });
  }

};

export default api;
