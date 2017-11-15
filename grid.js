var grid = (function(){

  /*
   * CONFIGURATION
   * */

  log('chargement du paramètrage de la grille', constant.log.DEBUG);
  var self = {
    box:{
      cellSize     : constant.grid.CELL_SIZE,
      height       : constant.grid.BOX_SIZE,
      padding      : constant.grid.PADDING,
      strokeOffset : constant.grid.STROKE_OFFSET,
      width        : constant.grid.BOX_SIZE
    },
    grid:{
      color:constant.grid.GRID_COLOR
    }
  };
  log(self, constant.log.TRACE);
  self.box.canvas = document.getElementById(constant.grid.CANVAS);
  self.box.context = self.box.canvas.getContext(constant.grid.CANVAS_CONTEXT);
  /***** PRIVATE *****/
  //TODO: Faire des modules des parties private

  /*
   * DESSIN
   * */

  log('initialisation du dessinateur', constant.log.DEBUG);
  var _drawer = {
    /* Préparation du dessin
     * */
    openLayer:function(){
      log('ouverture du calque', constant.log.DEBUG);
      self.box.context.beginPath();
    },
    /* Validation du dession
     * */
    closeLayer:function(){
      log('fermeture du calque', constant.log.DEBUG);
      self.box.context.closePath();
    },
    /* Nettoyage du canvas
     * */
    flush:function(){
      log('nettoyage du canvas', constant.log.DEBUG);
      self.box.context.clearRect(0,0,self.box.canvas.width, self.box.canvas.height);
    },

    /* Prépare un segment à partir de bornes (x,y) sur le calque courant
     * */
    segment:function(coordinates){
      log('ajout du segment '+JSON.stringify(coordinates), constant.log.DEBUG);
      self.box.context.moveTo(coordinates.start.x, coordinates.start.y);
      self.box.context.lineTo(coordinates.end.x, coordinates.end.y);
    },

    /* Prépare le tracé d'un rectangle à partir de bornes (x,y) sur le calque courant
     * */
    rectangle:function(coordinates){
      log('ajout du rectangle '+JSON.stringify(coordinates), constant.log.DEBUG);
      self.box.context.rect(
        coordinates.start.x,
        coordinates.start.y,
        coordinates.end.x,
        coordinates.end.y
      );
    },

    /* Dessine les items en attente sur le calque courant
     * */
    ink:function(color, fill=false){
      log('encrage en '+color+' du calque courant', constant.log.DEBUG);
      if(fill){
        self.box.context.fillStyle = color;
        self.box.context.fill();
      } else {
        self.box.context.strokeStyle = color;
        self.box.context.stroke();
      }
    }
  };

  /*
   * GESTIONS DES LIGNES & DES COLUMNS
   * */
  var _build=function(){
    log('construction de la grille', constant.log.DEBUG);
    /* Récupère les coordonnées de références de
     * toutes les lignes de la grilles
     * */
    var setLines = function(){
      log('récupération des coordonnées de références des lignes de la grille', constant.log.DEBUG);
      var limit = constant.technical.MAX_ITERATION;
      var index = 0;
      var lines = [];
      do {
        lines.push(self.getLineCoordinatesFromIndex(index));
      } while (index++*self.box.cellSize<self.box.width && --limit>constant.technical.LOOP_STOP);
      self.lines=lines;
    };

    /* Récupère les coordonnées de références de
     * toutes les colonnes de la table
     * */
    var setColumns = function(){
      log('récupération des coordonnées de références des colonne de la grille', constant.log.DEBUG);
      var limit = constant.technical.MAX_ITERATION;
      var index = 0;
      var columns = [];
      do {
        columns.push(self.getColumnCoordinatesFromIndex(index));
      } while (index++*self.box.cellSize<self.box.height && --limit>constant.technical.LOOP_STOP);
      self.columns = columns;
    };
    setLines();
    setColumns();
  }

  /***** PUBLIC *****/

  /*
   * GESTION DES COORDONNÉES
   * */

  /* Calcule une position en pixel à partir d'un index de ligne
   * ou de colonne
   * */
  self.getOffsetFromIndex = function(index){
    log('calcul de la position à l\'index '+index, constant.log.DEBUG);
    var pixel=self.box.strokeOffset+(index*self.box.cellSize)+self.box.padding;
    log(pixel, constant.log.TRACE);
    return pixel;
  };

  /* Récupère les coordonnées de référence d'une colonne
   * à partir d'un index
   * */
  self.getColumnCoordinatesFromIndex = function(index){
    log('calcul des coordonnées de référence de la colonne '+index, constant.log.DEBUG);
    var xOffset = self.getOffsetFromIndex(index);
    var coordinates={
      start:{
        x:xOffset,
        y:self.box.padding
      },
      end:{
        x:xOffset,
        y:self.box.padding+self.box.height
      }
    };
    log(coordinates, constant.log.TRACE);
    return coordinates;
  };

  /* Récupère les coordonnées de référence d'une ligne
   * à partir d'un index
   * */
  self.getLineCoordinatesFromIndex = function(index){
    log('calcul des coordonnées de référence de la ligne '+index, constant.log.DEBUG);
    var yOffset = self.getOffsetFromIndex(index);
    var coordinates = {
      start:{
        x:self.box.padding,
        y:yOffset
      },
      end:{
        x:self.box.padding+self.box.width,
        y:yOffset
      }
    };
    log(coordinates, constant.log.TRACE);
    return coordinates;
  };

  /* Récupère les coordonnées d'une cellule à partir de ces index
   * en tenant compte de la largeur du tracé de la grille
   * */
  self.getCellCoordinatesFromIndexes = function(column, line){
    log('calcul des coordonnées de référence de la cellule ('+column+', '+line+')', constant.log.DEBUG);
    var xOffset=self.getOffsetFromIndex(column);
    var yOffset=self.getOffsetFromIndex(line);
    var coordinates={
      start:{
        x:xOffset+self.box.strokeOffset,
        y:yOffset+self.box.strokeOffset
      },
      end:{
        x:self.box.cellSize-2*self.box.strokeOffset,
        y:self.box.cellSize-2*self.box.strokeOffset
      }
    };
    log(coordinates, constant.log.TRACE);
    return coordinates;
  };

  /* Récupère les coordonnées du tracé d'une cellule
   * */
  self.getCellStrokeCoordinateFromIndexes = function(column, line){
    log('calcul des coordonnées de référence du tracé de la cellule ('+column+', '+line+')', constant.log.DEBUG);
    var xOffset=self.getOffsetFromIndex(column);
    var yOffset=self.getOffsetFromIndex(line);
    var coordinates={
      start:{
        x:xOffset,
        y:yOffset
      },
      end:{
        x:self.box.cellSize,
        y:self.box.cellSize
      }
    };
    log(coordinates, constant.log.TRACE);
    return coordinates;
  };



  /* Dessine la grille
   * */
  self.drawBoard = function(color=constant.color.GRID){
    log('lancement du dessin de la grille', constant.log.DEBUG);
    _drawer.openLayer();
    _drawer.flush();
    self.lines.forEach(function(line){_drawer.segment(line);});
    self.columns.forEach(function(column){_drawer.segment(column);});
    _drawer.ink(color);
    _drawer.closeLayer();
  };

  /* Rempli une cellule avec une couleur
   * */
  self.fillCell = function(column, line, color=constant.color.CELL_CURRENT){
    log('dessin de la cellule ('+column+', '+line+') en '+color, constant.log.DEBUG);
    var coordinates=self.getCellCoordinatesFromIndexes(column, line);
    _drawer.openLayer();
    _drawer.rectangle(coordinates);
    _drawer.ink(color, true);
    _drawer.closeLayer();
  }

  /* Trace le contour d'une cellule avec une couleur
   * */
  self.strokeCell = function(column, line, color){
    log('contour de la cellule ('+column+', '+line+') en ' + color,constant.log.DEBUG);
    var coordinates=self.getCellStrokeCoordinateFromIndexes(column, line);
    _drawer.openLayer();
    _drawer.rectangle(coordinates);
    _drawer.ink(color);
    _drawer.closeLayer();
  }


  /***** CONSTRUCTEUR *****/
  self.init=function(){
    log('initialisation de la grille', constant.log.INFO);
    _build();
  }

  self.init();

  return self;
})();

