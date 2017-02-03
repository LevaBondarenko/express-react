/**
 * LKConversation component
 *
 * @ver 0.0.1
 * @author denis.zemlyanov@it.etagi.com
 */

/**
 * devDependencies
 */
import React, {Component} from 'react'; // eslint-disable-line no-unused-vars
import classNames from 'classnames';
import {getApiMediaUrl} from '../../utils/mediaHelpers';

/* global data */

class LKManagerSelectItem extends Component {
  static propTypes = {
    manager: React.PropTypes.object,
    selected: React.PropTypes.string,
    onSelect: React.PropTypes.func
  };
  constructor(props) {
    super(props);
    this.state = {
      selected: props.manager.id === props.selected
    };
  }

  componentWillReceiveProps(nextProps) {
    this.setState(() => ({
      selected: nextProps.manager.id === nextProps.selected
    }));
  }

  onSelect() {
    this.props.onSelect(this.props.manager.id);
  }

  render() {
    const {manager} = this.props;
    const {selected} = this.state;
    const {fio} = manager;
    const fioSplited = fio.split(' ');
    const photo = getApiMediaUrl(
      '160160',
      'profile',
      manager.photo ?  manager.photo : 'no_photo',
      data.options.mediaSource);

    return (
      <div
        className={classNames(
          'manager-item',
          {'active': selected}
        )}
        onClick={this.onSelect.bind(this)}>
        <div className='manager-item-title'>
          <span className='manager-item-title-f'>
            {fioSplited[0]}
          </span>
          <span className='manager-item-title-io'>
            {`${fioSplited[1]} ${fioSplited[2]}`}
          </span>
        </div>
        <div className='manager-item-avatar'>
          <img src={photo}/>
        </div>
        <div className='manager-item-position'>
          Специалист<br/>по недвижимости
        </div>
      </div>
    );
  }
}

export default LKManagerSelectItem;
