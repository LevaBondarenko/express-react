/**
 * Created by tatarchuk on 30.04.15.
 */

import React, {Component, PropTypes} from 'react'; // eslint-disable-line no-unused-vars
import {map} from 'lodash';
import classNames from 'classnames';
import wss from '../../stores/WidgetsStateStore';
import WidgetsActions from '../../actions/WidgetsActions';
import GeminiScrollbar from 'react-gemini-scrollbar';
import Rating from '../../shared/Rating';

/* global data*/
class NewhousesParameter extends Component {
  static propTypes = {
    parameter: PropTypes.string,
    wssSettings: PropTypes.string,
    wssSettingsValue: PropTypes.string,
    context: React.PropTypes.shape({
      insertCss: React.PropTypes.func,
    })
  };

  static defaultProps = {
    parameter: '',
    wssSettings: '',
    wssSettingsValue: ''
  }

  constructor(props) {
    super(props);

    this.state = {
      store: wss,
      actions: WidgetsActions,
      show: props.wssSettings ? false : true
    };
  }

  componentWillMount() {
    this.state.store.onChange(this.onChange);
  }

  componentDidMount() {
    const {wssSettings} = this.props;
    const {
      description, action_description: actionDescription
    } = data.object.info.info;
    const val = !actionDescription ? (!description ? '11' : '10') : '12';

    this.state.actions.set(wssSettings, val);
    this.onChange();
  }

  componentWillUnmount() {
    this.state.store.offChange(this.onChange);
  }

  onChange = () => {
    const {wssSettings, wssSettingsValue} = this.props;
    const curValue = wssSettings ? this.state.store.get()[wssSettings] : '';

    this.setState(() => ({
      show: curValue ===  wssSettingsValue
    }));
  }

  title(gp) {
    const title = {__html: gp};

    return <h1 className="parameterTitle" dangerouslySetInnerHTML={title}></h1>;
  }

  deadlineHtml(info) {
    return parseInt(info.deadline) ?
      <p>Дом сдан</p> :
      <p>
        <strong>Срок сдачи: </strong>
        <span>{`${info.deadline_q} кв. ${info.deadline_y} г.`}</span>
      </p>;
  }

  district(name) {
    return (<p>
      <strong>Район: </strong>
      <span>{name}</span>
    </p>);
  }

  wall(wall) {
    return (<p>
      <strong>Стены: </strong>
      <span>{wall}</span>
    </p>);
  }

  percent(percent) {
    const showBlock = parseInt(percent) >= 0 ? true : false;

    return showBlock ? (<div className="parameterRating-section">
      <p>
        <strong>Готовность дома: </strong>
      </p>
      <table className="parameterRating-wrapper w100">
        <tbody>
        <tr>
          <td>
            <div className="parameterRating-block">
              <div className="parameterRating-active"
                   style={{width: `${percent}%`}} />
            </div>
          </td>
          <td style={{width: '65px'}}>
              <span className="parameterRating-text">
                {`${percent}%`}
              </span>
          </td>
        </tr>
        </tbody>
      </table>
    </div>) : null;
  }

  rating(info) {
    return info.ratings && info.rating > data.options.minRating ? (
      <div style={{position: 'relative'}} className="parameterRating-section">
        <p>
          <strong>Рейтинг дома: </strong>
        </p>
        <Rating id={info.id}
                content={info.ratings}
                context={this.props.context}
                className='ratingGkParameter'
                showLink='1'
                linkClass='gkRatingLink'
                show={1}/>
      </div>
    ) : null;
  }

  builder(info) {
    return info.builder_id ? (<p>
      <strong>Застройщик: </strong>
        <span>
          <a href={`/zastr/builder/${info.builder_url}-${info.builder_id}`}
             title={info.builder_name}>{info.builder_name}</a>
        </span>
    </p>) : null;
  }

  description(description) {
    return description ? (
      <GeminiScrollbar className="parameterNewhouses-scroll">
        <div dangerouslySetInnerHTML={
        {__html: (description ? description : '')}
      } />
      </GeminiScrollbar>
    ) : <style>{`
      .parameterNewhouses-btns .btn:first-child {display: none}
      .parameterNewhouses-btns .btn:nth-child(2) {border-left: none!important}
      `}
    </style>;
  }

  installment(installment) {
    return installment ? (
      <GeminiScrollbar className="parameterNewhouses-scroll">
        <div dangerouslySetInnerHTML={
        {__html: installment}
      } />
      </GeminiScrollbar>
    ) : <style>{`
      .parameterNewhouses-btns .btn:nth-child(3) {display: none}
      `}
    </style>;
  }

  action(info) {
    return info.action_description ? (
      <GeminiScrollbar className="parameterNewhouses-scroll">
        <p>
          <strong>{info.action_name}</strong>
        </p>
        <div dangerouslySetInnerHTML={
          {__html: info.action_description}
        }/>
      </GeminiScrollbar>
    ) : <style>
      {'.parameterNewhouses-btns .btn:last-child {display: none}'}
    </style>;
  }

  parameters() {
    const infoGroups = data.object.info.info_groups;
    const createList = map(infoGroups, (val, key) => {
      const arr1 = [];
      const arr2 = [];
      const arr3 = [];
      let increment = 0;

      map(val[1], (parameter, keyParameter) => {
        const paramHtml = <p key={keyParameter}>{parameter}</p>;

        increment += 1;
        if (increment == 1) {
          arr1.push(paramHtml);
        } else if (increment == 2) {
          arr2.push(paramHtml);
        } else if (increment == 3) {
          arr3.push(paramHtml);
          increment = 0;
        }
      });

      return (<div key={key} className="parameterNewhouses-paramBlock">
        <div className="parameterNewhouses-leftTitle">
          <strong>{val[0]}</strong>
        </div>
        <div className="parameterNewhouses-rightList">
          <div className="parameterNewhouses-rightCol">
            {arr1}
          </div>
          <div className="parameterNewhouses-rightCol">
            {arr2}
          </div>
          <div className="parameterNewhouses-rightCol">
            {arr3}
          </div>
        </div>
        <div  className="clear" />
      </div>);
    });

    return (<GeminiScrollbar className="parameterNewhouses-scroll">
      {createList}
    </GeminiScrollbar>);
  }

  render() {
    const {info} = data.object.info;
    const object = data.object.info;
    const {parameter} = this.props;
    let html;
    const showBlock = classNames({
      hide: !this.state.show
    });

    switch (parameter) {
    case 'title':
      html = this.title(object.info.gp);
      break;
    case 'deadline':
      html = this.deadlineHtml(info);
      break;
    case 'district':
      html = this.district(object.info.district_name);
      break;
    case 'wall':
      html = this.wall(object.info.wall_name);
      break;
    case 'percent':
      html = this.percent(object.info.ready_percent);
      break;
    case 'rating':
      html = this.rating(object);
      break;
    case 'builder':
      html = this.builder(object.info);
      break;
    case 'description':
      html = this.description(object.info.description);
      break;
    case 'actions':
      html = this.action(object.info);
      break;
    case 'parameters':
      html = this.parameters();
      break;
    case 'installment':
      html = this.installment(object.info.installment);
      break;
    default:
      html = null;
    }

    return <div className={showBlock}>{html}</div>;
  }
}

export default NewhousesParameter;
