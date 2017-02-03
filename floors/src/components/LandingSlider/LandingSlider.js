/**
 * BuilderPromo Widget
 */
import React, {Component, PropTypes} from 'react'; // eslint-disable-line no-unused-vars
import withCondition from '../../decorators/withCondition';
import {map} from 'lodash';

@withCondition()
class LandingSlider extends Component {

  static propTypes = {
    items: PropTypes.array
  }

  constructor(props) {
    super(props);
  }

  componentDidMount() {
    $(document).ready(() => {
      $('.landing_slides').bxSlider({
        speed: 200,
        slideWidth: 680,
        slideMargin: 15,
        loop: false,
        controls: true,
      });
    });
  }

  render() {

    const slides = map(this.props.items, (item, key) => {

      return (
        <li className='feedback_slide' key={key}>
          <img src={item} alt="3D конструктор"/>
        </li>
      );
    });

    return (
      <div className='landingslider'>
        <ul className='landing_slides'>
          {slides}
        </ul>
      </div>
    );
  }
}

export default LandingSlider;
