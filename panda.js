var loadBar_width = 200,
    loadBar_height = 20,
    initX = 100,
    initY = 200,
    platform_header_tail_width = 102,
    platform_middle_width = 290,
    platform_height = 75,
    platform_space = 50,
    platform_speed = 5,
    panda_speed = 10,
    space_key = 32,
    apple_size = 52;


var canvas,stage,loader,loadBar,panda,
    gameoverTxt,
    platforms = [],
    apples = [];

var gameRunning = false,
    isJump = false,
    lastPlatformSide = 0,
    score = 0;

function init(){
    canvas = document.querySelector("#cv");
    stage = new createjs.Stage(canvas);
    createjs.Ticker.setFPS(25);
    createjs.Ticker.addEventListener("tick",function(e){
        if(!e.paused){
            if(gameRunning){
                runGame();
            }
            stage.update();
        }

    });
    preload();
}

function preload(){
    buildLoadBar();
    loadRes();
}

function buildLoadBar(){
    loadBar = new createjs.Container();
    var loadBorder = new createjs.Shape();
    loadBorder.graphics.beginStroke('#ccc').setStrokeStyle(5).drawRect(0,0,loadBar_width,loadBar_height);
    loadBar.addChild(loadBorder);
    var bar = new  createjs.Shape();
    loadBar.addChild(bar);
    loadBar.x =(canvas.width - loadBar_width)/2;
    loadBar.y = 200;
    stage.addChild(loadBar);
}

function loadRes(){
    loader = new createjs.LoadQueue();
    loader.installPlugin(createjs.Sound);
    loader.loadManifest([
        {src:"panda.png",id:"panda"},
        {src:"platform_l.png",id:'pl'},
        {src:"platform_r.png",id:'pr'},
        {src:"platform_m.png",id:'pm'},
        {src:"apple.png",id:'apple'},
        {src:"apple.mp3",id:"appleMp3"},
        {src:"hit.mp3",id:'hitMp3'},
        {src:"hit_platform.mp3",id:'hitPlatformMp3'},
        {src:"lose.mp3",id:'loseMp3'},

    ]);
    loader.addEventListener("progress",function(e){
       var bar = loadBar.getChildAt(1);
        bar.graphics.beginFill("DeepSkyBlue").drawRect(0,0,loadBar_width* e.progress,loadBar_height);
    });
    loader.addEventListener("complete",function(e){
        stage.removeAllChildren();
        newGame();
    });
}

function newGame(){
    initPanda();
    initPlatform();
    initSounds();
    setControls();
    gameRunning = true;
}

function initPanda(){
    var sheet = {
        "images": ["panda.png"],
        "frames": [
            [2, 2, 79, 93],
            [83, 2, 79, 93],
            [164, 2, 79, 93],
            [245, 2, 79, 93],
            [326, 2, 79, 93],
            [326, 2, 79, 93],
            [407, 2, 79, 93],
            [488, 2, 79, 93],
            [569, 2, 79, 93],
            [650, 2, 79, 93],
            [731, 2, 79, 93],
            [812, 2, 79, 93],
            [893, 2, 79, 93],
            [974, 2, 79, 93],
            [1055, 2, 79, 93],
            [1136, 2, 79, 93],
            [1217, 2, 79, 93],
            [1298, 2, 79, 93],
            [1379, 2, 79, 93],
            [1460, 2, 79, 93],
            [1541, 2, 79, 93],
            [1622, 2, 79, 93],
            [1703, 2, 79, 93],
            [1784, 2, 79, 93]
        ],
        "animations": {
            "run":[15,22],
            "jump":[0,6,"roll"],
            "roll":[7,14,"run"]
        }

    }

    var pandaSheet = new createjs.SpriteSheet(sheet);
    panda = new createjs.Sprite(pandaSheet);
    panda.x = initX;
    panda.y = initY;
    panda.width = 79;
    panda.height = 93;
    panda.gotoAndPlay('run');
    stage.addChild(panda);

}

function initPlatform(){
    for(var i=0;i<3;i++){
        addPlatform();
    }
}

function addPlatform(){
    var platform, j,pl,pr,pm,pmNum,spaceNum,appleNum,apple,appleMargin;
    pl = new createjs.Bitmap(loader.getResult('pl'));
    pr = new createjs.Bitmap(loader.getResult('pr'));
    platform = new createjs.Container();
    pl.x = 0;
    pl.y = 0;
    platform.addChild(pl);
    pmNum = Math.round(Math.random()*2);
    for(j=0;j<pmNum;j++){
        pm  = new createjs.Bitmap(loader.getResult('pm'));
        pm.x = j*platform_middle_width + platform_header_tail_width;
        pm.y = 0;
        platform.addChild(pm);
    }
    pr.x = pmNum*platform_middle_width + platform_header_tail_width;
    pr.y = 0;
    platform.addChild(pr);
    platform.width = pmNum*platform_middle_width + platform_header_tail_width*2;
    platform.height = platform_height;
    if(platforms.length == 0){
        platform.x = 0;
        platform.y = initY + panda.height;
        lastPlatformSide = platform.x+platform.width;
    }else{
        spaceNum = Math.round(Math.random()*2+1);
        platform.x = lastPlatformSide + spaceNum*platform_space;
        platform.y = Math.round(Math.random()*400+100);
        lastPlatformSide = platform.x + platform.width;
    }

    switch(pmNum){
        case 0:
            appleNum = Math.round(Math.random()*2);
            break;
        case 1:
            appleNum = Math.round(Math.random()*3);
            break;
        case 2:
            appleNum = Math.round(Math.random()*4);
            break;
    }
    if(appleNum>0){
        appleMargin = (platform.width + spaceNum*platform_space - appleNum * apple_size)/(appleNum+1)
    }
    for(j = 0;j<appleNum;j++){
        apple = new createjs.Bitmap(loader.getResult('apple'));
        apple.x = platform.x - spaceNum*platform_space + (appleMargin + apple_size)*j + appleMargin;
        apple.y =  platform.y - Math.round(Math.random()*100+50) - apple_size;
        stage.addChild(apple);
        apples.push(apple);
    }

    stage.addChild(platform);
    platforms.push(platform);
}

function initSounds(){
    createjs.Sound.registerSound('apple.mp3', 'bgMusic');
    createjs.Sound.registerSound('hit.mp3', 'hitMp3');
    createjs.Sound.registerSound('hit_platform.mp3', 'hitPlatformMp3');
    createjs.Sound.registerSound('lose.mp3', 'loseMp3');
    createjs.Sound.play('bgMusic');

}

function setControls(){
    window.onkeydown = function(e){
        if(e.keyCode == space_key){
            isJump = true;
            panda.y -= 100;
            panda.gotoAndPlay('jump');
        }
    }
}

function runGame(){
    update();
    render();
}

function update(){
    checkPlatform();
    checkPanda();
    checkApple();
}

function checkPlatform(){
    var i,platform;
    for(i = 0;i<platforms.length;i++){
        platform = platforms[i];
        platform.x = platform.x - platform_speed;
        if( i == 0 && platform.x < - platform.width){
            platform.visible = false;
        }
    }
    lastPlatformSide -= platform_speed;
}

function checkPanda(){
    var i,platform,apple;
    var nextY = panda.y + panda_speed;

    for(i = 0;i<platforms.length;i++){
        platform = platforms[i];
        if(platform.x<=179 && platform.x+platform.width >100){
            break;
        }else{
            platform = null;
        }
    }

    if(platform != null && panda.y <= platform.y - 93 && nextY > platform.y - 93){
        nextY = platform.y - 93;
        if(isJump){
            createjs.Sound.play('hitPlatformMp3');
        }
        isJump = false;
    }else if( platform != null && panda.y > platform.y - 93 && nextY > platform.y - 93){
        console.log(panda.y,platform.y,platform.x);
        gameOver();
    }
    if(nextY > panda.y){
        isJump = true;
    }

    panda.nextY = nextY;

    for(i = 0;i<apples.length;i++){
        apple = apples[i];
        if((panda.y<apple.y && panda.y+panda.height>apple.y) || (apple.y < panda.y && apple.y + apple_size > panda.y)){
             if(panda.x + panda.width > apple.x && panda.x < apple.x+apple_size){
                 createjs.Sound.play('hitMp3');
                 score++;
                 stage.removeChild(apple);
                 apples.splice(i,1);
             }
        }
    }
}

function checkApple(){
    var i,apple;
    console.log(apples.length);
    for(i = 0;i<apples.length;i++){
        apple = apples[i];
        apple.x = apple.x - platform_speed;
        if( i == 0 && apple.x < - apple.width){
            apple.visible = false;
        }
    }
}
function render(){
    panda.y = panda.nextY;
    var platform = platforms[0];
    var apple = apples[0];
    if(!platform.visible){
        stage.removeChild(platform);
        platforms.shift();
        addPlatform();
    }
    if(!apple.visible){
        stage.removeChild(apple);
        apples.shift();
    }

}

function gameOver(){
    createjs.Ticker.setPaused(true);
    gameoverTxt = new createjs.Text('score:'+score,'48px Times','#00ff33');
    gameoverTxt.x = canvas.width/2;
    gameoverTxt.y = 200;
    gameoverTxt.textAlign = 'center';
    stage.addChild(gameoverTxt);
    createjs.Sound.stop('bgMusic');
    createjs.Sound.play('loseMp3');
    stage.update();
}


