/**
 * ObjectRating widget class
 *
 * @ver 0.0.0
 * @author npm generator
 */

import React, {Component, PropTypes} from 'react';

import emptyFunction from 'fbjs/lib/emptyFunction';
import s from './ObjectRating.scss';

import Rating from '../../shared/Rating';

class ObjectRating extends Component {

  static propTypes = {
    context: PropTypes.shape({
      insertCss: PropTypes.func,
    }),
    mode: PropTypes.string,
    showLink: PropTypes.string,
    detailedClass: PropTypes.string,
    linkClass: PropTypes.string,
    barLength: PropTypes.string
  };

  static childContextTypes = {
    insertCss: PropTypes.func.isRequired
  };

  getChildContext() {
    const context = this.props.context;

    return {
      insertCss: context.insertCss || emptyFunction,
    };
  }

  constructor(props) {
    super(props);
  }

  componentWillMount() {
    const {insertCss} = this.props.context;

    this.removeCss = insertCss(s);
  }
  /*global data */
  render() {
    return (
      <Rating id={data.object.info.object_id}
        content={data.object.info.ratings}
        context={this.props.context}
        detailedClass={this.props.detailedClass}
        condition={data.options.minRating}
        mode={this.props.mode}
        barLength={parseInt(this.props.barLength)}
        showLink={this.props.showLink}
        linkClass={this.props.linkClass}
        show={1} />
    );
  }

}

export default ObjectRating;
