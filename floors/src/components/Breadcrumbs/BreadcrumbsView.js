/**
 * Breadcrumbs widget view component
 *
 */

/**
 * devDependencies
 */
import React, {PropTypes} from 'react'; // eslint-disable-line no-unused-vars
import style from './BreadcrumbsView.scss';
import withStyles from 'isomorphic-style-loader/lib/withStyles';

import {map, size} from 'lodash';


const BreadcrumbsView = (props) => {
  const {dataList} = props;
  const lastPosition = size(dataList);
  const breadcrumbs = map(dataList, (value, index) => {
    const position = index + 1;
    const href = value.href;
    const name = value.title ? value.title : '';

    return (
      <li
       itemProp='itemListElement'
       key={position}
       itemScope
       itemType='http://schema.org/ListItem'>
        <a itemProp='item' href={href} title={name}>
          <span itemProp='name'>
            {name}
          </span>
        </a>
        <meta itemProp='position' content={position} />
        <span className={style.breadcrumbs__separator} />
      </li>
    );
  });

  breadcrumbs.pop();
  const lastItem = (
    <li
     itemProp='itemListElement'
     key={lastPosition}
     itemScope
     itemType='http://schema.org/ListItem'>
      <span itemProp='item'>
        <span className={style.breadcrumbs__activePage} itemProp='name'>
          {dataList[lastPosition - 1].title}
        </span>
      </span>
      <meta itemProp='position' content={lastPosition} />
    </li>
  );

  breadcrumbs.push(lastItem);

  return (
    <ol
     className={style.breadcrumbs}
     itemScope
     itemType='http://schema.org/BreadcrumbList'>
      {breadcrumbs}
    </ol>
  );
};

export default withStyles(style)(BreadcrumbsView);

BreadcrumbsView.propTypes = {
  dataList: PropTypes.array,
  props: PropTypes.object
};
