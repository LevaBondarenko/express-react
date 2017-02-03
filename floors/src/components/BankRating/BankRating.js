
import React, {Component, PropTypes} from 'react'; // eslint-disable-line no-unused-vars
/**
 * React/Redux entities
 */
import {connect} from 'react-redux';
import ContextType from '../../utils/contextType';

class BankRating extends Component {
  static propTypes = {
    context: PropTypes.shape(ContextType).isRequired,
    id: PropTypes.string,
    rating: PropTypes.number
  };

  static childContextTypes = ContextType;

  getChildContext() {
    return this.props.context;
  }

  constructor(props) {
    super(props);
  }

  render() {
    if (!this.props.rating) {
      return null;
    }

    return (
      <div>
        <div className="bankRatingTitle">Рейтинг банка:</div>
        <div className="bankRatingValue">
          <div className="ratingWrapper-star">
            <div className="ratingWrapper-starActive"
                 style={{width: `${this.props.rating}%`}}
            />
          </div>
        </div>
      </div>
    );
  }
}

BankRating = connect(
  (state) => {
    const obj = state.objects.get('mortgage') ?
      state.objects.get('mortgage').toJS() : {};
    const rating = obj.bank && obj.bank.rating ?
      Math.round(obj.bank.rating * 100) :
      null;

    return {
      rating: rating
    };
  }
)(BankRating);

export default BankRating;
