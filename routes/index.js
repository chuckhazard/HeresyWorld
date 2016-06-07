var express = require('express');
var router = express.Router();
var path = require('path');
var fs = require('fs');
var gameData = JSON.parse(fs.readFileSync(path.join(__dirname + '/../gamedata.json')));

function renderParsedPage(pageFile, res, params) {
  var html = fs.readFileSync(pageFile)
  params.html = html;
  params.gameData = gameData;
  console.log('RENDER PARSED PAGE');
  res.render('index', params);
}

router.get('/class/:class', function(req, res, next) {
  var cl = gameData.classes[req.params.class];
  var pageFile = path.join(__dirname + '/../parsed/web/' + req.params.class + '.html');
  var title = cl.name;

  var subMenu = [];
  var moveLists = ['starting_moves', 'advanced_moves'];

  for(var i = 0; i < moveLists.length; i++) {
    for(var k in cl[moveLists[i]]) {
      var moveKey = cl[moveLists[i]][k]
      subMenu.push({
        url: '/class/' + cl.key + '#' + moveKey,
        label: gameData.moves[moveKey].name
      })
    }
  }
  
  renderParsedPage(pageFile, res, {title: title, activeClass: req.params.class, subMenu: subMenu});
});

router.get('/moves/:type', function(req, res, next) {
  var list = gameData.misc[req.params.type + '_moves'];
  var pageFile = path.join(__dirname + '/../parsed/web/' + req.params.type + '_moves.html');
  var title = req.params.type.charAt(0).toUpperCase() + req.params.type.slice(1) + ' Moves';

  /*
  var subMenu = [];
  var moveLists = ['starting_moves', 'advanced_moves'];

  for(var i = 0; i < list.length; i++) {
    var move = gameData.moves[list[i]];
    subMenu.push({
      url: '/moves/' + req.params.type + '#' + move.key,
      label: move.name
    }) 
  }
  */

  renderParsedPage(pageFile, res, {activeMoves: req.params.type, title: title});  
});

router.get('/character-creation', function(req, res, next) {
  var pageFile = path.join(__dirname + '/../parsed/web/character_creation.html');
  renderParsedPage(pageFile, res, {title: 'Character Creation'});
});

router.get('/:page', function(req, res, next) {
  var pageFile = path.join(__dirname + '/../parsed/web/' + req.params.page + '.html');
  var title = req.params.page.charAt(0).toUpperCase() + req.params.page.slice(1);
  
  renderParsedPage(pageFile, res, {title: title});
});

router.get('/', function(req, res, next) {
  var pageFile = path.join(__dirname + '/../parsed/web/introduction.html');
  renderParsedPage(pageFile, res, {title: 'Introduction', gameData: {}});
});

module.exports = router;