/**
 * newhouse card template for yandex maps
 *
 * @ver 0.0.1
 * @author o.e.kurgaev@it.etagi.com
 */
import camelize from 'fbjs/lib/camelize';

const cardNewhouse = '<h3 class="newhousecard--body__title">' +
'<a href="/zastr/jk/$[properties.location]">' +
'<b>$[properties.title]</b></a></h3>' +
'<div class="newhousecard--body__imgwrap clearfix">' +
'<a href="/zastr/jk/$[properties.location]">' +
'<img class="img-responsive" src=$[properties.img] />' +
'</a></div>' +
'<p class="newhousecard--body__district">' +
'Район: <b>$[properties.district]</b>' +
'</p>' +
'<p class="newhousecard--body__walls">' +
'Материал стен: <b>$[properties.walls]</b>' +
'</p>' +
'<p class="newhousecard--body__builder">' +
'Застройщик: ' +
'<a href="/zastr/builder/$[properties.builderSlug]">$[properties.builder]</a>' +
'</p>' +
'<div class="newhousecard--body__installment clearfix">' +
'<p class="newhousecard--body__price">' +
'от: <span>$[properties.price]</span>' +
'</p>' +
'<a href="/zastr/jk/$[properties.location]" ' +
'class="newhousecard--body__installment--more">' +
'Подробнее</a>' +
'</div>';

const cardRealty = '<h3 class="newhousecard--body__title">' +
'<a href="$[properties.location]"><b>$[properties.title]</b></a></h3>' +
'<p class="newhousecard--body__adress"><b>$[properties.district]</b></p>' +
'<div class="newhousecard--body__imgwrap clearfix">' +
'<a href="$[properties.location]">' +
'<img class="img-responsive" src=$[properties.img] />' +
'</a></div>' +
'<p class="newhousecard--body__walls">' +
'Площадь: <b>$[properties.square] м<sup>2</sup></b>' +
'</p>' +
'<p class="newhousecard--body__walls colorCrimson">' +
'В ипотеку: <b>$[properties.mortgagePay]</b>' +
'</p>' +
'<div class="newhousecard--body__installment clearfix">' +
'<p class="newhousecard--body__price">' +
'<span>$[properties.price]</span>' +
'</p>' +
'<a href="$[properties.location]" ' +
'class="newhousecard--body__installment--more">' +
'Подробнее</a>' +
'</div>';

const cardLK = `
  <div class="lk--body__adress">
    $[properties.iconDesc]<br/>
    $[properties.iconContent]
  </div>
  <div class="lk--body__submit">
    <button id="submitHandle" class="lk--body__submit-btn">
      Выбрать
    </button>
  </div>
`;

export const templateFactory = (type) => {
  type = camelize(type.replace('_', '-'));

  const templates = {
    flats: cardRealty,
    nhFlats: cardNewhouse,
    lk: cardLK
  };

  return templates[type] ? templates[type] : templates.flats;

};

export default {cardNewhouse, templateFactory};
