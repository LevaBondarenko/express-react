/**
 * LK Booking List component
 *
 * @ver 0.0.1
 * @author denis.zemlyanov@it.etagi.com
 */

/**
 * devDependencies
 */
import React, {Component, PropTypes} from 'react'; // eslint-disable-line no-unused-vars
import createFragment from 'react-addons-create-fragment';
import {map, size} from 'lodash';
import withStyles from 'isomorphic-style-loader/lib/withStyles';

import s from './style.scss';
import LKBookingListItem from './LKBookingListItem';

class LKBookingList extends Component {
  static propTypes = {
    onBookingUpdate: PropTypes.func,
    onNeedRefresh: PropTypes.func,
    objects: PropTypes.object,
    similarityParams: PropTypes.array,
    phone: PropTypes.string,
    rentCount: PropTypes.string,
    comission: PropTypes.number,
    timeToPay: PropTypes.number,
    ownerUnavailableTime: PropTypes.number,
    currency: PropTypes.object,
    alreadyPayed: PropTypes.bool,
    notSettled: PropTypes.bool,
    requestSended: PropTypes.bool,
    bookingList: PropTypes.oneOfType([
      PropTypes.array,
      PropTypes.object
    ])
  };

  constructor(props) {
    super(props);
  }

  render() {
    const {
      bookingList, similarityParams, onBookingUpdate, onNeedRefresh, rentCount,
      timeToPay, comission, currency, phone, alreadyPayed, notSettled,
      ownerUnavailableTime, requestSended
    } = this.props;
    let list = map(bookingList, item => {
      const obj = this.props.objects.rent ?
        this.props.objects.rent[item.objectId] : null;

      return obj ? (
        <LKBookingListItem
          key={item.id}
          book={item}
          obj={obj}
          similarityParams={similarityParams}
          comission={comission}
          timeToPay={timeToPay}
          ownerUnavailableTime={ownerUnavailableTime}
          rentCount={rentCount}
          currency={currency}
          phone={phone}
          alreadyPayed={alreadyPayed}
          notSettled={notSettled}
          requestSended={requestSended}
          onBookingUpdate={onBookingUpdate}
          onNeedRefresh={onNeedRefresh}/>
      ) : null;
    });

    list = size(list) > 0 ?
      createFragment({list: list}) :
      createFragment({list: <div/>});

    return (
      <div className={s.lkBodyBookingList}>
        {list}
      </div>
    );
  }
}

export default withStyles(s)(LKBookingList);
