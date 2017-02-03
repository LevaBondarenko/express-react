/**
  * BuilderPromo Widget
 */
import React, {Component, PropTypes} from 'react'; // eslint-disable-line no-unused-vars
import GeminiScrollbar from 'react-gemini-scrollbar';
import withCondition from '../../decorators/withCondition';

@withCondition()
class BuilderDescription extends Component {
  static propTypes = {
    text: PropTypes.string
  };

  static defaultProps = {
    text: ''
  };

  constructor(props) {
    super(props);
  }

  render() {

    const description = {__html: this.props.text};

    return (
      <div className="container-wrapper-content">
          <div className="row">
              <div className="col-md-9 builder-description-wrapper">
                  <GeminiScrollbar>
                    <div className="builder-description"
                    dangerouslySetInnerHTML={description} />
                  </GeminiScrollbar>
              </div>
          </div>
      </div>
    );
  }
}

export default BuilderDescription;
