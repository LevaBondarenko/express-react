import React, {Component, PropTypes} from 'react'; // eslint-disable-line no-unused-vars
import {isElementInViewport} from '../../utils/Helpers';
import {map, filter, each} from 'lodash';
/**
 * React/Flux entities
 */
import FilterQuarterStore from '../../stores/FilterQuarterStore';

class FilterQuarterSectionPager extends Component {
  static propTypes = {
    sectionClick: React.PropTypes.func,
    typeBuild: React.PropTypes.string,
  };

  constructor(props) {
    super(props);
    this.state = {};
  }


  componentWillReceiveProps() {
    this.updatePager();
  }


  updatePager() {
    const sections = document.getElementsByClassName('build');
    const viewPort = document.getElementsByClassName('build-list')[0];
    const visible = map(sections, section => {
      return {
        sectionId: parseInt(section.id.split('_')[1]),
        visible: isElementInViewport(section, viewPort)
      };
    });
    const currents = filter(visible, {visible: true});
    const arr = map(currents, current => current.sectionId);

    this.setState(()=> ({
      currentSections: arr
    }));
  }

  componentDidMount() {
    this.updatePager();
  }

  componentDidUpdate(prevProps) {
    if (parseInt(prevProps.typeBuild) !== parseInt(this.props.typeBuild)) {
      this.updatePager();
    }
  }

  render() {
    const dataBuild = FilterQuarterStore.myHouse;
    const keys = [];
    const {sectionClick} = this.props;

    const currentSections = this.state.currentSections ?
      this.state.currentSections : [1];

    each(dataBuild.sections, (section, keySection) => {
      keys.push(keySection);
    });

    const links = map(keys, sectionNum => {
      let className = 'sectionPager__sectionLink';

      if (currentSections.indexOf(parseInt(sectionNum)) !== -1) {
        className += ' sectionPager__sectionLink_active';
      }

      return (
        <a
          className={className}
          key={sectionNum}
          onClick={sectionClick}
          data-target={`section_${sectionNum}`}
          data-section={sectionNum}>
            {sectionNum}
        </a>
      );
    });

    return (
      <div className='sectionPager'>
        <div className="sectionPager_title">
          ПОДЪЕЗДЫ:&nbsp;
        </div>
        {links}
      </div>
    );
  }

}

export default FilterQuarterSectionPager;
