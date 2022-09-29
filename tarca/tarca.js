function Tarca(x, y, r, vx, vy, maxx, maxy, ctx, speedF, minSizeF, maxSizeF, health, hits) {
    var damageVisibility = false;
    var healthBottom = true;
    this.x = x;
    this.y = y;
    this.r = r;
    this.vx = vx;
    this.vy = vy;
    this.maxx = maxx;
    this.maxy = maxy;
    this.ctx = ctx;
    this.speedF = speedF;
    this.minSizeF = minSizeF;
    this.maxSizeF = maxSizeF; 
    this.health = health;
    this.hits = hits;
    this.new = function(){
        this.r = ((Math.random()*(this.maxSizeF-this.minSizeF)/2) + this.minSizeF)*(0.5 + 0.5*(this.maxx*this.maxy)/969566);
        this.x = Math.random()*(this.maxx-2*this.r) + this.r;
        this.y = Math.random()*(this.maxy-2*this.r) + this.r;
        this.newSpeed();
        this.health = health;
        this.hits = [];
        healthBottom = true;
    };
    this.newSpeed = function(){
        this.vx = (Math.random()*200 - 100)*(this.maxx/1280)*(this.r/(0.5 + 0.5*(this.maxx*this.maxy)/969566)/100)*(this.speedF/100)*3;
        this.vy = (Math.random()*200 - 100)*(this.maxy/1280)*(this.r/(0.5 + 0.5*(this.maxx*this.maxy)/969566)/100)*(this.speedF/100)*3;
    }


    this.hitsWriter = function(cx, cy){
        var deltaX = this.x - cx;
        var deltaY = this.y - cy;
        var arrLength = this.hits.length;
        this.hits.push([]);
        this.hits[arrLength].push(deltaX);
        this.hits[arrLength].push(deltaY);        
    }

    this.drawDamage = function(ctx, damage, r, cx, cy){
        var red = 175;
        var green = 175;
        if(r<100){
            var size = 35;
        }else {
            var size = r/3;
        }
        ctx.font=size+"px Impact";
        ctx.fillStyle = "rgb(" +(red+(damage-14)*(-2))+"," +(green+(damage-14)*(-1))+", 230)";
        ctx.fillText(damage, cx, cy);
    }


    this.countdown = function(ctx,time, type){
        ctx.font = (this.maxx/7)+"px Arial";
        ctx.fillStyle = "#f00";
        ctx.fillText(time, this.maxx/2.2,this.maxy/1.75);
        playSound(type , 0.45);
    }

    

    this.clicked = function(cx, cy){
        playSound(gunShot, 0.55);
        shotsMade++;
        shotsSign.innerHTML =shots !=0? shots-shotsMade: "∞";
        var x = (Math.sqrt(Math.pow(this.x-cx, 2) + Math.pow(this.y-cy, 2))/this.r);
        damage = Math.round((1/Math.pow(x + 0.833, 5) + 0.151)*75);
        if((Math.pow(this.x - cx, 2) + Math.pow(this.y - cy, 2)) <= Math.pow(this.r, 2)){  
            damageVisibility = true;
            this.hitsWriter(cx, cy); 
            this.health = this.health - damage;
            if(this.health <= 0){
                setTimeout(function(){damageVisibility = false;}, 150);
                this.health = 0;
                return 1;
            }else { 
                setTimeout(function(){damageVisibility = false;}, 300);
                return 0;
            }
        }else{
            return 0;
        }
    };

    this.recalculate = function(oldTime, newTime){
        this.erase(this.ctx);
        this.x = this.x + this.vx*((newTime - oldTime)/1000);
        this.y = this.y + this.vy*((newTime - oldTime)/1000);
        this.draw(this.ctx);
        for(i= 0; i<this.hits.length;i++){
            this.drawHits(this.ctx, this.hits[i][0], this.hits[i][1]);
        }
        this.drawHealth(this.ctx, this.r, this.x, this.y);

        if(damageVisibility){
            this.drawDamage(this.ctx, damage, this.r, cx, cy);
        }
        if(this.x >= this.maxx-this.r){
            do{
                this.newSpeed();
            }while(this.vx>0)
        }else if((this.y >= this.maxy - this.r)){ 
            do{
                this.newSpeed();
            }while(this.vy>0)
        }else if(this.x <= 0+this.r){ 
            do{
                this.newSpeed();
            }while(this.vx<0)
        }else if((this.y <= 0+this.r)){  
            do{
                this.newSpeed();
            }while(this.vy<0)
        }else{
            return true;
        }
    };
    this.erase = function(ctx){
        ctx.beginPath();
        ctx.clearRect(0,0,c.clientWidth,c.clientHeight);
        ctx.fillStyle = "rgb(255, 255, 255)";
        ctx.fill();
        ctx.lineWidth = 0;
        ctx.strokeStyle = "white";
        ctx.stroke();
    }
    this.draw = function(ctx){
        ctx.beginPath();
        ctx.arc(this.x,this.y,this.r,0,2*Math.PI);
        ctx.fillStyle = "red";
        ctx.fill();
        ctx.lineWidth = 0;
        ctx.strokeStyle = "red";
        ctx.stroke();

        ctx.beginPath();
        ctx.arc(this.x,this.y,this.r*4/5,0,2*Math.PI);
        ctx.fillStyle = "white";
        ctx.fill();
        ctx.lineWidth = 0;
        ctx.strokeStyle = "red";
        ctx.stroke();

        ctx.beginPath();
        ctx.arc(this.x,this.y,this.r*3/5,0,2*Math.PI);
        ctx.fillStyle = "red";
        ctx.fill();
        ctx.lineWidth = 0;
        ctx.strokeStyle = "red";
        ctx.stroke();

        ctx.beginPath();
        ctx.arc(this.x,this.y,this.r*2/5,0,2*Math.PI);
        ctx.fillStyle = "white";
        ctx.fill();
        ctx.lineWidth = 0;
        ctx.strokeStyle = "red";
        ctx.stroke();
    
        ctx.beginPath();
        ctx.arc(this.x,this.y,this.r/5,0,2*Math.PI);
        ctx.fillStyle = "red";
        ctx.fill();
        ctx.lineWidth = 0;
        ctx.strokeStyle = "red";
        ctx.stroke();
    }

    this.drawHits = function(ctx, deltaX, deltaY){
        var radius = this.r / 23;
        var blackRad = radius*0.4;
        var twelfe = Math.PI/6;
        var stozec = 0.75*radius;
        var hitX = this.x -deltaX;
        var hitY = this.y - deltaY;

        ctx.beginPath();
        ctx.arc(hitX,hitY, radius, 0, 2*Math.PI);
        ctx.fillStyle = "#C8C4C3";
        ctx.fill();
        ctx.lineWidth = 0;
        ctx.strokeStyle = "#C8C4C3";
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(hitX,hitY);
        ctx.arc(hitX,hitY,stozec,0,twelfe);
        ctx.lineTo(hitX,hitY);
        ctx.fillStyle = "#7B7371";
        ctx.fill();
        ctx.lineWidth = 0;
        ctx.strokeStyle = "#7B7371";
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(hitX,hitY);
        ctx.arc(hitX,hitY,stozec,2*twelfe,3*twelfe);
        ctx.lineTo(hitX,hitY);
        ctx.fillStyle = "#7B7371";
        ctx.fill();
        ctx.lineWidth = 0;
        ctx.strokeStyle = "#7B7371";
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(hitX,hitY);
        ctx.arc(hitX,hitY,stozec,4*twelfe,5*twelfe);
        ctx.lineTo(hitX,hitY);
        ctx.fillStyle = "#7B7371";
        ctx.fill();
        ctx.lineWidth = 0;
        ctx.strokeStyle = "#7B7371";
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(hitX,hitY);
        ctx.arc(hitX,hitY,stozec,6*twelfe,7*twelfe);
        ctx.lineTo(hitX,hitY);
        ctx.fillStyle = "#7B7371";
        ctx.fill();
        ctx.lineWidth = 0;
        ctx.strokeStyle = "#7B7371";
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(hitX,hitY);
        ctx.arc(hitX,hitY,stozec,8*twelfe,9*twelfe);
        ctx.lineTo(hitX,hitY);
        ctx.fillStyle = "#7B7371";
        ctx.fill();
        ctx.lineWidth = 0;
        ctx.strokeStyle = "#7B7371";
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(hitX,hitY);
        ctx.arc(hitX,hitY,stozec,10*twelfe, 11*twelfe);
        ctx.lineTo(hitX,hitY);
        ctx.fillStyle = "#7B7371";
        ctx.fill();
        ctx.lineWidth = 0;
        ctx.strokeStyle = "#7B7371";
        ctx.stroke();

        ctx.beginPath();
        ctx.arc(hitX,hitY, blackRad, 0, 2*Math.PI);
        ctx.fillStyle = "#1E1C1C";
        ctx.fill();
        ctx.lineWidth = 0;
        ctx.strokeStyle = "#1E1C1C";
        ctx.stroke();
    }
    

    this.drawHealth = function(ctx, r, x, y){
        var cordX = x-r;
        var height = r/11;
        var odmik = 1.10*r;
        if((y+(odmik + height))>this.maxy){
            healthBottom = false;
        } else if((y-(odmik+height)<0)){
            healthBottom = true;
        }

        if(healthBottom){
            var cordY = y +odmik;

            ctx.fillStyle = "#C2C2CD";
            ctx.fillRect(cordX, cordY, 2*r, height);

            ctx.fillStyle = "rgb("+(180-Math.pow(this.health/health, -1))+","+((150*(this.health/health))+30)+",65)";
            ctx.fillRect(cordX, cordY, this.healthCalculator(this.health, this.r), height);
        } else{
            var cordY = y-(odmik+height);

            ctx.fillStyle = "#C2C2CD";    //color  #53B553
            ctx.fillRect(cordX, cordY, 2*r, height);

            ctx.fillStyle = "rgb("+(180-Math.pow(this.health/health, -1))+","+((150*(this.health/health))+30)+",65)";
            ctx.fillRect(cordX, cordY, this.healthCalculator(this.health, this.r), height);
        }
    }

    this.healthCalculator = function(currentHealth, r){
        var healthSize = 2*r;
        var razmerje = currentHealth/health;
        return healthSize*razmerje;
    }


}    