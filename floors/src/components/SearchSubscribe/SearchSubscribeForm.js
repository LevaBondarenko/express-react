/**
 * Search subscribe widget view component
 *
 */

/**
 * devDependencies
 */
import React, {PropTypes} from 'react'; // eslint-disable-line no-unused-vars
import style from './SearchSubscribeForm.scss';
import withStyles from 'isomorphic-style-loader/lib/withStyles';

import classNames from 'classnames';


const SearchSubscribeForm = (props) => {
  const {subscribe, subscribed} = props;

  return (
    <div className={style.searchSubscribe}>
      <div>
        <i className={classNames({
          fa: true,
          'fa-envelope': !subscribed,
          'fa-check': subscribed
        })} />
        {!subscribed ?
          (<div className={style.searchSubscribe__link}>
            <a onClick={subscribe}>Подписаться на обновления</a>
          </div>) :
          (<div className={style.searchSubscribe__text}>
            Вы подписались
          </div>)
        }
      </div>
    </div>
  );
};

export default withStyles(style)(SearchSubscribeForm);

SearchSubscribeForm.propTypes = {
  props: PropTypes.object,
  subscribe: PropTypes.func,
  subscribed: PropTypes.bool
};
