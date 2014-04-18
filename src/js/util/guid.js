/**
 * Util.Guid is a static (virtual) object that can generate GUIDs.
 * @author Tim Sommer
 * @namespace Util
 * @class Guid
 */
Util.Guid = function(){
  "use strict";
  /**
  * Generates part of the Guid
  * @method hexa4
  * @return part of the guid
  */
  var hexa4 = function() {
      return (((1+Math.random())*0x10000)|0).toString(16).substring(1);
  };


  /**
  * Generates the Guid
  * @method generateGuid
  * @return the actual guid
  */
  var generateGuid = function() {
    var guid = (hexa4()+hexa4()+"-"+hexa4()+"-"+hexa4()+"-"+hexa4()+"-"+hexa4()+hexa4()+hexa4()).toUpperCase();
    log.info("guid == " + guid);
    return guid;
  };


  return {
    /**
    * Generates the Guid
    * @method generateGuid
    * @return the actual guid
    */
    generateGuid :
      function(){
        return generateGuid();
      }
  };
}();