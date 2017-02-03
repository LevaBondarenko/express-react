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
import {size, map, find} from 'lodash';
import classNames from 'classnames';
import moment from 'moment/moment';
/**
 * Bootstrap 3 elements
 */
import Row from 'react-bootstrap/lib/Row';
import Col from 'react-bootstrap/lib/Col';
import Button from 'react-bootstrap/lib/Button';

import DateTimePicker from '../../../shared/DateTimePicker';
import ObjectSelector from './ObjectSelector';
import AttachSelector from './AttachSelector';
import s from './style.scss';
/**
 * React/Flux entities
 */
import UserActions from '../../../actions/UserActions';

import {getTitle, getAdress} from '../../../utils/Helpers';

/*global data*/

class LKMyTicketsEmptyItem extends Component {
  static propTypes = {
    cfg: PropTypes.object,
    objects: PropTypes.object,
    myobjects: PropTypes.array,
    preparedFavorites: PropTypes.array,
    preparedMyObjects: PropTypes.array,
    datetime: PropTypes.string,
    selectedObjects: PropTypes.oneOfType([
      PropTypes.object,
      PropTypes.array
    ]),
    attach: PropTypes.string,
    onSubmit: PropTypes.func,
    onCancel: PropTypes.func,
    onDateTimeChange: PropTypes.func,
    onObjectsChange: PropTypes.func,
    onAttachLoad: PropTypes.func
  };

  constructor(props) {
    super(props);
  }

  componentDidMount() {
    this.removeCss = s._insertCss();
  }

  componentWillUnmount() {
    this.removeCss();
  }

  get controls() {
    let title;
    const {cfg, selectedObjects, datetime, myobjects, objects} = this.props;
    const submitBtn = (
      <Button
        className='btn-submit'
        type='button'
        onClick={
          cfg.submit.ticketCreate ? this.props.onSubmit : null
        }
        href={cfg.submit.link ? cfg.submit.link : null}
      >
        {cfg.submit.title}
      </Button>
    );
    const extSubmitBtn = cfg.extraSubmit ? (
      <Button
        className={classNames(
          'btn-submit-extra',
          {'no-margin': size(cfg.extraControls)}
        )}
        type='button'
        onClick={
          cfg.extraSubmit.ticketCreate ?
            this.props.onSubmit : null
        }
        href={cfg.extraSubmit.link ? cfg.extraSubmit.link : null}
      >
        {cfg.extraSubmit.title}
      </Button>
    ) : null;
    const extControls = map(cfg.extraControls, ctrl => {
      let control;

      switch(ctrl) {
      case 'datetimeSelector':
        const dateFormatted = moment(datetime).toDate().toLocaleString('ru',
          {month: 'short', day: 'numeric', hour: 'numeric', minute: 'numeric'}
        );

        control = (
          <div key={ctrl}>
            <span className='control-title'>Выберите удобное время</span>
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
          <AttachSelector
            key={ctrl}
            id={`${cfg.name}-${ctrl}`}
            className={classNames(
              'btn-submit-extra',
              {'no-margin': size(cfg.extraControls) > 1}
            )}
            onLoad={this.props.onAttachLoad} />
        );
        break;
      default:
        control = null;
      }

      return control;
    });

    return (
      <Row>
        <Col xs={6}>
          {extControls}
          {extSubmitBtn}
        </Col>
        <Col xs={6}>
          {submitBtn}
        </Col>
      </Row>
    );
  }

  render() {
    const {cfg} = this.props;

    return (
      <Row className={s.emptyTicketItem}>
        <Col xs={1} className='logo'>
          <img src={cfg.icon} />
        </Col>
        <Col xs={6} className='info'>
          <span className='title'>{cfg.title}</span>
          <span className='desc'>{cfg.desc}</span>
        </Col>
        <Col xs={5} className='actions'>
          {this.controls}
        </Col>
      </Row>
    );
  }
}

export default LKMyTicketsEmptyItem;
