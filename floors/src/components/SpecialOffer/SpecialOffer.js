import React, {Component, PropTypes} from 'react'; // eslint-disable-line no-unused-vars

class SpecialOffer extends Component {
  static propTypes = {
    title: PropTypes.string,
    desc: PropTypes.string,
    persent: PropTypes.string,
    label: PropTypes.string,
    href: PropTypes.string,
    colorDesc: PropTypes.string,
    colorTitle: PropTypes.string,
    colorPersent: PropTypes.string,
    whiteLink: PropTypes.string
  };

  constructor(props) {
    super(props);
  }

  render() {
    const {
      title, desc, persent, label,
      href, colorDesc, colorTitle, colorPersent,
      whiteLink
      } = this.props;

    const labelHtml = label === 'labelHit' ?
      <div className='labelHit'></div> :
      (
        label === 'labelNew' ?
        <div className='labelNew'></div> :
        null
      );
    const styleTitle = colorTitle ? {color: colorTitle} : null;
    const titleHtml = title ?
      <p className='soTitle' style={styleTitle}>{title}</p> : null;
    const stylePersent = colorPersent ? {color: colorPersent} : null;
    const persentHtml = persent ?
      <p className='soPersent' style={stylePersent}>{persent}%</p> : null;
    const styleDesc = colorDesc ? {color: colorDesc} : null;
    const descHtml = desc ?
      <p className='soDesc' style={styleDesc}>{desc}</p> : null;

    const imgHtml = whiteLink ? (
      <div className='soImg'>
        <img src={whiteLink} alt="акции" />
      </div>
    ) : null;
    const textHtml = (
      <div className='soText'>
        {titleHtml}
        {persentHtml}
        {descHtml}
      </div>
    );
    const hrefHtml = href ? (
      <a className='specialOffer' href={href}>
        {labelHtml}
        {imgHtml}
        {textHtml}
      </a>
    ) : (
      <div className='specialOffer'>
        {labelHtml}
        {imgHtml}
        {textHtml}
      </div>
    );

    return imgHtml ? hrefHtml : null;
  }
}

export default SpecialOffer;
