/**
 * Blog layout view container
 *
 * @ver 0.0.1
 * @author a.v.drozdov@nv.etagi.com
 */

/**
 * devDependencies
 */
import React, {Component, PropTypes} from 'react'; // eslint-disable-line no-unused-vars
import createFragment from 'react-addons-create-fragment';

class BlogLayoutView extends Component {
  static propTypes = {
    children: PropTypes.oneOfType([
      PropTypes.element,
      PropTypes.node
    ])
  };

  constructor(props) {
    super(props);
  }

  render() {
    const {children} = this.props;
    const layout = createFragment({
      layout: children
    });

    return (
      <div className="row">
        {layout}
      </div>
    );
  }
}

export default BlogLayoutView;