/**
 * MortgageProgramConditions widget class
 *
 * @ver 0.0.0
 * @author a.d.permin@72.etagi.com
 */

import React, {Component, PropTypes} from 'react';
import {map, isEmpty, isArray} from 'lodash';

import ContextType from '../../utils/contextType';
import TRow from './TRow';
import Price from '../../shared/Price';
import PriceUnit from '../../shared/PriceUnit';
import s from './MortgageProgramConditions.scss';
import CompactDropdown from '../../shared/CompactDropdown';
/**
 * React/Redux entities
 */
import {connect} from 'react-redux';
import {getMortgagePrograms} from '../../selectors/';

class MortgageProgramConditions extends Component {

  static propTypes = {
    context: React.PropTypes.shape(ContextType).isRequired,
    tableTitle: PropTypes.string,
    isCollapsed: PropTypes.bool,
    parameters: PropTypes.array,
    programData: PropTypes.object,
    isMobile: PropTypes.bool
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

  getPriceProp(key, prop, suffix) {
    return prop > 0 ? (
      <Price key={key} price={prop}>
        &nbsp;
        <PriceUnit/>{suffix}
      </Price>
    ) : (
      <div key={key}>—</div>
    );
  }

  getProps() {
    const {parameters, programData, isMobile} = this.props;

    return parameters.map(param => {
      const fields = param.fields.split(',').map(field => field.trim());
      let isPrice = false;
      const values = fields.map(field => {
        let suffix = '';
        let prefix = '';

        for (const suff in this.suffixes) {
          if (this.suffixes.hasOwnProperty(suff)) {
            if (field.indexOf(suff) !== -1) {
              suffix = this.suffixes[suff];
            }
          }
        }

        for (const pref in this.prefixes) {
          if (this.prefixes.hasOwnProperty(pref)) {
            if (field.indexOf(pref) !== -1) {
              prefix = this.prefixes[pref];
            }
          }
        }

        if (field.indexOf('sum') !== -1 || field === 'min_advance') {
          isPrice = true;
        }

        return programData[field] ? {
          prefix: prefix,
          value: programData[field],
          suffix: suffix
        } : {};
      }).filter(i => {
        return !isEmpty(i);
      });
      const separator = param.separator ? param.separator : ' ';
      let rightCell;

      if (values.length === 0) {
        return null;
      }

      if (values.length === 1 && isArray(values[0].value)) {
        rightCell = map(values[0].value, (data, key) => {
          return (<div key={key}>
              {data}
            </div>);
        });
      } else {
        rightCell = isPrice ? values.map((val, key) => {
          return this.getPriceProp(key, val.value, val.suffix);
        }) : values.map((val) => {
          if (val.value) {
            return `${val.prefix}${val.value}${val.suffix}`;
          }
        }).filter(i => {
          return i !== undefined && i !== null;
        }).join(separator);
      }

      return (
        <TRow
           key={param.fields}
           leftCell={param.title}
           rightCell={rightCell}
           isMobile={isMobile} />
      );
    });
  }

  render() {
    return this.props.isMobile ? (<CompactDropdown
        collapsed={this.props.isCollapsed}
        context={this.props.context}
        title={this.props.tableTitle}
        titleClassName={s.titleItemContainer}>
        <div className={s.root}>
          <table>
            <tbody>
              {this.getProps()}
            </tbody>
          </table>
        </div>
      </CompactDropdown>) :
    (<div className={s.root}>
      <div className={s.tableTitle}>
        {this.props.tableTitle}
      </div>
      <table>
        <tbody>
          {this.getProps()}
        </tbody>
      </table>
    </div>);
  }
}

export default connect(
  state => {
    return {
      programData: getMortgagePrograms(state).program.info
    };
  }
)(MortgageProgramConditions);
