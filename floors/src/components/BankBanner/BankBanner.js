
import React, {Component, PropTypes} from 'react'; // eslint-disable-line no-unused-vars
import Image from '../../shared/Image';
/**
 * React/Redux entities
 */
import {connect} from 'react-redux';
import ContextType from '../../utils/contextType';

class BankBanner extends Component {
  static propTypes = {
    context: PropTypes.shape(ContextType).isRequired,
    id: PropTypes.string,
    bannerType: PropTypes.string,
    newWindow: PropTypes.number,
    banner: PropTypes.string,
    link: PropTypes.string
  };

  static childContextTypes = ContextType;

  getChildContext() {
    return this.props.context;
  }

  constructor(props) {
    super(props);
  }

  render() {
    const imageProps = {
      image: this.props.banner,
      visual: 'photos',
      width: 'con', // !! круть;)
      height: 'tent'
    };

    if (!this.props.banner) {
      return null;
    }

    return (
      <div className="bankBannerWrapper">
        <a href={this.props.link} target={
          this.props.newWindow ? '_blank' : '_self'
        }>
          <Image {...imageProps}/>
        </a>
      </div>
    );
  }
}

BankBanner = connect(
  (state, ownProps) => {
    const obj = state.objects.get('mortgage') ?
      state.objects.get('mortgage').toJS() : {};
    const hasBanner = !!obj.bankBanners[obj.bank.id];
    const banner = hasBanner ?
      obj.bankBanners[obj.bank.id][ownProps.bannerType] : null;
    const link = hasBanner ?
      obj.bankBanners[obj.bank.id][`${ownProps.bannerType}_href`] : null;

    return {
      banner: banner,
      link: link
    };
  }
)(BankBanner);

export default BankBanner;
