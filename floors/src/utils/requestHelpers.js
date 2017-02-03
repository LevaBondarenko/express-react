/**
 * widgets backend-requests methods
 *
 * @ver 0.0.1
 * @author denis.zemlyanov@it.etagi.com
 */

/**
 * devDependencies
 */
import request from 'superagent';
import {map, merge, size, assign, union} from 'lodash';
import Helpers from '../utils/Helpers';

const requestHelpers = {
  getObjects(filter, fields = false) {
    return new Promise((resolve, reject) => {
      const dataArr = filter;

      dataArr.action = 'modular_search';
      dataArr.subAction =  fields ? 'aggregates' : 'objects';
      if(fields) {
        dataArr.fields = fields;
      }
      request
        .post('/msearcher_ajax.php')
        .set({
          Accept: 'application/json',
          'Content-Type': 'application/x-www-form-urlencoded'
        })
        .send(dataArr)
        .end((err, res) => {
          if(err) {
            reject({err: err, res: res});
          } else if(!res.body.ok) {
            reject({error: res.text});
          } else {
            resolve(res.body);
          }
        });
    });
  },

  getActionNh(builders) {
    return new Promise((resolve, reject) => {
      request
        .get('/backend/')
        .type('form')
        .set('Accept', 'application/json')
        .query({
          action: 'show_action_nh',
          'builders': builders
        })
        .end((err, res) => {
          if(err) {
            reject({err: err, res: res});
          } else {
            const typeData = typeof res.body;

            if (typeData === 'object') {
              let count = 0;

              map(res.body, () => {
                ++count;
              });

              resolve({
                nh: res.body,
                activeNh: -1,
                beforeBlock: -1,
                count: count
              });
            } else {
              resolve({
                error: res.body,
                activeNh: -1,
                beforeBlock: -1
              });
            }
          }
        });
    });
  },

  sendOrder(data) {
    return new Promise((resolve, reject) => {
      request
        .get('/backend/')
        .type('form')
        .set('Accept', 'application/json')
        .query(data)
        .end((err, res) => {
          if(err) {
            reject({err: err, res: res});
          } else {
            resolve({
              ajax: res.body
            });
          }
        });
    });
  },

  postOrder(data) {
    return new Promise((resolve, reject) => {
      request
        .post('/backend/')
        .type('form')
        .set('Accept', 'application/json')
        .send(merge(data, {action: 'user_send_ticket'}))
        .end((err, res) => {
          if(err) {
            reject({err: err, res: res});
          } else {
            resolve(res.body);
          }
        });
    });
  },

  getUser(data) {
    return new Promise((resolve, reject) => {
      request
          .post('/backend/')
          .type('form')
          .send({
            action: data.action,
            userId: data.userId
          })
          .end((err, res) => {
            if(err) {
              reject({err: err, res: res});
            } else {
              resolve({
                ajax: res.body
              });
            }
          });
    });
  },

  rieltorCloud(data) {
    return new Promise((resolve, reject) => {
      request
        .post('/msearcher_ajax.php')
        .type('form')
        .send({
          action: 'load_users',
          department: data.department,
          'city_id': data.cityId
        })
        .end((err, res) => {
          if(err) {
            reject({err: err, res: res});
          } else {
            resolve({
              ajax: res.body
            });
          }
        });
    });
  },

  getWebOwner(objectId) {
    return new Promise((resolve, reject) => {
      request
    .post('/backend/')
    .type('form')
    .set('Accept', 'application/json')
    .send({
      action: 'get_web_owner',
      objectId: objectId
    })
  .end((err, res) => {
    if (err) {
      reject({err: err, res: res});
    } else {
      resolve({
        ajax: res.body
      });
    }
  });
    });
  },

  sendExchibition(data) {
    return new Promise((resolve, reject) => {
      request
        .get('/backend/')
        .type('form')
        .set('Accept', 'application/json')
        .query({
          action: data.action,
          name: data.name,
          phone: data.phone,
          'city_id': data.cityId
        })
        .end((err, res) => {
          if (err) {
            reject({err: err, res: res});
          } else {
            resolve({
              ajax: res.body
            });
          }
        });
    });
  },

  loadImage(file) {
    return new Promise((resolve, reject) => {
      const fileReader = new FileReader();

      fileReader.onload = (event) => {
        resolve({file: file, result: event.target.result});
      };
      fileReader.onerror = (event) => {
        reject({error: 'loadError', name: event.target.error.name});
      };
      fileReader.readAsDataURL(file);
    });
  },

  uploadToPics(file, content, dir = 'lk') {
    return new Promise((resolve, reject) => {
      request
        .post('https://pics2.etagi.com/upload.php')
        .set({
          Accept: 'application/json',
          'Content-Type': 'application/x-www-form-urlencoded'
        })
        .send({name: file.name, dir: dir, value: content})
        .end((err, res) => {
          if(err) {
            reject({err: err, res: res});
          } else {
            resolve(JSON.parse(res.text));
          }
        });
    });
  },

  getFromBack(data, method, addr) {
    let url = addr !== undefined ? addr : '/backend/';

    if (typeof method === 'undefined') {
      method = 'post';
    } if (method === 'get') {
      url = Helpers.generateSearchUrl(data, `${url}?`);
    }

    return new Promise((resolve, reject) => {
      request[method](url)
        .type('form')
        .set('Accept', 'application/json')
        .send(data)
        .end((err, res) => {
          if(err) {
            reject({err: err, res: res});
          } else {
            resolve(res.body);
          }
        });
    });
  },

  getCatalogs(models) {
    return new Promise((resolve, reject) => {
      const idsForCats = {};

      models.forEach(model => {
        if(size(model.trakt_id)) {
          idsForCats['trakt_id'] = size(idsForCats['trakt_id']) ?
            union(idsForCats['trakt_id'], model.trakt_id) :
            model.trakt_id;
        }
        if(size(model.district_id)) {
          idsForCats['district_id'] = size(idsForCats['district_id']) ?
          union(idsForCats['district_id'], model.district_id) :
          model.district_id;
        }
        if(size(model.street_id)) {
          idsForCats['street_id'] = size(idsForCats['street_id']) ?
          union(idsForCats['street_id'], model.street_id) :
          model.street_id;
        }
        if(size(model.builder_id)) {
          idsForCats['builder_id'] = size(idsForCats['builder_id']) ?
          union(idsForCats['builder_id'], model.builder_id) :
          model.builder_id;
        }
        if(size(model.newcomplex_id)) {
          idsForCats['newcomplex_id'] = size(idsForCats['newcomplex_id']) ?
          union(idsForCats['newcomplex_id'], model.newcomplex_id) :
          model.newcomplex_id;
        }
        if(size(model.furniture)) {
          idsForCats['furniture'] = size(idsForCats['furniture']) ?
          union(idsForCats['furniture'], model.furniture) :
          model.furniture;
        }
      });

      if(size(idsForCats)) {
        request
          .get('/msearcher_ajax.php')
          .set({
            Accept: 'application/json',
            'Content-Type': 'application/x-www-form-urlencoded'
          })
          .query(assign({
            action: 'modular_search',
            subAction: 'catalogs'
          }, idsForCats))
          .end((err, res) => {
            if(err) {
              reject({err: err, res: res});
            } else if(!res.body.ok) {
              reject({error: res.text});
            } else {
              resolve(res.body.catalogs);
            }
          });
      } else {
        resolve({});
      }
    });
  }
};

export default requestHelpers;
