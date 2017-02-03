/**
 * Map widget class
 *
 * @ver 0.0.1
 * @author o.e.kurgaev@it.etagi.com
 */

/*
* devDependencies
*/
import React, {Component} from 'react'; // eslint-disable-line no-unused-vars
/*
* components
*/
import TabList from './Tablist';
/**
 * React/Flux entities
 */
import mss from '../../stores/ModularSearcherStore';

class MapMainModal extends Component {

  constructor(props) {
    super(props);
    this.onChange = this.onChange.bind(this);
  }
  componentWillMount() {
    this.setState(() => ({
      collection: mss.get('collections').district_id,
      selectedData: mss.get('district_id')
    }));
  }

  componentDidMount() {

    mss.onChange(this.onChange);
  }

  componentWillUnmount() {
    mss.offChange(this.onChange);
  }

  onChange() {
    this.setState(() => ({
      collection: mss.get('collections').district_id,
      selectedData: mss.get('district_id')
    }));
  }

  render() {
    const state = this.state;

    return (
      <div className="mainMapWidget--districts">
          <div>
            <div className="mainMapWidget--districts__content">
              <TabList collection={state.collection}
              selectedData={state.selectedData}
              tabType="district_id"/>
            </div>
          </div>
      </div>
    );
  }
}

export default MapMainModal;
