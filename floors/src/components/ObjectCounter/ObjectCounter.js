/**
 * ObjectCounter Widget
 */
import React, {Component} from 'react'; // eslint-disable-line no-unused-vars
import Helpers from '../../utils/Helpers';
import wss from '../../stores/WidgetsStateStore';
import classNames from 'classnames';
import CounterStore from '../../stores/CounterStore';
import CounterActions from '../../actions/CounterActions';

import withCondition from '../../decorators/withCondition';

@withCondition()
class ObjectCounter extends Component {

  constructor(props) {
    super(props);
    this.state = {
      realtyType: 'flats'
    };

    // заполняем хранилище счетчика данными для запроса
    CounterActions.init(this.props);

    // проверяем, заполнено ли хранилище
    CounterActions.check();

  }

  componentWillMount() {
    wss.onChange(this.onChange);
    CounterStore.onChange(this.getCount);
  }

  componentWillUnmount() {
    wss.offChange(this.onChange);
    CounterStore.offChange(this.getCount);
  }

  onChange = () => {
    const type = wss.get('counterStore');

    this.setState(() => ({
      realtyType: type
    }));
  }

  getCount = () => {
    this.setState(() => ({
      total: CounterStore.countData[this.props.id].total,
      byPeriod: CounterStore.countData[this.props.id].byPeriod
    }));
  }

  render() {

    const props = this.props;
    const state = this.state;
    let classes = classNames({
      'objcounter_image': true,
    });
    const chosenType = this.state.realtyType;
    const mainClasses = classNames({
      objcounter: true,
      'objcounter__hidden': props.type !== chosenType && chosenType
    });

    classes += ` ${props.type}`;
    classes += ` ${props.subType}`;

    return (
    <a
      className='objcounter_link'
      href={(props.href && state.total > 0) ?
        props.href : 'javascript:void(0)'}>
      <div className={mainClasses}>
        <div className='objcounter_header'>
          {props.subTypeRu}
        </div>
        <div className={classes}>
          {state.total ? (
            <div className="objcounter_total">
              <div className='objcounter_totalNum'>
                {Helpers.priceFormatter(state.total)}
              </div>
              <div className='objcounter_totalVar'>
                {Helpers
                  .declOfNum(state.total, ['вариант', 'варианта', 'вариантов'])}
              </div>
            </div>
          ) : (
            <div></div>
          )}
          {state.byPeriod ? (
            <div className="objcounter_week">
              +{state.byPeriod} {props.period_ru.toLowerCase()}
            </div>
          ) : (
            <div></div>
          )}
        </div>
      </div>
    </a>
    );
  }
}

ObjectCounter.propTypes = {
  id: React.PropTypes.string,
  type: React.PropTypes.string,
  period: React.PropTypes.string,
  subType: React.PropTypes.string
};

export default ObjectCounter;
