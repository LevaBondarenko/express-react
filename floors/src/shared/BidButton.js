/**
 * Shared FavReviewButton Component
 *
 * @ver 0.0.1
 * @author denis.zemlyanov@it.etagi.com
 */

/**
 * devDependencies
 */
import React, {Component} from 'react'; // eslint-disable-line no-unused-vars
import classNames from 'classnames';

/**
 * Bootstrap 3 elements
 */
import Button from 'react-bootstrap/lib/Button';
/**
 * React/Flux entities
 */
import UserActions from '../actions/UserActions';
import userStore from '../stores/UserStore';
import ga from '../utils/ga';

class BidButton extends Component {
  static propTypes = {
    oid: React.PropTypes.number,
    oclass: React.PropTypes.string,
    style: React.PropTypes.object,
    className: React.PropTypes.string
  };
  static defaultProps = {
    style: null,
    className: null
  };
  constructor(props) {
    super(props);
  }

  bid = () => {
    const {oclass, oid} = this.props;

    if(userStore.get('isAuthorized')) {
      UserActions.showBid({class: oclass, id: oid});
      ga('link', 'site_torgi_offer_rate');
    } else {
      UserActions.showLogin();
    }
  }

  render() {
    const {style} = this.props;
    const modeClass = classNames(
      'btn-bid',
      this.props.className
    );

    return (
      <div className={modeClass} style={style}>
        <Button
          title='Предложить свою цену'
          bsStyle='default'
          bsSize='large'
          onClick={this.bid}>
            <i className='fa fa-pencil' />
            <span> Предложить свою цену</span>
        </Button>
      </div>
    );
  }
}

export default BidButton;
