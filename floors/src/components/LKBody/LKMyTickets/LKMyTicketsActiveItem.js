/**
 * LK My Tickets Active Item component
 *
 * @ver 0.0.1
 * @author denis.zemlyanov@it.etagi.com
 */

/**
 * devDependencies
 */
import React, {Component, PropTypes} from 'react'; // eslint-disable-line no-unused-vars
import {size, find, map, indexOf, sortBy} from 'lodash';
import classNames from 'classnames';
import moment from 'moment/moment';
/**
 * Bootstrap 3 elements
 */
import Row from 'react-bootstrap/lib/Row';
import Col from 'react-bootstrap/lib/Col';
import Button from 'react-bootstrap/lib/Button';
/**
 * React/Flux entities
 */
import UserActions from '../../../actions/UserActions';

import {declOfNum, getTitle, getAdress} from '../../../utils/Helpers';
import SwitchButton from '../../../shared/SwitchButton';
import DateTimePicker from '../../../shared/DateTimePicker';
import HelpIcon from '../../../shared/HelpIcon';
import ObjectSelector from './ObjectSelector';
import AttachSelector from './AttachSelector';
import s from './style.scss';

/*global data*/

class LKMyTicketsActiveItem extends Component {
  static propTypes = {
    cfg: PropTypes.object,
    tickets: PropTypes.array,
    preparedFavorites: PropTypes.array,
    preparedMyObjects: PropTypes.array,
    myobjects: PropTypes.array,
    objects: PropTypes.object,
    datetime: PropTypes.string,
    selectedObjects: PropTypes.oneOfType([
      PropTypes.object,
      PropTypes.array
    ]),
    attach: PropTypes.string,
    onSubmit: PropTypes.func,
    onCancelTicket: PropTypes.func,
    onDateTimeChange: PropTypes.func,
    onObjectsChange: PropTypes.func,
    onAttachLoad: PropTypes.func,
    onAttachReload: PropTypes.func,
    onDateTimeReplace: PropTypes.func
  };

  constructor(props) {
    super(props);
    this.state = {
      showObjList: false
    };
  }

  componentDidMount() {
    this.removeCss = s._insertCss();
  }

  componentWillUnmount() {
    this.removeCss();
  }

  toggleObjList = e => {
    let ancestor = e.target;

    while(!ancestor.id && (ancestor = ancestor.parentElement)) {};

    this.state.showObjList || setTimeout(() => {
      this.setState(() => ({showObjList: false}));
    }, 3000);
    this.setState(() => ({
      showObjList: this.state.showObjList === ancestor.id ? false : ancestor.id
    }));
  }

  get title() {
    const {cfg, tickets} = this.props;

    if(size(cfg.activeTitle) === 1) {
      return cfg.activeTitle[0];
    } else {
      return (
        <span>
          <span>{cfg.activeTitle[0]} </span>
          <span className='head-title-count'>
            {size(tickets)}
          </span>
          <span> {declOfNum(size(tickets), cfg.activeTitle[1])}</span>
        </span>
      );
    }
  }

  get ticketsList() {
    const {cfg, tickets, myobjects} = this.props;
    const res = map(sortBy(tickets, item => {
      return -parseInt(item.riesId);
    }), item => {
      const detail = JSON.parse(item.detail);
      const {oid} = detail[0] ? detail[0] : {};
      let action = null, title = null;

      switch(cfg.name) {
      case 'review':
        const titles = [];

        if(size(detail.objs)) {
          for(const c in detail.objs) {
            if(detail.objs[c]) {
              const cls = detail.objs[c];

              for(const i in cls) {
                if(cls[i] &&
                  this.props.objects[c] && this.props.objects[c][cls[i]]) {
                  const object = this.props.objects[c][cls[i]];
                  const title = getTitle(object.rooms, object.type_ru);
                  const adress = getAdress(
                    object.district, object.street, object.house_num
                  );

                  titles.push(`${title}, ${data.collections.cities[object.city_id].name}, ${adress} `); //eslint-disable-line max-len
                }
              }
            }
          }
        }
        title = size(titles) ? (
          size(titles) === 1 ? titles[0] : (
            <div className='ticket-item-titleslist'>
              <span
                id={item.id}
                onClick={this.toggleObjList}
                className='ticket-item-toggler'>
                {size(titles)}
                {declOfNum(size(titles), [' объект', ' объекта', ' объектов'])}
                &nbsp;недвижимости&nbsp;
                <i className='fa fa-angle-down'/>
              </span>
              <div
                className='ticket-item-dropdown'
                style={{
                  display: parseInt(this.state.showObjList) === item.id ?
                    'block' : 'none'
                }}>
                {
                  map(titles, (item, idx) => {
                    return (
                      <span key={`${item.id}-${idx}`}>{item}</span>
                    );
                  })
                }
              </div>
            </div>
          )
        ) : 'Объекты для просмотра не найдены';
        break;
      case 'mortgage':
        break;
      default:
        let obj = null, dir = null;

        if(cfg.name  === 'sellOrRent') {
          obj = find(myobjects, {id: parseInt(oid)});
          dir = indexOf([4, 13, 17], item.typeId) !== -1 ?
              'АРЕНДА' : 'ПРОДАЖА';
        } else {
          const {objs} = detail;

          obj = find(myobjects, {ries_id: parseInt(objs)});  //eslint-disable-line camelcase
        }

        title = obj ? (
          <span>
            {
              `${getTitle(obj.room, UserActions.objClassRu[obj.type_id])}, ${obj.address_meta}`  //eslint-disable-line max-len
            }
            {dir ? <span className='ticket-item-dir'>{dir}</span> : null}
          </span>
        ) : 'Объект удален';
      }
      switch(cfg.remarkAction) {
      case 'objectLink':
        action = find(myobjects, {id: parseInt(oid)}) ? (
          <span>
            <i className='fa fa-pencil'/>&nbsp;
            <a href={`#/myobjects/${oid}`}>
              Редактировать
            </a>
          </span>
        ) : null;
        break;
      case 'datetime':
        const datetime = moment(detail ? detail.datetime : null).toDate();
        const buttonTitle = (
          <span>
            <span>
              {datetime.toLocaleString('ru',{day: 'numeric', month: 'long'})}
            </span>
            <i className='fa fa-clock-o'/>
            <span>
              &nbsp;
              {datetime
                .toLocaleString('ru',{hour: 'numeric', minute: 'numeric'})
              }
            </span>
          </span>
        );

        action = item.result ? null : (
          <div>
            <DateTimePicker
              id={`${item.riesId}-dateTimeReplace`}
              title={buttonTitle}
              buttonClass='btn-datetime-inremark'
              cancelTitle='Отмена'
              saveTitle='Выбрать'
              rightAlign={true}
              datetime={detail.datetime}
              maxDate={moment().add(14, 'days').format('YYYY-MM-DD')}
              minDate={moment().add(1, 'days').format('YYYY-MM-DD')}
              onDateTimeChange={this.props.onDateTimeReplace}/>
          </div>
        );
        break;
      case 'attach':
        action = item.result ? null : (
          <AttachSelector
            id={`${item.riesId}-attachReload`}
            label='Изменить'
            className='no-margin btn-submit-darken'
            onLoad={this.props.onAttachReload} />
        );
        break;
      default:
        //do nothing
      }
      return (
        <Row key={item.id} className='ticket-item'>
          <Col xs={6}>
            {title}
          </Col>
          <Col xs={2} className='ticket-item-param'>
            {item.riesId}
          </Col>
          <Col xs={2} className='ticket-item-param'>
            <div>
              {
                item.result ? (
                  <span className={classNames({
                    'ticket-item-status-delete':
                      item.result !== 'object activated'
                  })}>
                    {UserActions.tickStatuses[item.result]}
                  </span>
                ) : (
                  indexOf([2, 4, 10, 13, 15, 17], item.typeId) === -1 ? (
                    <span>Активна</span>
                  ) : (
                    <span className='ticket-item-status-check'>
                      Проверяется..
                    </span>
                  )
                )
              }
              {((item.result === null &&
                indexOf([2, 4, 10, 13, 15, 17], item.typeId) === -1) ||
                item.result === 'canceled' ||
                item.result === 'object activated') ? (
                <div className='ticket-item-switch'
                  title={item.result === 'canceled' ?
                  'Возобновить' : 'Отменить'}>
                  <SwitchButton
                    id={item.riesId}
                    leftLabel=''
                    rightLabel=''
                    backgroundColor='#80A7AF'
                    checked={item.result !== 'canceled'}
                    small={true}
                    onChange={this.props.onCancelTicket}/>
                </div>
              ) : null}
            </div>
          </Col>
          <Col xs={2} className='ticket-item-param'>
            {action}
          </Col>
        </Row>
      );
    });

    return res;
  }

  get activeSubmit() {
    let title;
    const {cfg, selectedObjects, datetime, myobjects, objects} = this.props;
    const controls = cfg.activeSubmit && cfg.activeSubmit.controls ?
      map(cfg.activeSubmit.controls, ctrl => {
        let control;

        switch(ctrl) {
        case 'datetimeSelector':
          const dateFormatted = moment(datetime).toDate().toLocaleString('ru',
            {month: 'short', day: 'numeric', hour: 'numeric', minute: 'numeric'}
          );

          control = (
            <div key={ctrl}>
              <DateTimePicker
                title={dateFormatted}
                cancelTitle='Отмена'
                saveTitle='Выбрать'
                buttonClass='btn-datetime-picker'
                rightAlign={true}
                datetime={datetime}
                maxDate={moment().add(14, 'days').format('YYYY-MM-DD')}
                minDate={moment().add(1, 'days').format('YYYY-MM-DD')}
                onDateTimeChange={this.props.onDateTimeChange}/>
            </div>
          );
          break;
        case 'objectsFromMyObjects':
          title = 'Выбрать объект';
          if(size(selectedObjects)) {
            const obj =
              find(myobjects, {ries_id: parseInt(selectedObjects[0].id)});  //eslint-disable-line camelcase

            title = obj ?
              `${getTitle(obj.room, UserActions.objClassRu[obj.type_id])}, ${obj.address_meta}` :  //eslint-disable-line max-len
              title;
          }

          control = (
            <ObjectSelector
              id={cfg.name}
              key={ctrl}
              multiselect={false}
              selected={selectedObjects}
              title={title}
              onChange={this.props.onObjectsChange}
              objects={this.props.preparedMyObjects}
            />
          );
          break;
        case 'objectsFromFavs':
          title = 'Выберите объекты для просмотра';
          if(size(selectedObjects) === 1) {
            const obj = objects[selectedObjects[0].class] ?
              objects[selectedObjects[0].class][selectedObjects[0].id] : null;

            if(obj) {
              const otitle = getTitle(obj.rooms, obj.type_ru);
              const adress = getAdress(
                obj.district, obj.street, obj.house_num
              );

              title = `${otitle}, ${data.collections.cities[obj.city_id].name}, ${adress} `;   //eslint-disable-line max-len
            }
          }

          control = (
            <ObjectSelector
              id={cfg.name}
              key={ctrl}
              multiselect={true}
              selected={selectedObjects}
              title={title}
              onChange={this.props.onObjectsChange}
              objects={this.props.preparedFavorites}
            />
          );
          break;
        case 'attach':
          control = (
            <div key={ctrl}>
              <AttachSelector
                id={`${cfg.name}-${ctrl}`}
                className={classNames(
                  'btn-submit-extra',
                  {'no-margin': size(cfg.extraControls) > 1}
                )}
                onLoad={this.props.onAttachLoad} />
            </div>
          );
          break;
        default:
          control = null;
        }

        return control;
      }) : null;

    return cfg.activeSubmit ? (
      <Row className='ticket-submit'>
        <Col xs={controls ? 3 : 9}>
          {cfg.activeSubmit.desc}
        </Col>
        {
          controls ? (
            <Col xs={6}>
              {controls}
            </Col>
          ) : null
        }
        <Col xs={3}>
          <Button
            className='btn-submit'
            type='button'
            onClick={
              cfg.activeSubmit.ticketCreate ?
                this.props.onSubmit : null
            }
            href={cfg.activeSubmit.link ? cfg.activeSubmit.link : null}
          >
            {cfg.activeSubmit.title}
          </Button>
        </Col>
      </Row>
    ) : null;
  }

  render() {
    const {cfg} = this.props;

    return (
      <Row className={s.activeTicketItem}>
        <Row className='head'>
          <Col xs={6} className='head-title'>
            <img src={cfg.icon} />
            {this.title}
          </Col>
          <Col xs={2} className='head-col'>
            № заявки
          </Col>
          <Col xs={2} className='head-col'>
            Статус заявки
            <HelpIcon
              className='head-help'
              placement='bottom'
              helpText={
                <div>
                  <ul>
                    <li><b>Активна</b> - заявка в работе</li>
                    <li><b>Отменена</b> - заявка отменена по Вашему запросу</li>
                    <li><b>Удалена</b> - заявка удалена</li>
                    <li><b>Завершена</b> - заявка выполнена</li>
                    <li>
                      <b>Проверяется</b>&nbsp;
                      - заявка в работе, проверяется специалистами
                    </li>
                  </ul>
                </div>
              }/>
          </Col>
          <Col xs={2} className='head-col'>
            {cfg.remarkHead}
          </Col>
        </Row>
        {this.ticketsList}
        {this.activeSubmit}
      </Row>
    );
  }
}

export default LKMyTicketsActiveItem;
