/**
 * Table Row stateless functional component
 *
 * @ver 0.0.1
 * @author a.d.permin@72.etagi.com
 */

/**
 * devDependencies
 */
import React from 'react';
/**
 *  styles
 */
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import s from './TRow.scss';

const TRow = ({leftCell, rightCell, isMobile}) => {
  return (<tr className={isMobile ? s.rowMobile : s.row}>
      <th>{leftCell}</th>
      <td>{rightCell}</td>
    </tr>
  );
};

TRow.propTypes = {
  leftCell: React.PropTypes.string,
  rightCell: React.PropTypes.oneOfType([
    React.PropTypes.object,
    React.PropTypes.string,
    React.PropTypes.array
  ]),
  isMobile: React.PropTypes.bool
};

export default withStyles(s)(TRow);
