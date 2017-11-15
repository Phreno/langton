var program=(function(board){

  /*
   * CONFIGURATION
   * */
  log('chargement du paramètrage du programme', constant.log.INFO);

  var self={
    /* État de la grille */
    state:{},
    /* Grille sur laquelle on dessine */
    board:board,
    /* Chemin parcouru */
    roadmap:[]
  };

  /***** PRIVATE *****/

  /* Défini la case de départ au milieu de la grille
   * */
  var _setStart=function(){
    log('récupération de la position de départ', constant.log.DEBUG);
    var step={
      column:Math.round(self.board.columns.length/2),
      line:Math.round(self.board.lines.length/2)
    }
    _footPrint(step, constant.color.CELL_FLAGGED, constant.direction.UP);
    log(step, constant.log.TRACE);
    self.start=step;
  };

  /* Récupère l'adresse mémoire de la case depuis sa
   * coordonnée
   * */
  var _getSignatureFromCoordinate=function(coordinate){
    log('calcul de l\'adresse mémoire depuis '+JSON.stringify(coordinate), constant.log.DEBUG);
    //TODO intégrer le calcul directement dans la cellule
    var address=coordinate.column+'.'+coordinate.line;
    log(address, constant.log.TRACE);
    return address;
  };

  /* Ajoute en mémoire le pas courant
   * */
  var _memorize=function(step){
    log('mémorisation du pas en cours '+JSON.stringify(step),constant.log.DEBUG);
    var address=_getSignatureFromCoordinate(step);
    self.state[address]=step;
  };

  var _track=function(cell){
    log('ajout de la cellule ('+JSON.stringify(cell)+') au parcours', constant.log.DEBUG);
    self.roadmap.push(cell);
  };

  /* Est-ce que la case à déjà été empreinté
   * */
  var _hasTrack=function(step){
    log('vérification de l\'existence de la cellule en mémoire',constant.log.DEBUG);
    address=_getSignatureFromCoordinate(step);
    state=typeof(self.state[address]);
    log(state, constant.log.TRACE);
    return 'undefined'.localeCompare(state) !== 0;
  }

  /* Met à jour l'empreinte du pas en cours
   * */
  var _footPrint=function(step, color, direction){
    log('mise à jour de l\'empreinte courante',constant.log.DEBUG);
    step.color=color;
    step.direction=direction;
    log(step, constant.log.TRACE);
  };

  /* Récupère la case de droite de l'étape
   * en référence à la direction
   * */
  var _turnRight=function(step){
    log('calcul le pas à droite de '+JSON.stringify(step), constant.log.DEBUG);
    next={
      line:step.line,
      column:step.column
    };
    switch(step.direction){
      case constant.direction.UP:
      next.column++;
      next.direction=constant.direction.RIGHT;
      break;
      case constant.direction.DOWN:
      next.column--;
      next.direction=constant.direction.LEFT;
      break;
      case constant.direction.LEFT:
      next.line++;
      next.direction=constant.direction.UP;
      break;
      case constant.direction.RIGHT:
      next.line--;
      next.direction=constant.direction.DOWN;
      break;
      default:
      console.error('erreur dans la direction')
    };
    step.color=constant.color.CELL_FLAGGED;

    log(next, constant.log.TRACE);
    return next;
  }

  /* Récupère la case de droite de l'étape
   * en référence à la direction
   * */
  var _turnLeft=function(step){
    log('calcul le pas à gauche de '+JSON.stringify(step), constant.log.DEBUG);
    next={
      line:step.line,
      column:step.column
    };
    switch(step.direction){
      case constant.direction.UP:
      next.column--;
      next.direction=constant.direction.LEFT;
      break;
      case constant.direction.DOWN:
      next.column++;
      next.direction=constant.direction.RIGHT;
      break;
      case constant.direction.LEFT:
      next.line--;
      next.direction=constant.direction.DOWN;
      break;
      case constant.direction.RIGHT:
      next.line++;
      next.direction=constant.direction.UP;
      break;
      default:
      console.error('erreur dans la direction')
    };
    step.color=constant.color.CELL_UNFLAGGED;

    log(next, constant.log.TRACE);
    return next;
  }

  /* Détermine la couleur de la cellule
   * en regardant la mémoire
   * */
  var _setColor=function(cell){
    if(_hasTrack(next)){
      cell.color=self.state[_getSignatureFromCoordinate(next)].color;
    } else {
      cell.color=constant.color.CELL_FOG;
    }
  }
  /***** PUBLIC *****/

  /* Imprime l'empreinte sur la grille
   * */
  self.print=function(cell){
    board.fillCell(cell.column, cell.line, cell.color);
  }

  /* Fais une copie d'une cellule pour la mettre en valeur
   * */
  self.enlight=function(cell){
    board.strokeCell(cell.column, cell.line, constant.color.CELL_CURRENT);
  }

  /* Fais une copie de la cellule pour effacer la mise en valeur
   * */
  self.darken=function(cell){
    board.strokeCell(cell.column, cell.line, constant.color.GRID);
  }


  /* Gestion des tournant
   * */
  self.turn=function(step){
    log('détermine s\'il faut tourner à gauche ou à droite',constant.log.DEBUG);
    var next;
    switch(step.color){
      case constant.color.CELL_FOG:
      next=_turnRight(step);
      break;
      case constant.color.CELL_FLAGGED:
      next=_turnLeft(step);
      break;
      case constant.color.CELL_UNFLAGGED:
      next=_turnRight(step);
      break;
      default:
      console.error('La couleur venue du ciel');
      break;
    }
    _setColor(next);
    return next;
  }

  /* Fonction récursive
   * Trace le parcours de la fourmi
   * */
  self.walk=function(step=self.start){
    log('**** LANCEMENT DE LA ROUTINE ****', constant.log.INFO);
    var forward=function(step){
      var next=self.turn(step);
      self.print(step);
      self.darken(step);
      self.enlight(next);
      _memorize(step);
      _track(step);
      return next;
    }


    var iteration=0;

    var run = setInterval(function(){
      if(constant.technical.MAX_ITERATION===iteration++){
        clearInterval(run);
        log('***** FIN DE L\'ITÉRATION APRÈS '+constant.technical.MAX_ITERATION+' PASSAGES *****', constant.log.INFO)
        log('STATE', constant.log.INFO);
        log(self.state, constant.log.INFO);
        log('ROADMAP', constant.log.INFO);
        log(self.roadmap, constant.log.INFO);
      } else{
        if(0===iteration%constant.log.FREQUENCY){
          log('... '+iteration+' pas effectués', constant.log.INFO);
        }
        step=forward(step);
      }
    }, constant.program.STEP_TIMER);

  };

  /***** CONSTRUCTEUR *****/
  self.init=function(){
    board.drawBoard();
    _setStart();
    self.walk(self.start);
  }

  self.init();
  return self;
})(grid);
