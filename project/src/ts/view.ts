import _ = require('lodash');

export interface Attributes {
  [index: string]: any;
}

export function handleAttributes(attributes: Attributes, validate: (name: string, value: string) => boolean): Attributes {
  for(var key in attributes) {
    var attributeValue = attributes[key];
    if(_.isString(attributeValue)) {
      var values = attributes[key].split(' ');
      attributes[key] = values.filter((value:any) => validate(key, value)).join(' ');
    } else {
      attributes[key] = validate(key, attributeValue) ? attributeValue : null;
    }
  }
  return attributes;
}
