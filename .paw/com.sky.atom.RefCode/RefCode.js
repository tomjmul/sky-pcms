
var RefCode = function() {
  
  this.evaluate = function() {
    return this.refCode;
  };

  this.title = function() {
      var atomEmoji = '\uD83C\uDF10';

      if (!this.refCode) {
          return "Ref Code " + atomEmoji;
      }

      return atomEmoji;
  };

  this.text = function() {
    return this.refCode || null;
  };
};

RefCode.inputs = [
    InputField("refCode", "RefCode", "Radio", {"choices":{
    "linear_channel": "linear_channel",
    "regional_channel": "regional_channel",
    "display-option": "display-option",
    "sectionNavigation": "sectionNavigation",
    "vod_channel": "vod_channel",
    "genre": "genre",
    "sectionconfigs": "sectionconfigs",
    "classification": "classification",
    "deal_type": "deal_type",
    "color": "color",
    "thirdparty": "thirdparty",
    "slugprefix": "slugprefix",
    "ott_certificate": "ott_certificate",
    "hardware": "hardware",
    "cms_property_set": "cms_property_set",
    "nowji-section": "nowji",
    "template": "template",
    "group-template": "group-template",
    "catalogue-link-type": "catalogue-link-type",
    "hideTitle": "hideTitle",
    "interaction": "interaction",
    "viewAll": "viewAll",
    "orientation": "orientation",
    "game-genre": "game-genre",
    "hideLogo": "hideLogo",
    "segment": "segment",
    "event-state": "event-state",
    "audioSubtitle":"audioSubtitle",
    "externalFeed":"externalFeed"
    }})
];

RefCode.identifier = "com.sky.atom.RefCode";
RefCode.title = "Atom Ref Code";
registerDynamicValueClass(RefCode);
