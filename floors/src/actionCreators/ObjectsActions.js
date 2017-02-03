import {
  FLUSH,
  REMOVE,
  SETIN,
  UPDATEIN,
  MERGEDEEP,
  MASSUPDATEIN
} from '../constants/objects-consts';
import request from 'superagent';
import {generateMortgageUrl} from '../utils/Helpers';
import {find, size, forIn, map} from 'lodash';

export function flushObjectsState() {
  return {
    type: FLUSH
  };
};

export function removeObjectsState(namespace) {
  return {
    type: REMOVE,
    namespace: namespace
  };
}

export function setInObjectsState(path, value) {
  return {
    type: SETIN,
    path: path,
    value: value
  };
}

export function updateInObjectsState(path, updater) {
  return {
    type: UPDATEIN,
    path: path,
    updater: updater
  };
}

export function mergeInObjectsState(object) {
  return {
    type: MERGEDEEP,
    object: object
  };
}

export function massUpdateInObjectsState(path, object) {
  return {
    type: MASSUPDATEIN,
    path: path,
    object: object
  };
}

export function getShowCaseData(params, collections, cb) {
  return dispatch => {
    params.action = 'demand_showcase';
    params.limit = '100';

    // если пользователь уточняет район, то убираем из запроса улицу и номер дома
    if (params.district_id) {
      params.street_id = ''; // eslint-disable-line camelcase
      params.house = '';
    }

    if (params.doNotUseSquare) {
      params.square_from = undefined; // eslint-disable-line camelcase
      params.square_to = undefined; // eslint-disable-line camelcase
      params.square = undefined;
      params.doNotUseSquare = '';
    }

    const uri = generateMortgageUrl(params, '/msearcher_ajax.php?');

    new Promise(() => {
      request
        .get(uri)
        .set({
          Accept: 'application/json',
          'Content-Type': 'application/x-www-form-urlencoded',
          'Cache-Control': 'public, max-age=21600'
        }).then(res => {
          const {count, data, districts, nearby_districts} = res.body; // eslint-disable-line camelcase
          let {house_found: houseFound} = res.body;
          const paramsToSet = {};
          const foundDistricts = [];
          const foundDistrictsSize = size(districts);

          paramsToSet.count = count;
          paramsToSet.house_found = houseFound; // eslint-disable-line camelcase
          paramsToSet.street_found = res.body.street_found; // eslint-disable-line camelcase
          paramsToSet.district_id = params.district_id; // eslint-disable-line camelcase

          // подгоняем найденные районы к тому виду, в каком у нас все коллекции
          forIn(districts, (name, id) => {
            foundDistricts.push({
              name: name,
              id: id
            });
          });


          if (foundDistrictsSize) {
            collections.found_districts = foundDistricts; // eslint-disable-line camelcase
            paramsToSet.collections = collections;
          }
          if (params.district_id) {
            paramsToSet.district = find(collections.found_districts,
              {id: params.district_id}).name;
          }

          if (foundDistrictsSize === 1) {
            paramsToSet.district_id = foundDistricts[0]['id']; // eslint-disable-line camelcase
            paramsToSet.house_found = true; // eslint-disable-line camelcase
            houseFound = true;
          }
          paramsToSet.emptyStreet = foundDistrictsSize === 0 &&
            paramsToSet.street_found !== undefined;

          if (houseFound || houseFound === undefined) {
            paramsToSet.items = data;
          }

          paramsToSet.nearby_districts = map( // eslint-disable-line camelcase
            nearby_districts, distr => distr.toString()
          );
          paramsToSet.showStats = houseFound || houseFound === undefined ?
            '1' : '0';

          paramsToSet.showTicketsTable = count === 0;
          paramsToSet.needAltUpdate = !params.needAltUpdate;
          paramsToSet.altSumm = 0;
          paramsToSet.showAvgPrice = paramsToSet.house_found ||
            paramsToSet.district_id;
          paramsToSet.avgPriceLoading = true;
          paramsToSet.houseData = res.house || {
            'wall_id': 12,
            'series_id': 47,
            'floors_cnt': 9
          };
          paramsToSet.hasLoaded = true;
          paramsToSet.hideDistricts = paramsToSet.emptyStreet;

          switch(params.rooms) {
          case '1':
            paramsToSet.roomsNumText = 'однокомнатную';
            break;
          case '2':
            paramsToSet.roomsNumText = 'двухкомнатную';
            break;
          case '3':
            paramsToSet.roomsNumText = 'трехкомнатную';
            break;
          default:
            paramsToSet.roomsNumText = 'многокомнатную';
            break;
          }

          dispatch(massUpdateInObjectsState(['demandShowCase'], paramsToSet));
          cb && cb();
        });
    });
  };
}

export function increasePostViews(origin, id) {
  return dispatch => {
    const uri = `/backend/?action=blog_etagi&method=inc_views_count&origin=${origin}&post=${id}`; // eslint-disable-line max-len

    new Promise(() => {
      request
        .get(uri)
        .set({
          Accept: 'application/json',
          'Content-Type': 'application/x-www-form-urlencoded',
          'Cache-Control': 'public, max-age=21600'
        }).then(res => {
          const parsedRes = res.text ? JSON.parse(res.text) : null;

          if (parsedRes && parsedRes.success) {
            dispatch(
              updateInObjectsState(['blog', 'blogpost', 'views_count'], () => {
                return parsedRes.viewsCount.toString();
              })
            );
          }
        });
    });
  };
}

export function setComment(userId, origin, id, comText, comParent, userName,
 userPh, cityId, preMod) {
  return dispatch => {
    new Promise(() => {
      const commentData = {
        action: 'blog_etagi',
        cmntcity: cityId,
        cmntparent: comParent,
        comment: comText,
        method: 'set_comment',
        origin: origin,
        post: id,
        premod: preMod,
        userid: userId,
        username: userName,
        userphoto: userPh
      };

      request
        .post('/backend/')
        .send(commentData)
        .set({
          Accept: 'application/json',
          'Content-Type': 'application/x-www-form-urlencoded'
        }).then(res => {
          const parsedRes = res.text ? JSON.parse(res.text) : null;
          const commentId = parsedRes.commentId.toString();
          const paramsToUpdate = {
            comment_ID: commentId, // eslint-disable-line camelcase
            comment_author: userName, // eslint-disable-line camelcase
            comment_content: comText, // eslint-disable-line camelcase
            comment_date_gmt: parsedRes.commentDateGMT, // eslint-disable-line camelcase
            comment_parent: comParent.toString(), // eslint-disable-line camelcase
            likes_count: '0', // eslint-disable-line camelcase
            lk_user_id: userId, // eslint-disable-line camelcase
            user_photo: userPh // eslint-disable-line camelcase
          };

          if (parsedRes && parsedRes.success && preMod) { // since preMod is 0 when it's on and 1 when it's off (preMod is inverted)
            dispatch(setInObjectsState(
              ['blog', 'blogpost', 'comments', commentId],
              paramsToUpdate
            ));
          }
        });
    });
  };
}

export function setCommentLike(userId, origin, commentId) {
  return dispatch => {
    const uri = `/backend/?action=blog_etagi&method=set_like&userid=${userId}&origin=${origin}&commentid=${commentId}`; // eslint-disable-line max-len

    new Promise(() => {
      request
        .get(uri)
        .set({
          Accept: 'application/json',
          'Content-Type': 'application/x-www-form-urlencoded',
          'Cache-Control': 'public, max-age=21600'
        }).then(res => {
          const parsedRes = res.text ? JSON.parse(res.text) : null;
          const paramsToUpdate = {
            likes_count: parsedRes.likesCount.toString(), // eslint-disable-line camelcase
            likes_users: parsedRes.likesUsers // eslint-disable-line camelcase
          };

          if (parsedRes && parsedRes.success) {
            dispatch(massUpdateInObjectsState(
              ['blog', 'blogpost', 'comments', commentId.toString()],
              paramsToUpdate
            ));
          }
        });
    });
  };
}

