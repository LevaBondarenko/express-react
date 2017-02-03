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
import {map} from 'lodash';
/**
 *  styles
 */
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import s from './THead.scss';

const THead = ({yearsData, colSpan}) => {
  const years = map(yearsData, data => {
    return (<td key={data} className={s.cell34}>
        {data}
      </td>);
  });

  return (<thead>
    <tr>
      <th rowSpan='2' className={colSpan > 2 ? s.cell6840 : s.cell6850}>
        Первоначальный взнос
      </th>
      <th colSpan={colSpan} className={s.cell34}>
        Срок кредита
      </th>
    </tr>
    <tr>
      {years}
    </tr>
  </thead>);
};

THead.propTypes = {
  yearsData: React.PropTypes.array,
  colSpan: React.PropTypes.number
};

export default withStyles(s)(THead);
