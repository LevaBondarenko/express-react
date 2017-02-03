/**
 * Switcher component
 *
 * @ver 0.0.1
 * @author denis.zemlyanov@it.etagi.com
 */

/**
 * devDependencies
 */
import React, {Component} from 'react'; // eslint-disable-line no-unused-vars
import createFragment from 'react-addons-create-fragment';
import classNames from 'classnames';
import {map, size} from 'lodash';
/**
 * React/Flux entities
 */
import wss from '../../stores/WidgetsStateStore';
import WidgetsActions from '../../actions/WidgetsActions';

class Notify extends Component {

  constructor(props) {
    super(props);
    const lifeTime = parseInt(props.lifeTime);

    this.onChange = this.onChange.bind(this);
    this.tick = this.tick.bind(this);
    this.remove = this.remove.bind(this);
    this.state = {
      lifeTime: lifeTime && lifeTime > 0 ? lifeTime : 5,
    };
  }

  componentWillMount() {
    wss.onChange(this.onChange);
    WidgetsActions.set('notify', []);
  }

  componentWillUnmount() {
    wss.offChange(this.onChange);
  }

  onChange() {
    if(!this.timer) {
      this.timer = setInterval(() => {this.tick();}, 1000);
    }
  }

  tick() {
    const notifies = wss.get('notify');

    if(notifies.length) {
      for(const i in notifies) {
        if(notifies[i]) {
          if(notifies[i].time === undefined) {
            notifies[i].time = parseInt(this.state.lifeTime);
          } else if(notifies[i].time > 0) {
            notifies[i].time--;
          } else {
            WidgetsActions.del('notify', [notifies[i]]);
          }
        }
      }
    } else {
      this.timer && clearInterval(this.timer);
      this.timer = null;
    }
    this.setState(() => ({
      notifies: wss.get('notify')
    }));
  }

  remove(e) {
    wss.get('notify')[e.target.dataset.notifyId].time = 1;
    this.tick();
  }

  render() {
    const posClass = this.props.position;
    const {id} = this.props;
    const self = this;

    let notifies = map(this.state.notifies, (notify, key) => {
      const className = classNames(
        'notify-item',
        `notify-${notify.type}`,
        {'item-fade': notify.time === 0}
      );

      return(
        <div
          key={`${id}-${key}`}
          className={className}>
          <span
            className='notify-close'
            data-notify-id={key}
            onClick={self.remove}>&times;</span>
          {notify.msg}
        </div>
      );
    });

    notifies = size(notifies) > 0 ?
      createFragment({notifies: notifies}) :
      createFragment({notifies: null});

    return (
      <div className={classNames('notify', 'notify-container', posClass)}>
        {notifies}
      </div>
    );
  }
}

Notify.propTypes = {
  lifeTime: React.PropTypes.string,
  position: React.PropTypes.string,
  id: React.PropTypes.string
};
Notify.defaultProps = {
  lifeTime: '5',
  position: 'top-left'
};

export default Notify;
