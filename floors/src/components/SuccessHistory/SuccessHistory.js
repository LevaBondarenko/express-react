/**
 * BuilderPromo Widget
 */
import React, {Component, PropTypes} from 'react'; // eslint-disable-line no-unused-vars
import withCondition from '../../decorators/withCondition';
import s from './SuccessHistory.scss';
import ga from '../../utils/ga';

@withCondition()
class SuccessHistory extends Component {

  static propTypes = {
    name: React.PropTypes.string,
    job: React.PropTypes.string,
    description: React.PropTypes.string,
    imagePath: React.PropTypes.string
  }

  constructor(props) {
    super(props);
  }

  componentDidMount() {
    this.removeCss = s._insertCss();
  }

  componentWillUnmount() {
    this.removeCss();
  }

  onHover(event) {
    event.preventDefault();

    setTimeout(() => {
      ga('event', 'card', 'hover', 'job_main_stories');
    },300);
  }

  render() {

    return (
      <div onMouseOver={this.onHover.bind(this)} className={s.mainWrapper}>
        <div className={s.photo}>
          <img src={this.props.imagePath} alt=""/>
        </div>
        <div className={s.name}>
          {this.props.name}
        </div>
        <div className={s.job}>
          {this.props.job}
        </div>
        <div className={s.descriptionWrapper}>
          <div className={s.photo}>
            <img src={this.props.imagePath} alt=""/>
          </div>
          <div className={s.description}>
            {this.props.description}
          </div>
        </div>
      </div>
    );
  }
}

export default SuccessHistory;
