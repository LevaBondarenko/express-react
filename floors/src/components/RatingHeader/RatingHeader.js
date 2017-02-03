/**
 * Order widget class
 *
 * @ver 0.0.1
 * @author tatarchuk
 */

import React, {Component, PropTypes} from 'react'; // eslint-disable-line no-unused-vars

/*global data*/
class RatingHeader extends Component {

  constructor(props) {
    super(props);

    this.state = {
      rating: JSON.parse(data.object.info.ratings)
    };
  }

  render() {
    const {rating} = this.state;
    let mainRating = rating && rating[0] ?
      parseFloat(rating[0].value).toFixed(2) : -1;

    mainRating = mainRating > 10 ? 10 : mainRating;
    const mainRatinStr = mainRating >= 0 ?
      mainRating.toString().replace('.', ',').slice(0,-1) : '—';
    const wordRating = mainRating >= 0 && mainRating < 7  ? 'Прочее' : (
      mainRating >= 7 && mainRating < 8 ? 'Хорошо' : (
        mainRating >= 8 && mainRating < 9 ? 'Отлично' : (
          mainRating >= 9 ? 'Превосходно' : 'Не посчитан'
        )
      )
    );
    const mainRatingWidth = mainRating >= 0 ? mainRating * 10 : 0;

    return (
      <div className="ratingWrapper">
        <div className="ratingWrapper-border">
          <div className="ratingWrapper-number">{mainRatinStr}</div>
          <div className="ratingWrapper-word">{wordRating}</div>
        </div>
        <div className="ratingWrapper-star">
          <div className="ratingWrapper-starActive"
               style={{width: `${mainRatingWidth}%`}} />
        </div>
      </div>);
  }
}


export default RatingHeader;
