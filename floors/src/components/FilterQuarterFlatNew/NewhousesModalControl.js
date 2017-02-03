import React, {PropTypes} from 'react'; //eslint-disable-line no-unused-vars

const NewhousesModalControl = ({toggleModal, linkClassName, text, flat}) => {
  return (
    <span>
    {!flat.dolshik ? (
      <a
        href='#'
        className={linkClassName}
        onClick={toggleModal}>
        {text}
      </a>
    ) : (
      <a
        href={`/realty/${flat.id}`}
        className={linkClassName}
        target='_blank'>
        {text}
      </a>
    )}
    </span>
  );
};

NewhousesModalControl.propTypes = {
  toggleModal: PropTypes.func,
  linkClassName: PropTypes.string,
  text: PropTypes.string,
  flat: PropTypes.object
};

export default NewhousesModalControl;
