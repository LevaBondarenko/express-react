/**
 * Search title widget view component
 *
 */

/**
 * devDependencies
 */
import React, {PropTypes} from 'react'; // eslint-disable-line no-unused-vars
import style from './SearchTitleView.scss';
import withStyles from 'isomorphic-style-loader/lib/withStyles';


const SearchTitleView = (props) => {
  const {header} = props;

  return (
    <div className={style.searchTitle}>
      <h1>
        {header}
      </h1>
    </div>
  );
};

export default withStyles(style)(SearchTitleView);

SearchTitleView.propTypes = {
  header: PropTypes.string,
  props: PropTypes.object
};
