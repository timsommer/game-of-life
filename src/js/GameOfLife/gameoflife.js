/**
 * GoL.GameOfLife holds the reference to the canvas & organism object and handles events on these objects.
 * @author Tim Sommer
 * @namespace GoL
 * @class GameOfLife
 */
GoL.GameOfLife = function (organism){
  "use strict";
  
  var id = Util.Guid.generateGuid();
  var generationCounter = 0;
  
  var div = document.createElement('div');
      div.style.cssFloat = "left";
  
  var gridCanvas = document.createElement('canvas'); //holds the canvas element which we dynamically add to the root content item.
      gridCanvas.id = "canvas";
      gridCanvas.height = "300";
      gridCanvas.width = "300";
  gridCanvas.style.margin = "1em";
  
  var counter = document.createElement('span');
      counter.id = Math.floor(Math.random() * 10000);
      counter.innerHTML = "Generation counter: ";
  
  var br = document.createElement('br');
  
  
  div.appendChild(gridCanvas);
  div.appendChild(br);
  div.appendChild(counter);
  
  document.getElementById("innerContent").appendChild(div);
  
  var context = drawGrid(); //holds context, retrieved from the canvas element
  update();
  
  
  /**
  * Starts/Stops the cell grid
  * @method start
  */
	function start() {
    if (organism.state === organism.STOPPED) {
      organism.interval = setInterval(function () {
        update();
        generationCounter++;
        Util.Messenger.publish(id, generationCounter);
      }, organism.DELAY);
      organism.state = organism.RUNNING;
    } else {
      window.clearInterval(organism.interval);
      organism.state = organism.STOPPED;
    }
  }

  /**
   * Resets the cell grid and Canvas object
   * @method reset
   * @param {Integer} cellSize: new cellSize value. If empty reset will initialize the grid with a random cellSize
   */
  function reset(cellSize) {
    Util.Events.removeEventHandler(gridCanvas, "click", organism.clickEvent);
    window.clearInterval(organism.interval);
    organism.reset(cellSize);
    organism.state = organism.STOPPED;
    context = drawGrid();
    update();
    
    log.warn('regeneration counter resseted..');
    
    generationCounter = 0;
    Util.Messenger.publish(id, generationCounter);
  }

  /**
   * Changes the delay of the interval
   * @method changeDelay
   * @param {Integer} delay: new delay value
   */
  function changeDelay(delay){
    log.info("delay changed : " + delay);
    organism.DELAY = delay;
    clearInterval(organism.interval);
    organism.interval = setInterval(function() {
      update();
      }, organism.DELAY);
  }

  /**
   * Updates the state and the animations of the cell grid
   * @method update
   */
  function update() {
    organism.updateState();
    organism.updateAnimations(gridCanvas);
  }
  
  /**
  * Draws the cell grid onto the Canvas object
  * @method drawGrid
  * @return {CanvasRenderingContext2D} the context, extracted from the canvas object
  */
  function drawGrid(){
    if (gridCanvas.getContext) {
      //reset the canvas
      gridCanvas.width = gridCanvas.width;
      var context = gridCanvas.getContext('2d');
      var offset = organism.cellSize;
      log.info("cell size= " + offset);
  
      for (var x = 0; x <= organism.X; x += offset) {
        context.moveTo(0.5 + x, 0);
        context.lineTo(0.5 + x, organism.Y);
      }
      
      for (var y = 0; y <= organism.Y; y += offset) {
        context.moveTo(0, 0.5 + y);
        context.lineTo(organism.X, 0.5 + y);
      }
      
      context.strokeStyle = "#fff";
      context.stroke();

      Util.Events.addEventHandler(gridCanvas, "click", organism.clickEvent);
      
      return context;
    } else {
      alert("Canvas is unsupported in your browser.");
    }
  }


  var counterHandler = function (topics, data) {
    counter.innerHTML = "Generation counter: " + data;
  };

  Util.Messenger.subscribe(id, counterHandler);

  //public
  return {
    id: id,

    run: function(){
      start();
    },

    reset: function(cellSize){
      reset(cellSize);
    },

    changeDelay: function(delay){
      changeDelay(delay);
    }
  };
};