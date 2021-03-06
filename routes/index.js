var express = require('express');
var router = express.Router();
var path = require('path');
var fs = require('fs');
var gameData = JSON.parse(fs.readFileSync(path.join(__dirname + '/../gamedata.json')));

var menuItems = {
  introduction: {
    name: 'Introduction',
    href: '/'
  },
  'character-creation': {
    name: 'Character Creation',
  },
  classes: {
    href: '/classes',
    subMenu: ['assassin', 'investigator', 'warrior']
  },
  assassin: {
    name: 'Assassin',
    href: '/classes/assassin',
    hideFromMenu: true
  },
  investigator: {
    name: 'Investigator',
    href: '/classes/investigator',
    hideFromMenu: true
  },
  warrior: {
    name: 'Warrior',
    href: '/classes/warrior',
    hideFromMenu: true
  }, 
  'basic-moves': {
    name: 'Basic Moves'
  },
  'special-moves': {
    name: 'Special Moves'
  },
  'advanced-moves': {
    name: 'Advanced Moves'
  },
  equipment: {
    subMenu: ['equipment_upgrading']
  },
  'the-gm': {
    name: 'The GM'
  },
  'shattered-hope': {
    href: '/shattered-hope',
    file: 'shattered_hope',
    name: 'Shattered Hope',
    hideFromMenu: true
  },
  'tainted-conflict': {
    href: '/tainted-conflict',
    file: 'tainted_conflict',
    name: 'Tainted Conflict',
    hideFromMenu: true
  },
  missions: {
    href: '/missions',
    name: 'Missions',
    file: 'missions',
    subMenu: ['shattered-hope', 'tainted-conflict']
  },
  equipment_upgrading: {
    href: '/equipment/upgrading',
    name: 'Upgrading',
    file: 'equipment_upgrading',
    hideFromMenu: true
  }  
}
var menuItemsList = []

function getMenuMapList (menuMap, activeItems, level) {
  console.log('activeItems', activeItems);
  level = level || 1
  var list = [];
  for(var i in menuMap) {
    console.log('i', i);
    console.log('menuMap[i]', menuMap[i]);
    menuMap[i].href = menuMap[i].href || '/' + i;
    menuMap[i].name = menuMap[i].name || i.toUpperCase().split("")[0] + i.substr(1).toLowerCase();
    menuMap[i].file = menuMap[i].file || i.replace('-', '_');
    menuMap[i].active = activeItems.indexOf(i) >= 0

    if(typeof menuMap[i].subMenu == 'object') {
      var subMenu = menuMap[i].subMenu.map(function (value) {
        if(typeof value == 'string') {
          var item = menuItems[value]
          return item
        }
        return value;
      });
      menuMap[i].subMenuList = getMenuMapList(subMenu, activeItems, level + 1);
    }

    if(menuMap[i].hideFromMenu && level == 1) {
      continue;
    }    

    list.push(menuMap[i]);
  }

  return list;
}

function renderParsedPage(res, params) {
  var html = fs.readFileSync(path.join(__dirname + '/../parsed/web/' + params.file + '.html'))
  if(!params.hasOwnProperty('activeMenuItem')) {
    params.activeMenuItem = []
  }
  else {
    params.activeMenuItem = typeof params.activeMenuItem == 'object' ? params.activeMenuItem : [params.activeMenuItem]
  }
  params.html = html;
  params.gameData = gameData;
  params.menuItems = menuItems;
  params.menuItemsList = getMenuMapList(menuItems, params.activeMenuItem);
  res.render('index', params);
}

menuItemsList = getMenuMapList(menuItems, []);

router.get('/classes/:class', function(req, res, next) {
  var cl = gameData.classes[req.params.class];
  var title = cl.name;
  renderParsedPage(res, {title: title, activeMenuItem: [req.params.class], file: cl.key});
});

router.get('/moves/:type', function(req, res, next) {
  var list = gameData.misc[req.params.type + '_moves'];
  var title = req.params.type.charAt(0).toUpperCase() + req.params.type.slice(1) + ' Moves';

  var subMenu = [];
  var moveLists = ['starting_moves', 'advanced_moves'];

  for(var i = 0; i < list.length; i++) {
    var move = gameData.moves[list[i]];
    if(move) {
      subMenu.push({
        url: '/moves/' + req.params.type + '#' + move.key,
        label: move.name
      }) ;
    }
  }

  renderParsedPage(res, {title: title, activeMenuItem: req.params.type + '_moves', file: req.params.type + '_moves', subMenu: subMenu});  
});

/**

router.get('/character-creation', function(req, res, next) {
  renderParsedPage(res, {title: 'Character Creation', activeMenuItem: 'character-creation', file: 'character_creation'});
});

router.get('/equipment', function(req, res, next) {
  renderParsedPage(res, {title: 'Equipment', file: 'equipment', activeMenuItem: 'equipment'});
});

router.get('/classes', function(req, res, next) {
  renderParsedPage(res, {title: 'Classes', file: 'classes', activeMenuItem: 'classes'});
});

/**/


router.get('/equipment/upgrading', function(req, res, next) {
  var page = menuItems['equipment_upgrading'];
  renderParsedPage(res, {title: page.name, file: page.file, activeMenuItem: 'equipment_upgrading'});
});

router.get('/:page', function(req, res, next) {
  var page = menuItems[req.params.page];
  renderParsedPage(res, {title: page.name, file: page.file, activeMenuItem: req.params.page});
});


router.get('/', function(req, res, next) {
  renderParsedPage(res, {title: 'Introduction', file: 'introduction', activeMenuItem: 'introduction'});
});

module.exports = router;
