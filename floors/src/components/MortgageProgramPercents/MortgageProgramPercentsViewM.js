/**
 * Table Row stateless functional component
 *
 * @ver 0.0.1
 * @author a.d.permin@72.etagi.com
 */

/**
 * devDependencies
 */
import React from 'react'; // eslint-disable-line no-unused-vars
import s from './MortgageProgramPercentsViewM.scss';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import {map, size} from 'lodash';
import ContextType from '../../utils/contextType';
/*
* components
*/
import THeadM from './THeadM';
import TRowM from './TRowM';
import CompactDropdown from '../../shared/CompactDropdown';

const MortgageProgramPercentsViewM = (props) => {
  return (
    <CompactDropdown
      collapsed={props.isCollapsed}
      context={props.context}
      title={props.tableTitle}
      titleClassName={s.titleItemContainer}>
      {size(props.percentsGroups) > 0 ? (<div className={s.root}>
        {map(props.percentsGroups, (group, key) => {
          return (<table key={key}>
            <THeadM
              groupName={key}
              yearsData={props.yearsGroups}
              colSpan={props.colSpan} />
            <tbody>
              <TRowM
                key={key}
                groupName={key}
                percentsGroup={group} />
            </tbody>
          </table>);
        })}
      </div>) : <div className={s.noticeError}>{props.noticeError}</div>}
    </CompactDropdown>
  );
};

export default withStyles(s)(MortgageProgramPercentsViewM);

MortgageProgramPercentsViewM.propTypes = {
  context: React.PropTypes.shape(ContextType).isRequired,
  props: React.PropTypes.object,
  tableTitle: React.PropTypes.string,
  yearsGroups: React.PropTypes.array,
  percentsGroups: React.PropTypes.object,
  colSpan: React.PropTypes.number,
  isCollapsed: React.PropTypes.bool,
  noticeError: React.PropTypes.string
};
