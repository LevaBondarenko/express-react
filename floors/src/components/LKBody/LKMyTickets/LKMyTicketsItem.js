/**
 * LK My Tickets Item component
 *
 * @ver 0.0.1
 * @author denis.zemlyanov@it.etagi.com
 */

/**
 * devDependencies
 */
import React, {Component, PropTypes} from 'react'; // eslint-disable-line no-unused-vars
import moment from 'moment/moment';
import {size} from 'lodash';
import {getFromBack, postOrder} from '../../../utils/requestHelpers';
import {rusTypes} from '../../../utils/Helpers';
/**
 * React/Flux entities
 */
import UserActions from '../../../actions/UserActions';
import WidgetsActions from '../../../actions/WidgetsActions';

import LKMyTicketsActiveItem from './LKMyTicketsActiveItem';
import LKMyTicketsEmptyItem from './LKMyTicketsEmptyItem';

/* global data */

class LKMyTicketsItem extends Component {
  static propTypes = {
    cfg: PropTypes.object,
    user: PropTypes.object,
    mode: PropTypes.string,
    objects: PropTypes.object,
    tickets: PropTypes.array
  };

  constructor(props) {
    super(props);
    this.state = {
      datetime:
        `${moment().add(1, 'days').format('YYYY-MM-DD')}T10:00:00+05:00`,
      selectedObjects: [],
      attach: ''
    };
  }

  getNH(nhId) {
    const nhs = size(this.props.objects) ? this.props.objects.nh_flats : null;
    const obj = nhs ? this.props.objects.nh_flats[nhId] : null;

    return obj ? obj.gp : '';
  }

  submit = () => {
    const {datetime, selectedObjects, attach} = this.state;
    const {user, cfg, tickets} = this.props;
    const dateFormatted =
      moment(datetime)
        .toDate()
        .toLocaleString(
          'ru',
          {month: 'short', day: 'numeric', hour: 'numeric', minute: 'numeric'}
        );
    const objs = {};
    let objList = '', validateError = false;

    cfg.extraControls.every(item => {
      switch(item) {
      case 'objectsFromMyObjects':
        if(size(selectedObjects) > 0) {
          const objId = selectedObjects[0].id;

          if(tickets && !tickets.every(item => {
            const detail = JSON.parse(item.detail);

            return item.result !== null || parseInt(detail.objs) !== objId;
          })) {
            validateError = 'На выбранный объект уже есть активная заявка';
            return false;
          }
        } else {
          validateError = 'Не выбран объект';
          return false;
        }
        break;
      case 'objectsFromFavs':
        if(size(selectedObjects) < 1) {
          validateError = 'Не выбраны объекты';
          return false;
        }
        break;
      case 'attach':
        if(size(attach) < 1) {
          validateError =
            'Пожалуйста прикрепите файл с имеющейся у Вас планировкой';
          return false;
        }
        break;
      default:
        //do nothing
      }
      return true;
    });

    if(!validateError) {
      for(const i in selectedObjects) {
        if(selectedObjects[i]) {
          objList += selectedObjects[i].class === 'nh_flats' ?
            `Квартира в новостройке ${this.getNH(selectedObjects[i].id)} кв №${selectedObjects[i].id}, ` : //eslint-disable-line max-len
            `${rusTypes(selectedObjects[i].class)} №${selectedObjects[i].id}, `;
          if(!objs[selectedObjects[i].class]) {
            objs[selectedObjects[i].class] = [selectedObjects[i].id];
          } else {
            objs[selectedObjects[i].class].push(selectedObjects[i].id);
          }
        }
      }
      const dataSend = {
        phone: user.phone,
        source: 'LK',
        advanced_source: cfg.submit.advancedSource,  //eslint-disable-line camelcase
        type_id: cfg.typeId[0],  //eslint-disable-line camelcase
        city_id: data.options.cityId,  //eslint-disable-line camelcase
        object_id: ([28, 116].indexOf(cfg.typeId[0]) !== -1 && //eslint-disable-line camelcase
          selectedObjects[0] ? selectedObjects[0].id : 0),
        message: cfg.submit.message
          .replace('${objs}', objList)
          .replace('${dateFormatted}', dateFormatted)
          .replace('${attach}', attach),
        extra: JSON.stringify({
          datetime: datetime,
          objs: ([28, 116].indexOf(cfg.typeId[0]) !== -1 && selectedObjects[0] ?
            selectedObjects[0].id : objs),
          attach: attach
        }, (key, value) => {
          if(typeof value === 'number') {
            return value.toString();
          }
          if(value) {
            return value;
          }
        })
      };

      postOrder(dataSend).then(response => {
        if (response.ok) {
          getFromBack({
            action: 'user_get_all'
          }).then(response => {
            if(response.ok) {
              UserActions.fill(response.data);
              this.setState(() => ({
                datetime:
                  `${moment().add(1, 'days')
                    .format('YYYY-MM-DD')}T10:00:00+05:00`,
                selectedObjects: [],
                attach: ''
              }));
            } else {
              WidgetsActions.set('notify',[{
                msg: 'Ошибка получения данных с сервера, пожалуйста, обновите страницу', //eslint-disable-line max-len
                type: 'warn'
              }]);
            }
          });
        } else {
          WidgetsActions.set('notify',[{
            msg: 'Ошибка отправки заявки. Пожалуйста, обновите страницу и попробуйте еще раз.', //eslint-disable-line max-len
            type: 'dang'
          }]);
        }
      }, error => {
        error;
        WidgetsActions.set('notify',[{
          msg: 'Ошибка отправки заявки. Пожалуйста, обновите страницу и попробуйте еще раз.', //eslint-disable-line max-len
          type: 'dang'
        }]);
      });
    } else {
      WidgetsActions.set('notify',[{
        msg: `Ошибка отправки заявки: ${validateError}`,
        type: 'dang'
      }]);
    }
  }

  cancel = e => {
    const {id} = e.target;
    const canceled = e.target.checked;

    getFromBack({
      action: 'user_modify_ticket',
      ticket_id: id, //eslint-disable-line camelcase
      ticket_action: canceled ? 'reactivate' : 'cancel' //eslint-disable-line camelcase
    }).then(response => {
      if(response.ok) {
        getFromBack({
          action: 'user_get_all'
        }).then(response => {
          if(response.ok) {
            UserActions.fill(response.data);
          } else {
            WidgetsActions.set('notify',[{
              msg: 'Ошибка получения данных с сервера, пожалуйста, обновите страницу', //eslint-disable-line max-len
              type: 'warn'
            }]);
          }
        });
      } else {
        WidgetsActions.set('notify',[{
          msg: 'Ошибка отправки запроса, обновите страницу и попробуйте еще раз', //eslint-disable-line max-len
          type: 'warn'
        }]);
      }
    });
  }

  dateTimeChange = e => {
    if(e !== false) {
      this.setState(() => ({datetime: `${e}+05:00`}));
    }
  }

  dateTimeReplace = (e, id) => {
    const datetime = `${e}+05:00`;
    const dateFormatted =
      moment(datetime)
        .toDate()
        .toLocaleString(
          'ru',
          {month: 'short', day: 'numeric', hour: 'numeric', minute: 'numeric'}
        );

    getFromBack({
      action: 'user_modify_ticket',
      ticket_id: parseInt(id), //eslint-disable-line camelcase
      ticket_action: 'new_datetime', //eslint-disable-line camelcase
      datetime: datetime,
      dtformatted: dateFormatted
    }).then(response => {
      if(response.ok) {
        getFromBack({
          action: 'user_get_all'
        }).then(response => {
          if(response.ok) {
            UserActions.fill(response.data);
          } else {
            WidgetsActions.set('notify',[{
              msg: 'Ошибка получения данных с сервера, пожалуйста, обновите страницу', //eslint-disable-line max-len
              type: 'warn'
            }]);
          }
        });
      } else {
        WidgetsActions.set('notify',[{
          msg: 'Ошибка отправки запроса, обновите страницу и попробуйте еще раз', //eslint-disable-line max-len
          type: 'warn'
        }]);
      }
    });
  }

  objectsChange = e => {
    this.setState(() => ({selectedObjects: e}));
  }

  attachLoad = e => {
    this.setState(() => ({attach: e}));
  }

  attachReload = (e, id) => {
    getFromBack({
      action: 'user_modify_ticket',
      ticket_id: parseInt(id), //eslint-disable-line camelcase
      ticket_action: 'new_attach', //eslint-disable-line camelcase
      attach: e
    }).then(response => {
      if(response.ok) {
        getFromBack({
          action: 'user_get_all'
        }).then(response => {
          if(response.ok) {
            UserActions.fill(response.data);
          } else {
            WidgetsActions.set('notify',[{
              msg: 'Ошибка получения данных с сервера, пожалуйста, обновите страницу', //eslint-disable-line max-len
              type: 'warn'
            }]);
          }
        });
      } else {
        WidgetsActions.set('notify',[{
          msg: 'Ошибка отправки запроса, обновите страницу и попробуйте еще раз', //eslint-disable-line max-len
          type: 'warn'
        }]);
      }
    });
  }

  render() {
    const {mode} = this.props;
    let ticketItem;

    switch(mode) {
    case 'active':
      ticketItem = (
        <LKMyTicketsActiveItem
          {...this.props}
          {...this.state}
          onSubmit={this.submit}
          onCancelTicket={this.cancel}
          onDateTimeChange={this.dateTimeChange}
          onObjectsChange={this.objectsChange}
          onAttachLoad={this.attachLoad}
          onAttachReload={this.attachReload}
          onDateTimeReplace={this.dateTimeReplace}/>
      );
      break;
    case 'empty':
      ticketItem = (
        <LKMyTicketsEmptyItem
          {...this.props}
          {...this.state}
          onSubmit={this.submit}
          onDateTimeChange={this.dateTimeChange}
          onObjectsChange={this.objectsChange}
          onAttachLoad={this.attachLoad}/>
      );
      break;
    default:
      ticketItem = null;
    }

    return ticketItem;
  }
}

export default LKMyTicketsItem;