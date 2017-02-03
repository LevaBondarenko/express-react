/**
 * RealtorsListM presentational leaf component
 *
 * @ver 0.0.0
 * @author npm generator
 */

import React, {PropTypes} from 'react'; // eslint-disable-line no-unused-vars
import style from './RealtorsListMCardView.scss';
import withStyles from 'isomorphic-style-loader/lib/withStyles';

import Image from '../../shared/Image';


const RealtorsListMCardView = (props) => {
  const {key, realtorInfo} = props;

  return (
    <div className={style.realtorsList__cardWrapper} key={`realtorCard_${key}`}>
      <div className={style.realtorsList__cardImageWrapper}>
        <Image
         className={style.realtorsList__cardImage}
         height={100}
         image={realtorInfo.photo}
         rieltors={true}
         source={2}
         width={100} />
      </div>
      <div className={style.realtorsList__textBlock}>
        <div className={style.realtorsList__textBlock__name}>
          <b>{realtorInfo.lastName}</b> {realtorInfo.nameString}
        </div>
        <a
         className={style.realtorsList__textBlock__phone}
         href={`tel:${realtorInfo.phone}`}>
          <span className={style.realtorsList__textBlock__phone__icon} />
          <span>
            {realtorInfo.phoneString}
          </span>
        </a>
      </div>
    </div>
  );
};

export default withStyles(style)(RealtorsListMCardView);

RealtorsListMCardView.propTypes = {
  key: PropTypes.number,
  realtorInfo: PropTypes.object
};