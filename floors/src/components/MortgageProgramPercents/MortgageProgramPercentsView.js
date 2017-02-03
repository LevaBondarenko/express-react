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
import s from './MortgageProgramPercentsView.scss';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
/*
* components
*/
import THead from './THead';
import TBody from './TBody';

const MortgageProgramPercentsView = (props) => {
  return (
    <div className={s.root}>
      <div className={s.tableTitle}>
        {props.tableTitle}
      </div>
      <table>
        <THead
          yearsData={props.yearsGroups}
          colSpan={props.colSpan} />
        <TBody
          percentsGroups={props.percentsGroups}
          yearsData={props.yearsGroups} />
      </table>
    </div>
  );
};

export default withStyles(s)(MortgageProgramPercentsView);

MortgageProgramPercentsView.propTypes = {
  props: React.PropTypes.object,
  tableTitle: React.PropTypes.string,
  yearsGroups: React.PropTypes.array,
  percentsGroups: React.PropTypes.object,
  colSpan: React.PropTypes.number
};
