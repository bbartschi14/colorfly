export default class Fill{

    constructor(canvas, point, color) {
        this.ctx = canvas.getContext("2d");

       
        this.imageData = this.ctx.getImageData(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);

        const targetColor = this.getPixel(point);
       
        const fillColor = this.hexToRgba(color);

        this.fillStack = [];
        this.floodFill(point, targetColor, fillColor);
        this.fillColor();

    }

    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    floodFill(point, targetColor, fillColor) {
        if (this.colorsMatch(targetColor,fillColor)) {
            return;
        }

        const currentColor = this.getPixel(point);

        if (this.colorsMatch(currentColor,targetColor)) {

            this.setPixel(point, fillColor);
            let point0 = {x:point.x + 1, y:point.y};
            let point1 = {x:point.x - 1, y:point.y};
            let point2 = {x:point.x , y:point.y + 1};
            let point3 = {x:point.x , y:point.y - 1};
            

            if (this.onCanvas(point0)) {
                 this.fillStack.push([point0, targetColor, fillColor]);
            } else {
                console.log("point off canvas")
            }
            if (this.onCanvas(point1)) this.fillStack.push([point1, targetColor, fillColor]);
            if (this.onCanvas(point2)) this.fillStack.push([point2, targetColor, fillColor]);
            if (this.onCanvas(point3)) this.fillStack.push([point3, targetColor, fillColor]);
            

            // this.fillStack.push([point0, targetColor, fillColor]);
            // this.fillStack.push([point1, targetColor, fillColor]);
            // this.fillStack.push([point2, targetColor, fillColor]);
            // this.fillStack.push([point3, targetColor, fillColor]);
        
        }
        

    }

    async fillColor(){
        if(this.fillStack.length){
            let counter = 1;
            let range = this.fillStack.length;

            for(let i = 0; i < range; i++){
                this.floodFill(this.fillStack[i][0], this.fillStack[i][1], this.fillStack[i][2], this.fillStack[i][3]);
                // counter++;
                // if (counter % 400 === 0){
                //     await this.sleep(1);
                // }
            }
            
            this.fillStack.splice(0, range);

            this.ctx.putImageData(this.imageData, 0, 0);
            this.fillColor();
        
        } else {
            this.fillStack = [];
        }
    }

    getPixel(point) {
        if (point.x < 0 || point.y < 0 || point.x >= this.imageData.width, point.y >= this.imageData.height) {
            return [-1, -1, -1, -1];
        } else {
            const offset = (point.y * this.imageData.width + point.x) * 4;

            return [
                this.imageData.data[offset + 0],
                this.imageData.data[offset + 1],
                this.imageData.data[offset + 2],
                this.imageData.data[offset + 3]
            ];
        }
    }

    setPixel(point, fillColor) {
        const offset = (point.y * this.imageData.width + point.x) * 4;

        this.imageData.data[offset + 0] = fillColor[0];
        this.imageData.data[offset + 1] = fillColor[1];
        this.imageData.data[offset + 2] = fillColor[2];
        this.imageData.data[offset + 3] = fillColor[3];

    }

    colorsMatch(color1, color2) {
        if (color1[0] == color2[0]
               && color1[1] == color2[1] 
               && color1[2] == color2[2] 
               && color1[3] == color2[3]) {
                return true;
        } else if (Math.abs(color1[3]-color2[3]) < 254 && Math.abs(color1[3]-color2[3]) !== 0 ) {
            return true;
        } else {
            return false;
        }
        
        
    }

    hexToRgba(hex) {
        var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return [
            parseInt(result[1], 16),
            parseInt(result[2], 16),
            parseInt(result[3], 16),
            255
        ]
    }

    onCanvas(point) {
        if (point.x < 0 || point.y < 0 || point.x >= this.imageData.width, point.y >= this.imageData.height) {
            return false;
        } else {
            return true;
        }
    }
}