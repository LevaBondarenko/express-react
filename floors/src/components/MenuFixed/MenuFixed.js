/**
 * Created by tatarchuk on 30.04.15.
 */

import React, {Component, PropTypes} from 'react'; // eslint-disable-line no-unused-vars

class MenuFixed extends Component {
  static propTypes = {
    text: PropTypes.node,
    id: PropTypes.string,
    logoImg: PropTypes.string,
    paddingTop: PropTypes.string,
    title: PropTypes.string,
    url: PropTypes.string,
    urlBg: PropTypes.string,
    colorBtn: PropTypes.string,
    colorName: PropTypes.string,
    textBtn: PropTypes.string,
    tornOn: PropTypes.string
  };

  static defaultProps = {
    colorName: '#254654',
    colorBtn: '#72cddc',
    textBtn: 'Подробнее',
    tornOn: 'on'
  };

  constructor(props) {
    super(props);

    this.state = {
      showMenu: false
    };
  }

  showMenu() {
    if(!$('#menu_bg').hasClass('opened')) {
      $('#menuFixed').stop(true).css({left: 272});
      $('#menu_label').stop(true).fadeOut(200);
      $('#menu_bg')
        .stop(true)
        .css({'right': -200})
        .animate({'right': 0}, 500, function() {
          $(this).addClass('opened')
          .find('#menuFixed')
          .stop(true)
          .animate({left: 0}, 300, () => {
            $('#menu_label2').fadeIn(300);
          });
        });
    }
  }

  hideMenu() {
    $('#menu_label2').fadeOut(200);
    $('#menuFixed').stop(true).animate({'left': 272}, 300, () => {
      $('#menu_bg')
        .stop(true).removeClass('opened')
        .animate({'right': -200}, 500);
      $('#menu_label').stop(true).fadeIn(500);
    });
  }

  toggleMenu() {
    const state = this.state;

    state.showMenu = !state.showMenu;

    if (state.showMenu) {
      this.showMenu();
    } else {
      this.hideMenu();
    }

    this.setState(state);
  }

  render() {
    const toggleMenu = this.toggleMenu.bind(this);
    const props = this.props;
    const background = props.urlBg ?
      {backgroundImage: `url(${props.urlBg})`} : {display: 'none'};
    const text = props.text ? {__html: props.text} : {__html: '<br />'};
    const title = props.title ? props.title : '';
    const url = props.url ? props.url : null;
    const logoImg = props.logoImg ? props.logoImg : null;
    const paddingTop = props.paddingTop ?
      {paddingTop: `${props.paddingTop}px`} : {} ;
    const style = {__html: `
      <style>
        .btn-moreYa:hover, .btn-moreYa:focus
          {color:${props.colorBtn};}
      </style>`};

    const colorName = {color: props.colorName};
    const html = (
      <div id="menu_bg" style={background}>
        <span dangerouslySetInnerHTML={style} />
        <div id="menuFixed">
          <table><tbody>
            <tr>
              <td>
                {
                  logoImg ?
                    <img className="menuFixedImg"
                         style={paddingTop}
                         src={logoImg} /> :
                    null
                }
                <p className="menuFixedDescText"
                   dangerouslySetInnerHTML={text} />
                {
                  url ? <a href={url} className="btn-moreYa">
                    {props.textBtn || 'Подробнее'}
                  </a> : null
                }
              </td>
            </tr>
          </tbody></table>
        </div>
        <div className="fixElemName" style={background}>
          <div id="menu_label"
               style={colorName}
               onClick={toggleMenu}>{title}</div>
          <div id="menu_label2" onClick={toggleMenu}></div>
        </div>
      </div>);

    return (props.tornOn === 'on' ? html : null);
  }
}

export default MenuFixed;
