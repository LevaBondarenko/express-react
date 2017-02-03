/**
  * BuilderPromo Widget
 */
import React, {Component, PropTypes} from 'react'; // eslint-disable-line no-unused-vars
import FilterformMap from '../BuilderMap/FilterformMap';
import withCondition from '../../decorators/withCondition';

@withCondition()
class BuilderMap extends Component {
  static propTypes = {
    dataUrl: PropTypes.oneOfType([
      PropTypes.array,
      PropTypes.object
    ]),
    houses: PropTypes.array
  };

  constructor(props) {
    super(props);
    this.state = {
      visible: true,
      openBallonOnInit: false,
      doNotHighlight: false,
      disableScroll: true,
      housesResult: props.houses
    };
  }

  render() {

    const {dataUrl} = this.props;

    return (
      <div className="builderMap">
        <h3>Проекты на карте</h3>
        <FilterformMap {...this.state} dataUrl={dataUrl}/>
      </div>
    );
  }
}

export default BuilderMap;
