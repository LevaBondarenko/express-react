var Element = {
  extend: function(config){
    var tmp = Object.create(this);
    for (var key in config){
      tmp[key] = config[key];
    }
    return tmp;
  }
};

module.exports = Element;