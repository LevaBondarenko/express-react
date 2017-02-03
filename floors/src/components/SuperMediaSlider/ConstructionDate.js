/**
 * ConstructionDate stateless functional component
 *
 * @ver 0.0.1
 * @author a.d.permin@72.etagi.com
 */

/*eslint camelcase: [2, {properties: "never"}]*/
/**
 * devDependencies
 */
import React from 'react';
/**
 *  styles
 */
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import s from './ConstructionDate.scss';

const ConstructionDate = ({date, className}) => {
  const locOption = {'month': 'long'};
  const year = ` ${date.split('-')[0]} г.`;
  const month = new Date(date).toLocaleDateString('ru-RU', locOption)
    .split(' ')[0];

  return (<div className={className}>
      <span className={s.monthName}>{month}</span>
      {year}
    </div>);
};

ConstructionDate.propTypes = {
  className: React.PropTypes.string,
  date: React.PropTypes.string
};

export default withStyles(s)(ConstructionDate);
