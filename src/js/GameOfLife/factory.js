/**
 * GoL.LifeFactory Singleton Factory containing an array of GoL objects and handling events accordingly
 * Self Executing function (cannot be initialized using new statement)
 * @author Tim Sommer
 * @namespace GoL
 * @class LifeFactory
 */
GoL.LifeFactory = (function (){
  "use strict";
   /**
   * Constructor function (cannot be initialized using new -> self executing function)
   * @method getFullNameById
   */
   function LifeFactory(){
     var organismArray = []; //array holding the life objects initialized using the createLife function

    /**
    * Initializes a new GoL & Organism object
    * @method createLife
    * @param {string} type: Color of the cells (black is default when no value is provided)
    */
    this.createLife = function(type){
      var organism = new GoL.Organism(type);
      organismArray.push(new GoL.GameOfLife(organism));
    };

    /**
    * Starts/Stops all Life objects
    * @method run
    */
    this.run = function(){
      for (var i = 0; i<organismArray.length; i++){
        organismArray[i].run();
      }
    };

    /**
    * EventHandler to reset all Life objects
    * @method reset
    * @param {event} event: eventHandler parameter
    */
    this.reset = function(event){
      var value = event.target.value;
      log.info('cellSize changed in factory');
      for (var i = 0; i<organismArray.length; i++){
        organismArray[i].reset(value);
      }
    };

    /**
    * EventHandler for changing the delay for all Life objects
    * @method reset
    * @param {event} event: eventHandler parameter
    */
    this.changeDelay = function(event){
      var value =  event.target.value;
      for (var i = 0; i<organismArray.length; i++){
        organismArray[i].changeDelay(value);
      }
    };
  }

  var instance;  // this is our instance holder

  /**
  * This is an emulation of static variables and methods
  */
  var _static = {
    /**
    * This is a method for getting an instance. it returns a singleton instance of a singleton object
    * @method getInstance
    * @return singleton instance of the LifeFactory object
    */
    GetInstance: function () {
      if (instance === undefined) {
        instance = new LifeFactory(); //create new instance of the LifeFactory object ONLY if the instance has not yet been set.
      }
      return instance;
    }
  };
  
  return _static;
  
})();