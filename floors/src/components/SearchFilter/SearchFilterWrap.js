/**
 * Searchfilter wrap component
 *
 * @ver 0.0.1
 * @author o.e.kurgaev@it.etagi.com
 */

/**
 * devDependencies
 */
import React, {Component, PropTypes} from 'react'; // eslint-disable-line no-unused-vars
import shallowCompare from 'react-addons-shallow-compare';
import createFragment from 'react-addons-create-fragment';
import GeminiScrollbar from 'react-gemini-scrollbar';

class SearchFilterWrap extends Component {
  static propTypes = {
    layoutType: PropTypes.string.isRequired,
    blockHeight: PropTypes.number,
    children: PropTypes.oneOfType([
      PropTypes.element,
      PropTypes.node
    ])
  };

  constructor(props) {
    super(props);
  }

  shouldComponentUpdate(nextProps, nextState) {
    return shallowCompare(this, nextProps, nextState);
  }

  getLayout = () => {
    const {blockHeight, layoutType, children} = this.props;

    return layoutType === '1' ?
      createFragment({
        layout: (<GeminiScrollbar style={{height: `${blockHeight}px`}}>
          <div className='filter--scroll__wrap' >
            {children}
          </div>
        </GeminiScrollbar>)
      }) :
      createFragment({
        layout: (<div className='filter--scroll__wrap' >
          {children}
        </div>)
      });
  };

  render() {
    return (
      <div>
        {this.getLayout()}
      </div>
    );
  }
}

export default SearchFilterWrap;
