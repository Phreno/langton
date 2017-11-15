/*
 * PARAMÉTRAGE
 * */

var constant={
  direction:{
    UP:2,
    RIGHT:1,
    LEFT:-1,
    DOWN:-2
  },
  grid:{
    BOX_SIZE:400,
    CANVAS:'canvas_box',
    CANVAS_CONTEXT:'2d',
    CELL_SIZE:3, // Augmenter la valeur pour agrandir la grille
    PADDING:10,
    STROKE_OFFSET:0.5
  },
  color:{
    GRID:'gainsboro',
    CELL_FOG:'white',
    CELL_CURRENT:'black',
    CELL_FLAGGED:'red',
    CELL_UNFLAGGED:'aqua'
  },
  technical:{
    LOOP_STOP:0,
    MAX_ITERATION:10500 // Nombre d'itérations à effectuer par l'animation.Apparition de l'autoroute vers 10500 étapes
  },
  log:{
    LEVEL:1,            // Monter la valeur pour des logs plus verbeux
    FREQUENCY:100,      // Monter la valeur pour baisser la fréquence des logs dans les boucles
    ERROR:-2,
    WARNING:-1,
    SILENCE:0,
    INFO:1,
    DEBUG:2,
    TRACE:3
  },
  program:{
    STEP_TIMER:10       // Monter la valeur pour ralentir l'animation
  }
};


/*
 * GESTION DES LOGS
 * */


log=function(message, level=constant.log.INFO){
  if(constant.log.LEVEL >= level){
    console.log(message);
  }
};
