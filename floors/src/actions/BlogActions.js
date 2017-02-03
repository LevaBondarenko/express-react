/**
 * Blog actions
 *
 * @ver 0.0.1
 * @author @author a.v.drozdov@nv.etagi.com
 */
/*eslint camelcase: [2, {properties: "never"}]*/
import Dispatcher from '../core/Dispatcher';
import BlogTypes from '../constants/BlogTypes';
import bs from '../stores/BlogStore';
import {clone} from 'lodash';
/*global data*/
export default {

  getBlogInfo(origin = null, post = null, chosenCategory = null,
   increaseViews = null) {
    const dataArr = clone(bs.get());

    dataArr.isLoading || Dispatcher.handleViewAction({
      actionType: BlogTypes.BS_SET,
      property: 'isLoading',
      data: true
    });

    const bsHasCity = bs.get('city_id') && bs.get('city_id').length > 0;

    dataArr['city_id'] = bsHasCity ? bs.get('city_id') :
     [data.options.cityId];
    if(dataArr['city_id'][0] !== 23) { // To change?
      dataArr['city_id'].push(23);
    }
    dataArr['origin'] = origin;
    dataArr['post'] = post;
    dataArr['chosenCategory'] = chosenCategory;

    $.ajax({
      url: '/backend/',
      type: 'POST',
      dataType: 'json',
      data: {
        action: 'blog_etagi',
        method: 'get_data',
        cities: dataArr['city_id'],
        origin: dataArr['origin'],
        post: dataArr['post'],
        chosenCategory: dataArr['chosenCategory'],
        increaseViews: increaseViews
      },
      success: (data) => {
        data.isLoading = false;
        data.commentParent = 0;

        if(origin && post) { // здесь надо менять, временный (очень надеюсь) костыль ... на него завязан виджет "Читайте также" блога
          $.ajax({
            url: '/backend/',
            type: 'POST',
            dataType: 'json',
            data: {
              action: 'blog_etagi',
              method: 'get_data',
              cities: dataArr['city_id'],
              origin: null,
              post: null,
              chosenCategory: data.posts[0].categories_tr[0]
            },
            success: (dataRA) => {
              data.dataRA = dataRA.posts;

              Dispatcher.handleViewAction({
                actionType: BlogTypes.BS_SET,
                property: null,
                data: data
              });
            },
          });
        } else {
          Dispatcher.handleViewAction({
            actionType: BlogTypes.BS_SET,
            property: null,
            data: data
          });
        } // вот прямо посюда, сжечь при первой возможности

        /*Dispatcher.handleViewAction({
          actionType: BlogTypes.BS_SET,
          property: null,
          data: data
        });*/
      },
    });
  },

  setBlogInfo(userId, origin, post, comment, cmntParent = null,
   userName = null, userPhoto = null, cmntCity = null, preMod = null) {
    if(!cmntCity) {
      $.ajax({
        url: '/backend/',
        type: 'GET',
        dataType: 'json',
        data: {
          action: 'blog_etagi',
          method: 'set_like',
          userid: userId,
          origin: origin,
          commentid: comment
        },
        success: (data) => {
          Dispatcher.handleViewAction({
            actionType: BlogTypes.BS_SET,
            property: null,
            data: data
          });
          this.getBlogInfo(origin, post);
        },
      });
    } else {
      $.ajax({
        url: '/backend/',
        type: 'GET',
        dataType: 'json',
        data: {
          action: 'blog_etagi',
          method: 'set_comment',
          origin: origin,
          post: post,
          comment: comment,
          cmntparent: cmntParent,
          userid: userId,
          username: userName,
          userphoto: userPhoto,
          cmntcity: cmntCity,
          premod: preMod
        },
        success: (data) => {
          Dispatcher.handleViewAction({
            actionType: BlogTypes.BS_SET,
            property: null,
            data: data
          });
          this.getBlogInfo(origin, post);
        },
      });
    }
  },

  set(id, data) {
    id || (data.isLoading = true);
    Dispatcher.handleViewAction({
      actionType: BlogTypes.BS_SET,
      property: id,
      data: data
    });
  },

  del(id, data) {
    Dispatcher.handleViewAction({
      actionType: BlogTypes.BS_DEL,
      property: id,
      data: [data]
    });
  },

  flush() {
    Dispatcher.handleViewAction({
      actionType: BlogTypes.BS_FLUSH,
    });
  }

};
