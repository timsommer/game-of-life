/**
 * GoL.Organism exposes the grid that contains the cells used to visualize the GoL algorithm
 * @author Tim Sommer
 * @namespace GoL
 * @class Organism
 */
GoL.Organism = function(color){
  "use strict";
  var X = 300, //width of the canvas element, used to calculate total cell count
    Y = 300, //height of the canvas element, used to calculate total cell count
    cellSize = 12,
    width = Math.floor(X / cellSize),
    height = Math.floor(Y / cellSize),
    dead = 0,
    alive = 1,
    delay = 500,
    stopped = 0,
    running = 1,
    minimum = 2, //minimum neighbour-cells a cell needs to stay alive
    maximum = 3, //maximum neighbour-cells a cell needs to stay alive
    spawn = 3, //neighbour-cells a cell needs to become alive
    state = stopped,
    interval = null, //used to store the interval function (timer.tick analogy)
    grid = matrix(height, width), //the grid containing the cells and there state
    cellColor;

  if(color){
    cellColor = color;
  }else{
    cellColor =  "black"; //default black
  }


  /**
   * Creates the cell Matrix
   * @method matrix
   * @param {Integer} m: number of cells Y
   * @param {Integer} n: number of cells X
   */
  function matrix (m, n) {
    var a, i, j, mat = [];
    for (i = 0; i < m; i += 1) {
      a = [];
      for (j = 0; j < n; j += 1) {
        a[j] = 0;
      }
      mat[i] = a;
    }
    return mat;
  }


  /**
   * Resets the cells
   * @method reset
   * @param {Integer} cellSize: new cellSize
   */
  function reset(cellsize){
    if(cellsize && cellsize > 0){
      cellSize = cellsize;
    }
    
    width= Math.floor(X / cellSize);
    height =  Math.floor(Y / cellSize);
    grid = matrix(height, width, 0);
    state = stopped;
    interval = null;
  }


  /**
   * Updates the state of the cells in the matrix
   * @method updateState
   */
  function updateState () {
    var neighbours;
    var nextGenerationGrid = matrix(height, width);
  
    for (var h = 0; h < height; h++) {
      for (var w = 0; w < width; w++) {
        neighbours = calculateNeighbours(h, w);
        if (grid[h][w] !== dead) {
          if ((neighbours >= minimum) &&
            (neighbours <= maximum)) {
            nextGenerationGrid[h][w] = alive;
          }
        } else {
          if (neighbours === spawn) {
            nextGenerationGrid[h][w] = alive;
          }
        }
      }
    }
    copyGrid(nextGenerationGrid, grid);

    /**
    * Calculates total number of neighbouring cells
    * @method calculateNeighbours
    * @param {Integer} y: used to calculate current cell
    * @param {Integer} x: used to calculate current cell
    * @return total number of neighbouring cells
    */
    function calculateNeighbours (y, x) {
      var total = (grid[y][x] !== dead) ? -1 : 0;
      for (var h = -1; h <= 1; h++) {
        for (var w = -1; w <= 1; w++) {
          if (grid
            [(height + (y + h)) % height]
            [(width + (x + w)) % width] !== dead) {
            total++;
          }
        }
      }
      return total;
    }
    
    /**
    * Copies a cell grid
    * @method copyGrid
    * @param {Array} source: Source grid
    * @param {Array} destination: Destination Grid
    */
    function copyGrid (source, destination) {
        for (var h = 0; h < height; h++) {
            destination[h] = source[h].slice(0);
        }
    }
  }


  /**
   * EventHandler invoked when the canvas is clicked
   * @method clickEvent
   * @param: {EventHandler} event
   */
  function clickEvent (event){
    var gridCanvas = event.target;
    var cell = getCursorPosition(event);
    var state = grid[cell.row][cell.column] === alive ? dead : alive;
    grid[cell.row][cell.column] = state;

    updateAnimations(event.target);

    /**
    * Calculate CursorPosition and create cell object
    * @method getCursorPosition
    * @param: {EventHandler} event
    */
    function getCursorPosition(event) {
      var x;
      var y;
      if (event.pageX || event.pageY) {
        x = event.pageX;
        y = event.pageY;
      } else {
        x = event.clientX + document.body.scrollLeft + document.documentElement.scrollLeft;
        y = event.clientY + document.body.scrollTop + document.documentElement.scrollTop;
      }

      x -= gridCanvas.offsetLeft;
      y -= gridCanvas.offsetTop;

      var cell = new GoL.Cell(Math.floor((y - 4) / cellSize),
        Math.floor((x - 2) / cellSize));
      return cell;
    }
  }


  /**
   * Updates the colors of the alive & dead cells
   * @method updateAnimations
   * @param: {HTMLCanvasElement} gridCanvas: Canvas object to perform the objects on
   */
  function updateAnimations(gridCanvas) {
    if(gridCanvas.getContext){
      var context = gridCanvas.getContext('2d');
      for (var h = 0; h < height; h++) {
        for (var w = 0; w < width; w++) {
          if (grid[h][w] === alive) {
            context.fillStyle = cellColor;
          } else {
            context.fillStyle = "#eee";
          }
          context.fillRect(
            w * cellSize +1,
            h * cellSize +1,
            cellSize -1,
            cellSize -1);
        }
      }
    }else {
            alert("Canvas is unsupported in your browser.");
        }
  }


  return{
    cellSize: cellSize,
    state: state,
    interval: interval,
    X: X,
    Y: Y,
    DELAY: delay,
    STOPPED: stopped,
    RUNNING: running,

    updateState: function(){
      updateState();
    },
    clickEvent: function(event){
      clickEvent(event);
    },
    updateAnimations: function(gridCanvas){
      updateAnimations(gridCanvas);
    },
    reset: function(cellSize){
      reset(cellSize);
    }
  };
};
