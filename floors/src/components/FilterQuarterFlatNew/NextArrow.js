import React, {PropTypes} from 'react'; //eslint-disable-line no-unused-vars

const NextArrow = ({...props}) => {
  const className = props.className.replace('slick-next', '');

  return (
    <i
      className={`${className} fa fa-chevron-right`}
      aria-hidden='true'
      onClick={props.onClick} />
  );
};

NextArrow.propTypes = {
  className: PropTypes.string,
  onClick: PropTypes.func
};

export default NextArrow;
