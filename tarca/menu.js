var gameMode = "time";
var gameGoal = 30;
var gameGoal;

var gameMulti = false;
var loseOnMiss = false;

var speedFactor = 100;
var minSizeFactor = 30;
var maxSizeFactor = 230;
var gunShot = new Audio('media/gunShot.mp3');
gunShot.preload = 'auto';
gunShot.load();
var explosion = new Audio('media/sound.mp3');
var marioHello = new Audio("media/mario_hello.mp3");
var raceStart = new Audio("media/raceStart.mp3");

var tries = 0;
var roomName = "";
var roomID="http://tarca.tk/?id=1928374651029384";
var roomIDnum = 0;
var username="";
var leaderboards;

var hits1 = 0;
var targetsGone = 0;
var health = 100;
var shots = 3;
var damage;
var shotsMade =0;
var shotsSign = document.getElementById("shotsLeft");
var countdownVar;
var countdownStart = 4;
var counting = true;



var isGameOver = false;
var gameOverDelay = false;


var time = 0;

var lastFrameTimeMs = 0;

var t1;
var interval="";
var speedChanger;
var drawing;


var mobile = false;

var fromURL = false;
var fromPop = false;




function playSound(type, volume) {
    var click=type.cloneNode();
    click.volume=volume;
    click.play();
  }

function showGame(){
    window.scrollTo(0, 0);
    document.getElementsByTagName("body")[0].style.overflow = "hidden";
    document.getElementById("canvas_div").style.display = "none";
    document.getElementById("top").style.display = "block";
    document.getElementById("canvas").style.display = "flex";
    shotsSign.innerHTML = shots ==0? "∞": shots;

    if( /iPhone|iPad|iPod/i.test(navigator.userAgent) ) {
        document.getElementById("canvas").setAttribute("onmousedown", "");
        document.getElementById("canvas").setAttribute("ontouchstart", "onCanvasClick(event)");
        mobile=true;
      }

    document.querySelector('meta[name="theme-color"]').setAttribute("content", "#FFFFFF");

    
    if(window.location.search.substr(1)==""){
        window.history.pushState({}, "Tarča", [location.protocol, "//", location.host, location.pathname, "?igra"].join(''));
    }
    game();
}

function showResults(){
    document.getElementById("top").style.display = "block";
    document.getElementById("canvas").style.display = "none";
    document.getElementById("canvas_div").style.display = "block";

    document.getElementById("main_menu").style.display = "none";
    document.getElementById("custom_menu").style.display = "none";
    document.getElementById("multipregame_menu").style.display = "none";

    document.getElementById("leaderboard_results").style.display = "none";
    document.getElementById("tries_left_span").style.display = "none";
    document.getElementById("restart_button").style.display = "block";
    document.getElementById("results_menu").style.display = "flex";
    shotsSign.style.display = "none";
    
    document.getElementsByTagName("body")[0].style.overflow = "auto"
    document.getElementsByTagName("html")[0].style.position = "unset";
    document.getElementsByTagName("body")[0].style.position = "unset";
    document.getElementsByTagName("html")[0].style.touchAction = "unset";
    document.getElementsByTagName("body")[0].style.touchAction = "unset";

    var results_h1 = document.getElementById("results_h1");
    switch (gameMode) {
        case "time":
            l_time.innerText = parseFloat(0).toFixed(1);
            results_h1.innerText = score();
            break;
        case "score":
            results_h1.innerText = parseFloat(Math.round(time)/10).toFixed(1) + " s";
            break;
      
        default:
          break;
    }
    
    document.getElementsByTagName("body")[0].style.overflow = "auto";

    if(gameMulti){
        
        loadLeaderboards(roomIDnum);
    }else{
        adjustPosition("results_menu", document.getElementById("top").clientHeight);
    }

}




function showCustomGame(isMultiplayerMenu){
    document.getElementById("custom_m_btn_top").innerHTML = isMultiplayerMenu ? "Make a game" : "Start";
    if(!isMultiplayerMenu){
        document.getElementsByClassName("custom_m_multi")[0].style.display = "none";
        document.getElementsByClassName("custom_m_multi")[1].style.display = "none";
        document.getElementsByClassName("custom_m_multi")[2].style.display = "none";
        document.getElementsByClassName("custom_m_multi")[3].style.display = "none";
        document.getElementsByClassName("custom_m_multi")[4].style.display = "none";
        document.getElementById("custom_m_btn_top").style.marginTop="-30px";
        document.getElementById("custom_m_btn_top").setAttribute("onclick", 'getCustomSettings(false);');
    }else{
        document.getElementsByClassName("custom_m_multi")[0].style.display = "block";
        document.getElementsByClassName("custom_m_multi")[1].style.display = "block";
        document.getElementsByClassName("custom_m_multi")[2].style.display = "block";
        document.getElementsByClassName("custom_m_multi")[3].style.display = "block";
        document.getElementsByClassName("custom_m_multi")[4].style.display = "block";
        document.getElementById("custom_m_btn_top").style.marginTop="10px";
        document.getElementById("custom_m_btn_top").setAttribute("onclick", 'getCustomSettings(true);');
    }
    
    document.getElementById("main_menu").style.display = "none";
    document.getElementById("custom_menu").style.display = "flex";
    adjustPosition("custom_menu", 0)
    window.scrollTo(0, 0);
    
    
}

function checkBoxFunc(id1, id2){
    i1 = document.getElementById(id1);
    i2 = document.getElementById(id2);

    if(!i1.classList.contains("checked")){
        i1.classList.add("checked");
        i2.classList.remove("checked");
    }
}

function getCustomSettings(isMultiplayerMenu){
    i_gameGoal = document.getElementsByName("input_gameGoal")[0];
    i_speed = document.getElementsByName("input_speed")[0];
    i_sizeMin = document.getElementsByName("input_sizeMin")[0];
    i_sizeMax = document.getElementsByName("input_sizeMax")[0];
    i_tries = document.getElementsByName("input_tries")[0];
    i_roomName = document.getElementsByName("input_roomName")[0];
    i_health = document.getElementsByName("input_health")[0];
    i_shots = document.getElementsByName("input_shots")[0];

    
    if(document.getElementById("checkS").classList.contains("checked")){
        gameMode = "time";
    }else{
        gameMode = "score";
    }

    var inputs = [i_gameGoal, i_speed, i_sizeMin, i_sizeMax,i_health,i_shots, i_tries];
    var parameters = [];
    inputs.forEach(function(input){
        var inputValue = input.value;
        if(inputValue == ''){
            inputValue = input.getAttribute("placeholder");
        }
        inputValue = inputValue.replace(/[^0-9.,-]/g, '');
        parameters.push(parseFloat(inputValue));
        input.blur();
    });

    gameGoal = parameters[0];
    speedFactor = parameters[1];
    minSizeFactor = parameters[2];
    maxSizeFactor = parameters[3];
    health  = parameters[4];
    shots = parameters[5];
    tries = parameters[6];
    roomName = (i_roomName.value == '') ? i_roomName.getAttribute("placeholder") : i_roomName.value;

    if(isMultiplayerMenu){
        if(roomName.length>32){
            alert("Ime ne sme biti daljše od 64 znakov.");
        }else{
            if( /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ) {
                setTimeout(saveGame, 200);
            }else{
                saveGame();
            }
        }
        
    }else{
        gameMulti = false;
        if( /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ) {
            setTimeout(showGame, 200);
        }else{
            showGame();
        }
    }
    
}













function loadGame(receivedID){
    var xmlhttp= new XMLHttpRequest();
    xmlhttp.onreadystatechange = function(){
        if(this.readyState==4 && this.status==200){
            var response = this.responseText;
            var rJSON = JSON.parse(response);
            roomName= rJSON.roomName;
            roomID= rJSON.roomURL;
            roomIDnum= rJSON.roomID;
            gameGoal= rJSON.gameGoal;
            gameMode= rJSON.gameMode;
            speedFactor= rJSON.speed;
            minSizeFactor= rJSON.minSize;
            maxSizeFactor= rJSON.maxSize;
            tries= rJSON.tries;
            showMultiplayerPregame();
        }
    };
    //xmlhttp.open("GET", "multi.php/?action=new&gameGoal="+ + "&gameMode="+ + "&speed="+ + "&minSize="+ + "&maxSize="+ + "&tries="+ + "&name="+ + "");
    xmlhttp.open("GET", "multi.php/?action=load&id=" + receivedID);
    xmlhttp.send();
}

function saveGame(receivedID){
    var xmlhttp= new XMLHttpRequest();
    xmlhttp.onreadystatechange = function(){
        if(this.readyState==4 && this.status==200){
            roomID = this.responseText;
            roomIDnum = this.responseText;
            loadGame(roomID);
        }

    };
    xmlhttp.open("GET", "multi.php/?action=new&gameGoal="+ gameGoal+ "&gameMode="+ gameMode + "&speed="+ speedFactor + "&minSize="+ minSizeFactor+ "&maxSize="+ maxSizeFactor+ "&tries="+ tries+ "&name="+ encodeURIComponent(roomName)+ "");

    xmlhttp.send();
}

function loadLeaderboards(receivedID){
    var xmlhttp= new XMLHttpRequest();
    xmlhttp.onreadystatechange = function(){
        if(this.readygetcustom==4 && this.status==200){
            if(this.responseText == 1){
                alert("Prišlo je do napake pri shranjevanju podatkov.");
            }else {
                
                var response = this.responseText;
                var rJSON = JSON.parse(response);
                if(rJSON.error == 2){
                    alert("Število poskusov je bilo preseženo.");
                }
                leaderboards = rJSON.leaderboards;
                drawLeaderboards("leaderboard_results", true, rJSON.triesLeft);
            }
            
        }
    };
    xmlhttp.open("GET", "multi.php/?action=loadLeaderAndSave&id=" + receivedID + "&user=" + encodeURIComponent(username) + "&score=" + ((gameMode=="time")?score():time));
    xmlhttp.send();
}

function loadOnlyLeaderboards(lead_id){
    var xmlhttp= new XMLHttpRequest();
    xmlhttp.onreadystatechange = function(){
        if(this.readyState==4 && this.status==200){
            if(this.responseText == 1){
                alert("Prišlo je do napake.");
            }else {
                
                var response = this.responseText;
                var rJSON = JSON.parse(response);
                leaderboards = rJSON.leaderboards;
                drawLeaderboards("leaderboard_pregame", false, 0);
            }
            
        }
    };
    xmlhttp.open("GET", "multi.php/?action=loadLeader&id=" + roomIDnum + "&user=&score=" + ((gameMode=="time")?score():time));
    xmlhttp.send();
}

function loadUser(){
    var xmlhttp= new XMLHttpRequest();
    xmlhttp.onreadystatechange = function(){
        if(this.readyState==4 && this.status==200){
            var response = this.responseText;
            if(response == 1){
                alert("Izbrano uporabniško ime je za to igro že zasedeno.");
            }else if(response == 2){
                alert("Ta igra ne obstaja.");
            }else{
                gameMulti = true;
                showGame();
            }
        }
    };
    xmlhttp.open("GET", "multi.php/?action=checkUser&id=" + roomIDnum + "&user=" + encodeURIComponent(username));
    xmlhttp.send();

}















function showMultiplayerPregame(){
    document.getElementById("custom_menu").style.display = "none";
    document.getElementById("top").style.display = "none";
    document.getElementById("multipregame_menu").style.display = "flex";

    document.getElementById("pg_roomName").innerHTML = roomName;
    document.getElementById("pg_gameGoal").innerText = gameGoal;
    document.getElementById("pg_gameMode").innerText = (gameMode=="time")?" sekundah":" točkah";
    document.getElementById("pg_speed").innerText = speedFactor + "%";
    document.getElementById("pg_size").innerText = minSizeFactor + "-" + maxSizeFactor + "%";
    document.getElementById("pg_tries").innerText = (tries==0)?"neomejeno":tries;
    document.getElementById("pg_health").innerText = health;
    document.getElementById("pg_shots").innerText = shots;
    document.getElementById("pg_url_address").innerHTML = roomID;
    document.getElementById("pg_url_address").setAttribute("href", roomID);

    if(fromURL){
        window.history.replaceState({}, "Tarča - " +  document.getElementById("pg_roomName").innerText, "?id=" + roomIDnum);
    }else{
        window.history.pushState({}, "Tarča - " +  document.getElementById("pg_roomName").innerText, "?id=" + roomIDnum);
    }
    fromURL=false;
    
    document.title = "Tarča - " +  document.getElementById("pg_roomName").innerText;

    adjustPosition("multipregame_menu", 0)
    window.scrollTo(0, 0);
}

function showMultiGame(){
    i_userName = document.getElementsByName("input_userName")[0];
    username = (i_userName.value == '') ? i_userName.getAttribute("placeholder") : i_userName.value;

    if(username.length>32){
        alert("Ime ne sme biti daljše od 32 znakov.");
    }else{
        loadUser();
    }
        
    
}

function drawLeaderboards(l_id, names, triesLeft){
    if(names==true){
        document.getElementById("lb_url_address").innerText = roomID;
        document.getElementById("lb_url_address").setAttribute("href", roomID);
        document.getElementById("lb_roomName").innerHTML = roomName;
    }
    if(l_id == "leaderboard_pregame"){
        document.getElementById("multipregame_menu").style.top = "0px";
    }

    document.getElementById(l_id + "_inside").innerHTML = "";
    document.getElementById(l_id).style.display = "block";
    
    i = 0;
    prev = "";
    leaderboards.forEach(function(item){
        var l_item = document.createElement("div");
        var l_left = document.createElement("span");

        var l_place = document.createElement("span");
        var l_user = document.createElement("span");
        var l_score = document.createElement("span");
        
        var l_user_text = item[0];
        var l_score_text = (gameMode == "time")? item[1] : (parseFloat(Math.round(item[1])/10).toFixed(1) + " s");
    
        if(prev!==item[1]){
            i++;
        }
        prev = item[1];
        

        l_user.innerHTML = l_user_text;
        l_score.innerHTML = l_score_text;
        l_place.innerHTML = i + ".";
        l_left.appendChild(l_place);
        l_left.appendChild(l_user);
        l_item.appendChild(l_left);
        l_item.appendChild(l_score);

        l_item.classList.add("leaderboard_item");
        l_left.classList.add("lb_left");
        l_place.classList.add("lb_place");
        l_user.classList.add("lb_user");
        l_score.classList.add("lb_score");

        if(item[2] == true){
            l_user.classList.add("big");
            l_score.classList.add("big");
            l_place.classList.add("big");
        }
        document.getElementById(l_id + "_inside").appendChild(l_item);
        
    });

    if(names==true){
        
        if(triesLeft < 0){

        }else if(triesLeft == 0){
            document.getElementById("restart_button").style.display = "none";
        }else{
            document.getElementById("tries_left_span").style.display = "inline";
            document.getElementById("tries_left_span").innerHTML = " (še " + triesLeft + "x)";
        }
        setTimeout(adjustPosition("results_menu", document.getElementById("top").clientHeight), 50);
    }

    if(l_id == "leaderboard_pregame"){
        setTimeout(adjustPosition("multipregame_menu", 0), 50);
    }
}










function adjustPosition(element_id, extra){
    var body = document.body,
    html = document.documentElement;

    var height = Math.max( body.scrollHeight, body.offsetHeight, 
                       html.clientHeight, html.scrollHeight, html.offsetHeight );


     var t_menu = document.getElementById(element_id);

     menu_height = ((height - t_menu.clientHeight - extra)/2 - 35);
     if(menu_height > 15){
      menu_height = ((menu_height - 15)/2) + 15;
     }
     t_menu.style.top = menu_height + "px";
}




function reset(){

    if(interval != ""){
        clearInterval(interval);
    }
    clearInterval(countdownVar);

    window.scrollTo(0, 0);
    document.getElementById("top").style.display = "none";
    document.getElementById("canvas").style.display = "none";
    document.getElementById("canvas_div").style.display = "block";

    document.getElementById("main_menu").style.display = "flex";
    document.getElementById("results_menu").style.display = "none";
    document.getElementById("custom_menu").style.display = "none";
    document.getElementById("multipregame_menu").style.display = "none";
    document.getElementById("leaderboard_results").style.display = "none";

    
    document.getElementsByTagName("body")[0].style.overflow = "auto"
    document.getElementsByTagName("html")[0].style.position = "unset";
    document.getElementsByTagName("body")[0].style.position = "unset";
    document.getElementsByTagName("html")[0].style.touchAction = "unset";
    document.getElementsByTagName("body")[0].style.touchAction = "unset";
    window.scrollTo(0, 0);
    adjustPosition("main_menu", 0)
    
    document.querySelector("meta[name='theme-color']").setAttribute("content", "#FF0000");
    
    speedFactor = 100;
    minSizeFactor = 30;
    maxSizeFactor = 230;
    health = 100;
    shots = 3;

    
    
    if((window.location.search.substr(1)=="igra") && (fromPop == false)){
        window.history.back();
    }else if((window.location.search.substr(1)!="") && (fromPop == false)){
        window.history.pushState({}, "Tarča", [location.protocol, "//", location.host, location.pathname].join(''));
    }
    fromPop = false;
    
    document.title = "Tarča";

}