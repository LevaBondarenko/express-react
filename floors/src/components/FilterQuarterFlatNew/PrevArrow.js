import React, {PropTypes} from 'react'; //eslint-disable-line no-unused-vars

const PrevArrow = ({...props}) => {
  const className = props.className.replace('slick-prev', '');

  return (
    <i
      className={`${className} fa fa-chevron-left`}
      aria-hidden='true'
      onClick={props.onClick} />
  );
};

PrevArrow.propTypes = {
  className: PropTypes.string,
  onClick: PropTypes.func
};

export default PrevArrow;
