/**
 * BuilderPromoItem Widget
 */
import React, {Component, PropTypes} from 'react';
import {declOfNum} from 'etagi-helpers';
import Image from '../../shared/Image';
import classNames from 'classnames';

class RieltorCloudItem extends Component {
  static propTypes = {
    rieltor: PropTypes.object,
    onClick: PropTypes.func,
    positionRight: PropTypes.bool,
    positionLeft: PropTypes.bool,
    itemKey: PropTypes.number,
  };

  static defaultProps = {
    positionRight: false
  };

  constructor(props) {
    super(props);
  }

  get imageProps() {
    return {
      image: this.props.rieltor.photo,
      visual: 'profile',
      width: 160,
      height: 160
    };
  }

  get photoSizesLeft() {
    return {
      0: 'big',
      1: 'small',
      2: 'medium',
      3: 'small',
      4: 'big',
      5: 'small',
      6: 'small',
      7: 'medium',
      8: 'medium',
      9: 'small',
      10: 'small'
    };
  };

  get photoSizesRight() {
    return {
      0: 'big',
      1: 'big',
      2: 'small',
      3: 'small',
      4: 'medium',
      5: 'medium',
      6: 'small',
      7: 'medium',
      8: 'small',
      9: 'small',
      10: 'small'
    };
  };

  get className() {
    const {itemKey, positionRight} = this.props;
    const sizeClass = positionRight ?
      this.photoSizesRight[itemKey] :
      this.photoSizesLeft[itemKey];

    return classNames({
      'rieltorCloud_rieltor': true,
      [sizeClass]: true,
      [`pos_${itemKey}`]: !positionRight,
      [`pos_right_${itemKey}`]: positionRight,
    });
  }

  render() {
    const {rieltor, onClick} = this.props;

    return (
      <div onClick={onClick} className={this.className}>
        <div className='rieltorCloud_rieltorObjects'>
          {rieltor.count}
        </div>
        <div className='rieltorCloud_rieltorObjectsHover'>
          {`${rieltor.count} `}
          {declOfNum(rieltor.count, ['объект', 'объекта', 'объектов'])}
        </div>
        <div className='rieltorCloud_rieltorPhoto'>
          <Image {...this.imageProps} alt={rieltor.fio}/>
        </div>
      </div>
    );
  }
}

export default RieltorCloudItem;
