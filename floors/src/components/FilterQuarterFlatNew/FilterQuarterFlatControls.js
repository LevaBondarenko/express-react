/**
 * devDependencies
 */
import React, {PropTypes} from 'react'; //eslint-disable-line no-unused-vars

const FilterQuarterFlatControls = ({toggleModal, flat}) => {

  return (
    <div className="nh-flat-orders">
      {!flat.dolshik ? (
        <div>
          <button
            className="nh-flat-button-order nh-flat-greybtn"
            data-activekey='review'
            onClick={toggleModal} >
            Записаться на просмотр
          </button>
          <button
            className="nh-flat-button-order nh-flat-greybtn"
            data-activekey='book'
            onClick={toggleModal} >
            Забронировать квартиру
          </button>
        </div>
      ) : (
        <div>
          <p style={{
            display: 'inline-block',
            fontSize: '1.5rem',
            paddingRight: '1rem',
            lineHeight: '3.9rem'
          }}>
            Квартира от собственника
          </p>
          <a
            style={{
              textDecoration: 'none'
            }}
            className="nh-flat-button-order nh-flat-greenbtn"
            href={`/realty/${flat.id}`}
            target='_blank'>
            Подробнее о квартире
          </a>
        </div>
      )}
    </div>
  );
};

FilterQuarterFlatControls.propTypes = {
  toggleModal: PropTypes.func,
  flat: PropTypes.object
};

export default FilterQuarterFlatControls;
