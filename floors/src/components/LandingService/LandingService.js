/**
 * BuilderPromo Widget
 */
import React, {Component, PropTypes} from 'react'; // eslint-disable-line no-unused-vars
import withCondition from '../../decorators/withCondition';

@withCondition()
class LandingService extends Component {

  static propTypes = {
    title: React.PropTypes.string,
    subTitle: React.PropTypes.string,
    imagePath: React.PropTypes.string
  }

  constructor(props) {
    super(props);
  }

  render() {

    return (
      <div className='landingservice'>
        <div className="landingservice_image">
          <img src={this.props.imagePath} alt={this.props.title} />
        </div>

        <div className="landingservice_title">
          {this.props.title}
        </div>

        <div className="landingservice_subTitle"
             dangerouslySetInnerHTML={{__html: this.props.subTitle}}
        >
        </div>
      </div>
    );
  }
}

export default LandingService;
