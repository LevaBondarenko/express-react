/**
 * BuilderPromo Widget
 */
import React, {Component, PropTypes} from 'react';
import {declOfNum, phoneCleanup} from 'etagi-helpers';
import Image from '../../shared/Image';
import {phoneFormatter} from '../../utils/Helpers';

/* global data */
class RieltorCloudActive extends Component {
  static propTypes = {
    activeUser: PropTypes.object,
    defaultMotto: PropTypes.string,
    showHref: PropTypes.number,
    onClick: PropTypes.func,
  };

  constructor(props) {
    super(props);
  }

  get imageProps() {
    return {
      image: this.props.activeUser.photo,
      visual: 'profile',
      width: 160,
      height: 160
    };
  }

  get userPhone() {
    return phoneFormatter(
      this.props.activeUser.phone,
      data.options.countryCode.current,
      data.options.countryCode.avail
    );
  }

  render() {
    const {activeUser, defaultMotto, showHref} = this.props;

    return(
      <div className='rieltorCloud_activeRieltor'>
        <div className='rieltorCloud_activeRieltorPhoto'>
          <span
            className='rieltorCloud_objectsCountActive'>
            {`${activeUser.count} `}
            {declOfNum(activeUser.count, ['объект', 'объекта', 'объектов'])}
          </span>
          <a href='#' onClick={this.props.onClick}>
            <Image {...this.imageProps} alt={activeUser.fio}/>
          </a>
        </div>
        <div className='rieltorCloud_activeRieltorFio'>
          {activeUser.fio}
        </div>
        <div className='rieltorCloud_activeRieltorMotto'>
          {activeUser.motto ? activeUser.motto : defaultMotto}
          <div className='triangle-bottomleft'></div>
        </div>
        <div className='rieltorCloud_activeRieltorContacts'>
          <div className='rieltorCloud_activeRieltorContact clearfix'>
            <a className='rieltorCloud_activeRieltorContactValue big phone_number' // eslint-disable-line max-len
              href={`tel:${phoneCleanup(this.userPhone)}`}>
              {this.userPhone}
            </a>
          </div>
          <div className='rieltorCloud_activeRieltorContact clearfix'>
            <div className='rieltorCloud_activeRieltorContactValue'>
              {activeUser.email}
            </div>
          </div>
          {showHref ? (
            <div className='rieltorCloud_activeRieltorContact clearfix'>
              <div className='rieltorCloud_activeRieltorContactValue'>
                <a href={`/agents/?show_person&id=${activeUser.id}`}
                   className='rieltorCloud_allObjectsLink'>
                  посмотреть все объекты
                </a>
              </div>
            </div>
            ) : null}
        </div>
      </div>
    );
  }
}

export default RieltorCloudActive;
