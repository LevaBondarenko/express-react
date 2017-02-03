/*
 * Etagi project
 * widget mapping constant
 * o.e.kurgaev@it.etagi.com
 */
/**
 * mobileComponents
 */
import extend from 'extend';
import {canUseDOM} from 'fbjs/lib/ExecutionEnvironment';
export const mobileComponents = {
  AuthPanelMobile: require('./components/AuthPanelMobile'),
  ChangePasswordM: require('./components/ChangePasswordM'),
  CompanyInfo: require('./components/CompanyInfo'),
  FavButton2: require('./components/FavButton2'),
  FilterCheckbox2: require('./components/FilterCheckbox2'),
  FilterGroupSwitcher2: require('./components/FilterGroupSwitcher2'),
  LKFavorites2: require('./components/LKFavorites2/'),
  LKProfile2: require('./components/LKProfile2/'),
  LKRouter: require('./components/LKRouter/'),
  LKSearches2: require('./components/LKSearches2/'),
  MapObjectM: require('./components/MapObjectM/'),
  MobileCTA: require('./components/MobileCTA'),
  MobileHeader: require('./components/MobileHeader'),
  MobileMenu: require('./components/MobileMenu'),
  MobileObjectInfo: require('./components/MobileObjectInfo'),
  MobileObjectPrice: require('./components/MobileObjectPrice'),
  MobileRieltor: require('./components/MobileRieltor'),
  MobileServiceCommission: require('./components/MobileServiceCommission'),
  MobileSearchResult: require('./components/MobileSearchResult'),
  MobileSlider: require('./components/MobileSlider'),
  MortgageAgregator: require('./components/MortgageAgregator'),
  MortgageCalculatorM: require('./components/MortgageCalculatorM'),
  MortgageBroker: require('./components/MortgageBroker'),
  MortgageProgramConditions: require('./components/MortgageProgramConditions'),
  MortgageProgramDescription: require('./components/MortgageProgramDescription'), //eslint-disable-line
  MortgageProgramPercents: require('./components/MortgageProgramPercents'),
  MortgageSearchResult: require('./components/MortgageSearchResult'),
  MSearcherCheckBox2: require('./components/MSearcherCheckBox2/'),
  MSearcherCheckButtons2: require('./components/MSearcherCheckButtons2/'),
  MSearcherOrder: require('./components/MSearcherOrder'),
  MSearcherPaging: require('./components/MSearcherPaging'),
  MSearcherSave2: require('./components/MSearcherSave2'),
  MSearcherSelectM: require('./components/MSearcherSelectM'),
  MSearcherSubmitM: require('./components/MSearcherSubmitM'),
  ObjectRatingM: require('./components/ObjectRatingM'),
  RealtorsListM: require('./components/RealtorsListM'),
  Switcher: require('./components/Switcher'),
  SwitcherOnOff: require('./components/SwitcherOnOff'),
  Text: require('./components/Text/'),
  UAgregator: require('./components/UAgregator'),
  UCheckBox: require('./components/UCheckBox'),
  UCheckButtons: require('./components/UCheckButtons/'),
  UDoubleInput: require('./components/UDoubleInput'),
  UFileUploader: require('./components/UFileUploader'),
  UInput: require('./components/UInput'),
  USelect: require('./components/USelect'),
  USelectM: require('./components/USelectM'),
  USubmit: require('./components/USubmit'),
  UValidator: require('./components/UValidator'),
  UDatePicker: require('./components/UDatePicker')
};
export const clientComponents = canUseDOM ? extend(true, {}, mobileComponents, {
  ClientChat: require('./components/ClientChat')
}) : {};
