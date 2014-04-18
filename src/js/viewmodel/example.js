/**
 * Initializes the example view using jQuery document.ready
 * @author Tim Sommer
 */
$(document).ready(function(){
  "use strict";
  var lf = new GoL.LifeFactory.GetInstance(); //holds a new gameoflife Factory
  
  var newInstance = new GoL.LifeFactory.GetInstance(); //testing out Singleton Pattern. Same instance should be returned
  if(newInstance === lf){
      log.info("New Factory instance is exactly the same as the original instance. Singleton pattern works!");
  } else {
      log.error("New Factory instance is not exactly the same as the original instance. Singleton pattern does not work!");
      throw "Singleton pattern inference";
  }
  
  //Attach EventListeners for creating new GoL instances
  Util.Events.addEventHandler(document.getElementById("default"), "click", function(){ lf.createLife("");} );
  Util.Events.addEventHandler(document.getElementById("red"), "click", function(){lf.createLife("red");} );
  Util.Events.addEventHandler(document.getElementById("green"), "click", function(){ lf.createLife("green");} );
  Util.Events.addEventHandler(document.getElementById("blue"), "click", function(){ lf.createLife("blue");} );
  
  //Attach EventListeners for user interaction
  Util.Events.addEventHandler(document.getElementById("controlLink"), "click", lf.run);
  Util.Events.addEventHandler(document.getElementById("clearLink"), "click", lf.reset );
  Util.Events.addEventHandler(document.getElementById("cellSize"), "change", lf.reset );
  Util.Events.addEventHandler(document.getElementById("cellDelay"), "change", lf.changeDelay );

  // Publishers are in charge of "publishing" notifications about events
  Util.Messenger.publish('logging', 'Publish test form the example view');

  var superToken = 0;
  $("#subscribe").click(function(){
    if(superToken === 0){
      superToken = Util.Messenger.subscribeAll(loggerHandler);
      $("#logger").toggle();
    }else{
      superToken = 0;
    }
  });
});


var counterHandler =  function (topics, data) {
  "use strict";
  log.info("counterHandler invoked: " + data);
  document.getElementById("counter").innerHTML = data;
};


var loggerHandler = function(topics, data){
  "use strict";
  $("#logger").val( $("#logger").val() + "\n" + topics + " -- " + data);
};