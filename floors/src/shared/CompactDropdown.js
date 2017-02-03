/**
 * Compact Dropdown element class
 *
 * @ver 0.0.0
 * @author denis.zemlyanov@it.etagi.com
 */

import React, {Component, PropTypes} from 'react';
import classNames from 'classnames';
import ContextType from '../utils/contextType';
import s from './CompactDropdown.scss';

class CompactDropdown extends Component {
  static propTypes = {
    context: PropTypes.shape({
      insertCss: PropTypes.func,
    }),
    children: PropTypes.any,
    title: PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.object
    ]),
    className: PropTypes.string,
    titleClassName: PropTypes.string,
    collapsed: PropTypes.bool
  };

  static defaultProps = {
    collapsed: true
  }

  static childContextTypes = ContextType;

  getChildContext() {
    return this.props.context;
  }

  constructor(props) {
    super(props);
    this.state = {
      collapsed: props.collapsed
    };
  }

  componentWillMount() {
    const {insertCss} = this.props.context;

    this.removeCss = insertCss(s);
  }

  componentWillUnmount() {
    this.removeCss();
  }

  toggle = () => {
    this.setState(() => ({collapsed: !this.state.collapsed}));
  }

  render() {
    const {children, className, title, titleClassName} = this.props;
    const {collapsed} = this.state;

    return (
      <div className={classNames(s.root, className)}>
        <div
          className={classNames(titleClassName || '', s.title, {
            [s.collapsed]: collapsed
          })}
          onClick={this.toggle}>
          {title}
        </div>
        <div
          className={classNames({
            [s.childrens]: true,
            [s.collapsed]: collapsed
          })}>
          {children}
        </div>
      </div>
    );
  }
}

export default CompactDropdown;
