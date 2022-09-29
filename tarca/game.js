window.requestAnimationFrame = window.requestAnimationFrame ||
window.mozRequestAnimationFrame ||
window.webkitRequestAnimationFrame ||             
window.msRequestAnimationFrame;





function game(){
c = document.getElementById("canvas");

l_score = document.getElementById("score");
l_time = document.getElementById("time");

hits1 = 0;
targetsGone = 0;
misses =0;
escapes = 0;

time = 0;
countdownStart = 3;
counting = false;

lastFrameTimeMs = 0;

ctx = c.getContext("2d");

document.getElementsByTagName("html")[0].style.position = "fixed";
document.getElementsByTagName("body")[0].style.position = "fixed";
document.getElementsByTagName("html")[0].style.touchAction = "manipulation";
document.getElementsByTagName("body")[0].style.touchAction = "manipulation";
shotsMade = 0;
shotsSign.style.display = "block";

c.setAttribute("height", (Math.max(document.documentElement.clientHeight, window.innerHeight || 0) - c.offsetTop - 20) + "px") ;
var c_width = c.clientWidth;
var c_height = c.clientHeight;
c.setAttribute("height", c_height) ;
c.setAttribute("width", c_width) ;

t1 = new Tarca(0,0,0,0,0, c_width,  c_height, ctx, speedFactor, minSizeFactor, maxSizeFactor, health, []);


t1.countdown(ctx, countdownStart, explosion);

countdownVar= setInterval(
    function(){
        ctx.clearRect(0,0,c.clientWidth,c.clientHeight);
        countdownStart--;
        if(countdownStart<=0){
            playSound(raceStart, 0.45);
            counting= true;
            clearInterval(countdownVar);
            t1.new();
            t1.draw(ctx);
            t1.drawHealth(ctx,t1.r, t1.x, t1.y);
            actif = true;
            mainLoop(performance.now());
        }else{
            t1.countdown(ctx, countdownStart, explosion);
        }
    },1000
)



    switch (gameMode) {
    case "time":
    l_time.childNodes[0].nodeValue = parseFloat(Math.round(gameGoal)).toFixed(1);
    l_score.firstElementChild.style.display = "none";
    break;
    case "score":
    l_time.childNodes[0].nodeValue = parseFloat(Math.round(0)).toFixed(1);
    l_score.firstElementChild.style.display = "inline";
    l_score.firstElementChild.innerText = " /" + Math.round(gameGoal);
    break;

    default:
    break;
    }
    l_score.childNodes[0].nodeValue = score();

    actif = false;

    


    /*ctx = c.getContext("2d");


    document.getElementsByTagName("html")[0].style.position = "fixed";
    document.getElementsByTagName("body")[0].style.position = "fixed";
    document.getElementsByTagName("html")[0].style.touchAction = "manipulation";
    document.getElementsByTagName("body")[0].style.touchAction = "manipulation";
    shotsMade = 0;
    shotsSign.style.display = "block";

    c.setAttribute("height", (Math.max(document.documentElement.clientHeight, window.innerHeight || 0) - c.offsetTop - 20) + "px") ;
    var c_width = c.clientWidth;
    var c_height = c.clientHeight;
    c.setAttribute("height", c_height) ;
    c.setAttribute("width", c_width) ;

    t1 = new Tarca(0,0,0,0,0, c_width,  c_height, ctx, 
    speedFactor, minSizeFactor, maxSizeFactor, health, []);


    t1.new();
    t1.draw(ctx);
    t1.drawHealth(ctx,t1.r, t1.x, t1.y);
setTimeout(function(){
    t1.new();
    t1.draw(ctx);
    t1.drawHealth(ctx,t1.r, t1.x, t1.y);
    actif = true;
    mainLoop(performance.now());
    
}, 3000);*/


if(interval != ""){
clearInterval(interval);
}
interval = setInterval(tempusFugit, 100);
speedChanger = setInterval(function(){t1.newSpeed();}, Math.random()*1500+ 450);
}






function mainLoop(timestamp){
if (actif){
if(lastFrameTimeMs!=0){
if (!t1.recalculate(lastFrameTimeMs, timestamp)){
//escapes += 1;
l_score.childNodes[0].nodeValue = score();
if((gameMode == "score") && (((gameGoal > 0) && (score() >= gameGoal)) || ((gameGoal < 0) && (score() <= gameGoal)))){
gameOver();
}
}
}
lastFrameTimeMs=timestamp;
requestAnimationFrame(mainLoop);
}else{
lastFrameTimeMs = 0;
}

}


function tempusFugit(){
if (actif){
time = time + 1;
if (gameMode == "time"){
if((gameGoal - time/10) <= 0){
gameOver();
}else{
l_time.childNodes[0].nodeValue = parseFloat(Math.round((gameGoal - time/10)*10)/10).toFixed(1);
}
if((gameGoal - time/10) <= 5){
if((time%10 == 0) || (((gameGoal - time/10) <= 2) && (time%5==0))){
document.querySelector('meta[name="theme-color"]').setAttribute("content", "#FF0000");
setTimeout(function(){
document.querySelector('meta[name="theme-color"]').setAttribute("content", "#FFFFFF");
}, 200);
}
}
}else{
l_time.childNodes[0].nodeValue = parseFloat(Math.round(time)/10).toFixed(1);
}

}
}

function score(){
return (hits1-(3*targetsGone));
}

function gameOver(){
actif = false;
isGameOver = true;
clearInterval(interval);
clearInterval(speedChanger);
t1.erase(ctx);
setTimeout(function(){
gameOverDelay = false;
}, 150);
gameOverDelay = true;

showResults();
}

function onCanvasClick(event){
cy = event.pageY - c.offsetTop;
cx = event.pageX - c.offsetLeft;
if(mobile){
cy = event.touches[0].pageY - c.offsetTop;
cx = event.touches[0].pageX - c.offsetLeft;
}

if(counting){
if(actif){
 
}else{
actif = true;
/*mainLoop(performance.now());*/
}


if((t1.clicked(cx, cy) == 1)){
    hits1++;
    t1.erase(ctx);
    t1.new();
    t1.draw(ctx);
    playSound(explosion, 0.8);
    if(shots ==0){
        shotsSign.innerHTML = "∞";
    }else{
        shotsMade = 0;
        shotsSign.innerHTML = shots-shotsMade;
    }
}else if(shotsMade>=shots && shots !=0){
    t1.erase(ctx);
    t1.new();
    t1.draw(ctx);
    if(shots == 0){
        shotsSign.innerHTML = "∞"
    }else{
        shotsMade = 0;
        shotsSign.innerHTML = shots-shotsMade;
        targetsGone++;
    }
}
}

l_score.childNodes[0].nodeValue = score();
if((gameMode == "score") && (((gameGoal > 0) && (score() >= gameGoal)) || ((gameGoal < 0) && (score() <= gameGoal)))){
gameOver();

}
}




function onBodyResize(){
c = document.getElementById("canvas");
c.setAttribute("height", (Math.max(document.documentElement.clientHeight, window.innerHeight || 0) - c.offsetTop - 20) + "px") ;
var c_width = c.clientWidth;
var c_height = c.clientHeight;
c.setAttribute("height", c_height) ;
c.setAttribute("width", c_width) ;

if(t1){
t1.maxx = c_width;
t1.maxy = c_height;
t1.draw(t1.ctx);
}
}