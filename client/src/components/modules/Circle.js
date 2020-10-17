export default class Circle {

    constructor(canvas,startPoint,strokeColor,brushSize,glowCheck,velX,velY,circularInput,circRadius,circAngle,circStartPoint,direction) {
        this.ctx = canvas.getContext("2d");
        this.canvas = canvas;
        if (direction === true || direction === false) {
            this.direction = direction;
        } else {
            let coinFlip = this.random(1,10);
            if (coinFlip > 5) {
                this.direction = true;
            } else {
                this.direction = false;
            }
        }
        if (circStartPoint && circularInput) {
            this.startPoint = circStartPoint;
        } else {
            this.startPoint = startPoint;
        }
        this.fillColor = strokeColor;
        this.brushSize = brushSize;
        if (velX) {
            this.velX = velX;
        } else {
            this.velX = this.random(-5,5);
        if (this.velX === 0) this.velX = 1;
        }
        if (velY) {
            this.velY = velY;
        } else {
            this.velY = this.random(-5,5);
        if (this.velY === 0) this.velY = 1;
        }
        this.glowCheck = glowCheck;

        this.x = startPoint.x;
        this.y = startPoint.y;
        if ((this.x + this.brushSize) >= this.canvas.width) {
            this.x = this.canvas.width - this.brushSize - 1;
        }
        if ((this.x - this.brushSize) <= 0) {
            this.x = this.brushSize + 1;
        }
        if ((this.y + this.brushSize) >= this.canvas.height) {
            this.y = this.canvas.height - this.brushSize - 1;
        }
        if ((this.y - this.brushSize) <= 0) {
            this.y = this.brushSize + 1;
        }
        
        this.circular = circularInput;
        if (circRadius) {
            this.radius = circRadius;
        } else {
            this.radius = this.random(50,this.canvas.width/2);
        }
        if (circAngle) {
            this.circAngle = circAngle;
        } else {
            if (this.direction) {
                this.circAngle = 0;
            } else {
                this.circAngle = Math.PI;
            }
        }
    }

    random(min,max) {
        var num = Math.floor(Math.random()*(max-min)) + min;
        // if min = 10 max = 15 random var = 0.1544465; it will return approzimately 10 because of math.floor
        return num;
      }
      
      

    drawCircle() {
        this.ctx.beginPath();
        this.ctx.fillStyle = this.fillColor;
        this.size = this.brushSize;
        this.ctx.arc(this.x,this.y,this.size,0,2*Math.PI);
        if (this.glowCheck) {
            this.ctx.shadowBlur = this.brushSize+1;
            this.ctx.shadowColor = this.fillColor;
        } else {
            this.ctx.shadowBlur = 0;
        }
        this.ctx.fill();
        this.ctx.shadowBlur = 0;

        
    }

    updateCircle() {
        if ((this.x + this.size) >= this.canvas.width) {
            this.velX = -(this.velX);
        }
        if ((this.x - this.size) <= 0) {
            this.velX = -(this.velX);
        }
    
        if ((this.y + this.size) >= this.canvas.height) {
            this.velY = -(this.velY);
        }
    
        if ((this.y - this.size) <= 0) {
            this.velY = -(this.velY);
        }
        if (this.circular) {
            let circX = 0;
            let circY = 0;
            if (this.direction) {
                circX = Math.cos(this.circAngle)*this.radius+this.startPoint.x-this.radius;
                circY = Math.sin(this.circAngle)*this.radius+this.startPoint.y;
                this.circAngle += 5/(this.radius);
            } else {
                circX = Math.cos(this.circAngle)*this.radius+this.startPoint.x+this.radius;
                circY = Math.sin(this.circAngle)*this.radius+this.startPoint.y;
                this.circAngle -= 5/(this.radius);
            }
            this.x = circX;
            this.y = circY;
        } else {
            this.x += this.velX;
            this.y += this.velY;
        }
    
    }

    returnDistance() {
        return (Math.sqrt(this.velX**2 + this.velY**2));
    }

    returnPoint() {
        let point = this.startPoint;
        return {point};
    }

}