/**
 * Searchform layout view container
 *
 * @ver 0.0.1
 * @author o.e.kurgaev@it.etagi.com
 */

/**
 * devDependencies
 */
import React, {Component, PropTypes} from 'react'; // eslint-disable-line no-unused-vars
import GeminiScrollbar from 'react-gemini-scrollbar';
import createFragment from 'react-addons-create-fragment';

class SearchlayoutView extends Component {
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

  getLayout = () => {
    const {layoutType, blockHeight, children} = this.props;

    const layout = layoutType === '1' ?
      createFragment({
        layout: (<GeminiScrollbar style={{height: `${blockHeight}px`}}>
          {children}
          </GeminiScrollbar>)
      }) :
      createFragment({
        layout: children
      });

    return layout;
  }

  render() {
    const layout = this.getLayout();

    return (
      <div>
        {layout}
      </div>
    );
  }
}

export default SearchlayoutView;
