/**
 * RealtorsListM presentational root component
 *
 * @ver 0.0.0
 * @author npm generator
 */

import React, {PropTypes} from 'react'; // eslint-disable-line no-unused-vars
import style from './RealtorsListMView.scss';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import classNames from 'classnames';

import RealtorsListMCardView from './RealtorsListMCardView';
import UInput from '../UInput/UInput';


const RealtorsListMView = (props) => {
  const {context, realtorsList} = props;
  const cardList = Object.keys(realtorsList).map(key => {
    const val = realtorsList[key];

    const res =
      (<RealtorsListMCardView
       key={key}
       realtorInfo={val} />);

    return res;
  });

  return (
    <div className={style.realtorsList}>
      <div className={style.realtorsList__headerWrapper}>
        <a href='/'>
          <span className={style.realtorsList__arrowIcon} />
        </a>
        <div className={style.realtorsList__header}>
          Риэлторы
        </div>
        <span className={style.realtorsList__dummy} />
      </div>
      <div className={style.realtorsList__inputWrapper} id='realtorsList-form'>
        <UInput
          mountNode='realtorsList-form'
          context={context}
          objectName='realtorsList'
          fieldName='filter'
          className={style.realtorsList__input}
          placeholder='Введите имя, телефон или код риэлтора'
          refreshOn='change' />
      </div>
      <div className={classNames(cardList.length ?
       [style.realtorsList__cardList] :
       [style.realtorsList__emptyResult])}>
        {cardList.length ?
          cardList :
          'Ничего не найдено. Попробуйте изменить параметры фильтра'
        }
      </div>
    </div>
  );
};

export default withStyles(style)(RealtorsListMView);

RealtorsListMView.propTypes = {
  context: PropTypes.object,
  props: PropTypes.object,
  realtorsList: PropTypes.array
};