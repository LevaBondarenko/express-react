const onJournalDemandClientInfo = (classHouses, type, rooms) => {
  let house;

  switch (classHouses) { // eslint-disable-line
  case 'flats':
    classHouses =  '/realty/';
    switch (type) {
    case 'flat':
      switch (rooms) {
      case 1:
        house = 'однокомнатную квартиру';
        break;
      case 2:
        house = 'двухкомнатную квартиру';
        break;
      case 3:
        house = 'трехкомнатную квартиру';
        break;
      case 4:
        house = 'четырехкомнатную квартиру';
        break;
      case 5:
        house = 'пятикомнатную квартиру';
        break;
      default:
        house = 'квартиру';
        break;
      }
      break;
    case 'malosem':
      house = 'малосемейку';
      break;
    case 'pansion':
      house = 'пансионат';
      break;
    case 'room':
      house = 'комнату';
      break;
    case 'obshaga':
      house = 'общежитие';
      break;
    case 'house':
      house = 'дом';
      break;
    case 'townhouse':
      house = 'таунхаус';
      break;
    case 'garden':
      house = 'дачу';
      break;
    default:
      house = 'квартиру';
      break;
    }
    break;
  default:
  // nothing
  }


  return house;
};

export default onJournalDemandClientInfo;
