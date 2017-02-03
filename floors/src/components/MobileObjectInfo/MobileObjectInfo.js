/**
 * MobileObjectInfo widget class
 *
 * @ver 0.0.0
 * @author npm generator
 */

import React, {Component, PropTypes} from 'react';
import s from './MobileObjectInfo.scss';
import {connect} from 'react-redux';
import ContextType from '../../utils/contextType';
import CompactDropdown from '../../shared/CompactDropdown';
import JsonParametersBlock from '../../shared/JsonParametersBlock';

class MobileObjectInfo extends Component {

  static propTypes = {
    context: PropTypes.shape(ContextType).isRequired,
    parameters: PropTypes.array,
    objects: PropTypes.array,
    startExpanded: PropTypes.string,
    minRating: PropTypes.number,
    objectInfo: PropTypes.object,
    title: PropTypes.string
  };

  static childContextTypes = ContextType;

  getChildContext() {
    return this.props.context;
  }

  constructor(props) {
    super(props);
  }

  componentWillMount() {
    const {insertCss} = this.props.context;

    this.removeCss = insertCss(s);
  }

  componentWillUnmount() {
    this.removeCss();
  }

  render() {
    return (
      <CompactDropdown
        collapsed={parseInt(this.props.startExpanded) ? true : false}
        context={this.props.context}
        title={this.props.title}
        titleClassName={s.titleItemContainer}>
          <div className={s.root}>
            <JsonParametersBlock
              parameters={this.props.parameters}
              source={this.props.objectInfo} />
          </div>
      </CompactDropdown>
    );
  }
}

export default connect(
  state => {
    const object = state.objects.get('object') ?
      state.objects.get('object').toJS().info :
      {};

    return {
      objectInfo: object.info ? object.info : object
    };
  }
)(MobileObjectInfo);
