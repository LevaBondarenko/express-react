/**
 * MobileObjectInfo widget class
 *
 * @ver 0.0.0
 * @author npm generator
 */

import React, {Component, PropTypes} from 'react';
import {connect} from 'react-redux';
import CompactDropdown from '../../shared/CompactDropdown';
import ContextType from '../../utils/contextType';
import Price from '../../shared/Price';
import PriceUnit from '../../shared/PriceUnit';
import Image from '../../shared/Image';
import s from './MobileServiceCoast.scss';


class MobileServiceCoast extends Component {

  static propTypes = {
    context: PropTypes.shape(ContextType).isRequired,
    fields: PropTypes.array,
    title: PropTypes.string,
    objectInfo: PropTypes.object
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

  getProps() {
    const {fields} = this.props;

    const map = fields.map((fields, key) => {
      const item = (
        <div key={key} className={s.propBlock}>
          <Image className={s.propImg} image={fields.href}/>
          <div className={s.propTitle}>{fields.title}</div>
        </div>
      );

      return item;
    });

    return map;

  }

  render() {
    const {objectInfo} = this.props;
    const title = objectInfo.comission ?
      (objectInfo.comission.search(/%/) != -1 ? (
          <p>Стоимость услуг {objectInfo.comission}</p>
      ) : (
        <p>Стоимость услуг&nbsp;
          <Price price={parseInt(objectInfo.comission)}>
            &nbsp;<PriceUnit/>
          </Price>
        </p>
      )) :
      'Стоимость услуг';

    return (
        <CompactDropdown
          titleClassName={s.titleItemContainer}
          context={this.props.context}
          title={title}>
            <div className={s.root}>
              <h5>{this.props.title}</h5>
              {this.getProps()}
            </div>
        </CompactDropdown>
    );
  }
}

export default connect(
  state => {
    return {
      objectInfo: state.objects.get('object') ?
        state.objects.get('object').toJS().info : {}
    };
  }
)(MobileServiceCoast);
