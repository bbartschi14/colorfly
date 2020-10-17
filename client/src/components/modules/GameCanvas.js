import React, { Component } from "react";

import "./Canvas.css";
import { unstable_batchedUpdates } from "react-dom";
import Fill from "./Fill.js"
import Circle from "./Circle";

class GameCanvas extends Component {
    constructor(props) {
      super(props);
      // Two state properties, isActive stores info on which brush is active. brushSize controls the pixel size of the brush
      this.state = {
          isActive: [true, false, false, false, false],
          brushSize: 10,
          tool: "generateTool",
          circlesList: [],
          distanceTraveled: 0,
          circleFill: 'rgba(0,0,0,0.25)',
          genModeBall: true,
          coinsList: [],
          coinParam: [15,'#ffff00'], // [radius, color]
          glow: true
      }
      // Functions are bound here so they can be properly referenced throughout the file
      this.onMouseDown = this.onMouseDown.bind(this);
      this.onMouseMove = this.onMouseMove.bind(this);
      this.endPaintEvent = this.endPaintEvent.bind(this);
      this.saveImage = this.saveImage.bind(this);
      this.resetImage = this.resetImage.bind(this);
      this.changeStrokeStyle = this.changeStrokeStyle.bind(this);
      this.changePalette = this.changePalette.bind(this);
      this.increaseBrushSize = this.increaseBrushSize.bind(this);
      this.decreaseBrushSize = this.decreaseBrushSize.bind(this);
      this.switchTool = this.switchTool.bind(this);
      this.loop = this.loop.bind(this);
      this.startAnimation = this.startAnimation.bind(this);
      this.stopAnimation = this.stopAnimation.bind(this);
      this.resetAnimation = this.resetAnimation.bind(this);
      this.changeGenerateModeBounce = this.changeGenerateModeBounce.bind(this);
      this.changeGenerateModeTrace = this.changeGenerateModeTrace.bind(this);
      this.addCoin = this.addCoin.bind(this);
      this.random = this.random.bind(this);
      this.glowToggle = this.glowToggle.bind(this);



    }

    // saveImage takes the canvas data and stores it to a URL. Activated by the Save Image button, where the 
    // download commences by clicking Download Image
    saveImage = () => {
        // Set that you want to download the image when link is clicked
        this.imgFile.setAttribute('download', 'image.png');
        // Reference the image in canvas for download
        this.imgFile.setAttribute('href', this.canvas.toDataURL());
    } 

    // resetImage redraws the original background image over the canvas, therefore erasing all brush marks
    resetImage = () => {
        this.stopAnimation();
        this.resetAnimation();
        this.ctx.fillStyle = 'white';
        this.ctx.fillRect(0, 0,this.canvas.width,this.canvas.height);
    } 



    // Palettes
    // Add new palettes by creating new palette$ arrays and adding them to paletteList
    palette5 = ['#ffff00', '#ffda00', '#ffc300', '#ffb500', '#ff9e00'];
    palette2 = ['#1a2a2c', '#194343', '#6e4533', '#cc672a', '#ea8d45'];
    palette1 = ['#519ca5', '#d5e2c0', '#37486d', '#811c4e', '#fdb663'];
    palette4 = ['#7b1e32', '#88162e', '#a6243f', '#b73a5d', '#d54d76'];
    palette3 = ['#eecc5a', '#d56caa', '#5cad92', '#bbbbbb', '#aaaaaa'];
    palette6 = ['#fffdd6', '#bbbddf', '#4b12a7', '#300260', '#2d1700'];

    paletteList = [this.palette1, this.palette2, this.palette3,this.palette4,this.palette5,this.palette6];
    userStrokeStyle = this.paletteList[0][0];
    paletteIndex = 0;

    // buttonDisplay is used to set the CSS styling for the palette buttons
    buttonDisplay = [
        {backgroundColor: this.paletteList[this.paletteIndex][0]},
        {backgroundColor: this.paletteList[this.paletteIndex][1]},
        {backgroundColor: this.paletteList[this.paletteIndex][2]},
        {backgroundColor: this.paletteList[this.paletteIndex][3]},
        {backgroundColor: this.paletteList[this.paletteIndex][4]},
    ];


    // Variables for drawing feature
    isPainting = false;
    line = [];
    prevPos = { offsetX: 0, offsetY: 0};
    animate = true;

    toolList = ["brushTool", "bucketTool", "generateTool"];
    toolIndex = 0;

    switchTool(toolIndex) {
        this.toolIndex = toolIndex;
        this.setState({tool:this.toolList[this.toolIndex]});
        }

    circlesList = []
    // Initiates drawing
    onMouseDown({ nativeEvent }) {

        const { offsetX, offsetY } = nativeEvent;
        let point = {x:offsetX,y:offsetY};

        // collect coin
        var i;
        for (i=0; i < this.state.coinsList.length; i++) {
            if (point.x <= this.state.coinsList[i].x + this.state.coinParam[0]
                && point.x >= this.state.coinsList[i].x - this.state.coinParam[0]
                && point.y >= this.state.coinsList[i].y - this.state.coinParam[0]
                && point.y <= this.state.coinsList[i].y + this.state.coinParam[0]) {
                    this.state.coinsList.splice(i,1);
                    this.ctx1.clearRect(0,0,this.canvas1.width, this.canvas1.height);
                    var j;
                    for (j=0; j < this.state.coinsList.length; j++) {
                        this.state.coinsList[j].drawCircle();
                    }
                    return;
                }
        }

        if (this.state.tool === "brushTool") {
            this.isPainting = true;
            this.prevPos = {offsetX,offsetY};
            this.onMouseMove({ nativeEvent });
            
        } else if (this.state.tool === "bucketTool") {
            new Fill(this.canvas, point, this.userStrokeStyle);
        } else if (this.state.tool === "generateTool") {
            let circle = new Circle(this.canvas,point,this.userStrokeStyle,this.state.brushSize,this.state.glow);
            let newCirclesList = this.state.circlesList.concat([circle]);
            this.setState({circlesList: newCirclesList});
            this.startAnimation();   
            

        }
    }
    
    requestId;
    j = 0;
    loop() {
        var i;
        var k;
        this.requestId = undefined;
        this.ctx.fillStyle = this.state.circleFill;
        this.ctx.fillRect(0,0,this.canvas.width,this.canvas.height);
        for (i=0; i < this.state.circlesList.length; i++) {
            this.j++;
            this.state.circlesList[i].drawCircle();
            this.state.circlesList[i].updateCircle();
            if (this.j%10 === 0) {
                let newDistance = this.state.circlesList[i].returnDistance()*10 + this.state.distanceTraveled;
                this.setState({distanceTraveled:newDistance});
            }
        }

        // if (this.state.coinsList.length > 0) {
        //     for (k=0; k < this.state.coinsList.length; k++) {
        //         this.state.coinsList[k].drawCircle()
        //     }
        // }
        
        this.startAnimation();
        
    }
    
    startAnimation() {
        if (!this.requestId) {
            this.requestId = requestAnimationFrame(this.loop);
         }
    }

    stopAnimation() {
        if (this.requestId) {
            cancelAnimationFrame(this.requestId);
            this.requestId = undefined;
        }
    }

    resetAnimation() {
        this.setState({circlesList: []});
    }

    changeGenerateModeTrace() {
        this.setState({circleFill:'rgba(0,0,0,0)'});
        this.setState({genModeBall:false});
    }

    changeGenerateModeBounce() {
        this.setState({circleFill:'rgba(0,0,0,0.25)'});
        this.setState({genModeBall:true});

    }

    addCoin() {
        let randomX = this.random(0,this.canvas1.width);
        let randomY = this.random(0,this.canvas1.height);
        let point = {x:randomX,y:randomY};
        let circle = new Circle(this.canvas1,point,this.state.coinParam[1],this.state.coinParam[0],true);
        let newCoinsList = this.state.coinsList.concat([circle]);
        this.setState({coinsList: newCoinsList});
        circle.drawCircle();
    }

    glowToggle() {
        this.setState({glow: (!this.state.glow)});
    }

    random(min,max) {
        var num = Math.floor(Math.random()*(max-min)) + min;
        // if min = 10 max = 15 random var = 0.1544465; it will return approzimately 10 because of math.floor
        return num;
    }

    // Continutes drawing
    onMouseMove({ nativeEvent }) {
        if (this.isPainting) {
            const {offsetX,offsetY} = nativeEvent;
            const offsetData = {offsetX,offsetY};
            const positionData = {
                start: { ...this.prevPos },
                stop: { ...offsetData },
            };
            this.line = this.line.concat(positionData);
            this.paint(this.prevPos, offsetData, this.userStrokeStyle);
        }
    }

    // Ends drawing
    endPaintEvent() {
        if (this.isPainting) {
            this.isPainting = false;
        }
    }

    // Stroke and Palette Managing
    changeStrokeStyle(hexCode,index) {
        let newStroke = hexCode;
        this.userStrokeStyle = newStroke;
        let newActive = [false,false,false,false,false];
        newActive[index] = true;
        this.setState({isActive:newActive});
    }

    changePalette() {
        // if statement to loop the palette selection
        if (this.paletteIndex === this.paletteList.length-1) {
            this.paletteIndex = 0;
        } else {
            this.paletteIndex++;
        }
        // Updates stroke color to first color of new palette
        this.changeStrokeStyle(this.paletteList[this.paletteIndex][0],0);
        // Updates the palette buttons with new colors
        this.buttonDisplay = [
            {backgroundColor: this.paletteList[this.paletteIndex][0]},
            {backgroundColor: this.paletteList[this.paletteIndex][1]},
            {backgroundColor: this.paletteList[this.paletteIndex][2]},
            {backgroundColor: this.paletteList[this.paletteIndex][3]},
            {backgroundColor: this.paletteList[this.paletteIndex][4]},
        ];
    }

    increaseBrushSize() {
        let newSize = this.state.brushSize + 5;
        this.setState({brushSize:newSize});
        this.ctx.lineWidth = this.state.brushSize;
    }

    decreaseBrushSize() {
        if (this.state.brushSize > 5) {
            let newSize = this.state.brushSize - 5;
            this.setState({brushSize:newSize});
            this.ctx.lineWidth = this.state.brushSize;
        }
        
    }

    paint(prevPos, currPos, strokeStyle) {
        const { offsetX, offsetY } = currPos;
        const { offsetX: x, offsetY: y } = prevPos;
        
        this.ctx.beginPath();
        this.ctx.strokeStyle = strokeStyle;
        // Move the the prevPosition of the mouse
        this.ctx.moveTo(x, y);
        // Draw a line to the current position of the mouse
        this.ctx.lineTo(offsetX, offsetY);
        // Visualize the line using the strokeStyle
        this.ctx.stroke();
        this.prevPos = { offsetX, offsetY };
    }


    componentDidMount () {
        // Define canvas element and relevant values
        this.canvas.width = 900;
        this.canvas.height = 600;
        this.canvas1.width = 900;
        this.canvas1.height = 600;
        this.ctx = this.canvas.getContext("2d");
        this.ctx1 = this.canvas1.getContext("2d");

        this.ctx.lineJoin = "round";
        this.ctx.lineCap = "round";
        this.ctx.lineWidth = this.state.brushSize;


        
        // Draws imported image onto the canvas
        // this.image.onload = () => {
        //     this.ctx.drawImage(this.image, 0, 0,this.canvas.width,this.canvas.height)
        // }

    }


    render() {
        let glowText = 'True';
        if (!this.state.glow) {
            glowText = 'False';
        }

        return (
            <div>
                <div className="Wrapper">
                    <div className="Canvases">
                        <canvas 
                            className="Editor"
                            ref={canvas => this.canvas = canvas}
                            onMouseDown={this.onMouseDown}
                            onMouseLeave={this.endPaintEvent}
                            onMouseUp={this.endPaintEvent}
                            onMouseMove={this.onMouseMove}
                        />
                        <canvas
                            className="Editor1"
                            ref={canvas1 => this.canvas1 = canvas1}
                            onMouseDown={this.onMouseDown}
                            onMouseLeave={this.endPaintEvent}
                            onMouseUp={this.endPaintEvent}
                            onMouseMove={this.onMouseMove}
                        />
                        <img 
                            ref={image => this.image = image} 
                            src={page}
                            className="hidden"
                        />
                    </div>

                    <div className="paletteManager">
                        
                        {/* Glow State: {glowText}
                        <br/> */}
                        {/* <button href="" ref="addCoin" onClick={this.addCoin}>Add Coin</button>
                        <br/> */}

                        {/* Current Number of Circles: {this.state.circlesList.length}
                        <br/>
                        Distance Traveled: {Math.floor(this.state.distanceTraveled)}
                        <br/> */}

                    </div>
                </div>
                <div className="toolbar">
                        <button href="#" ref="save" onClick={this.saveImage}>Save Image</button>
                        <br/>
                        <a className="download" href="#" ref={imgFile => this.imgFile = imgFile} download="image.png"> {'\u00A0'} Download Image</a>
                    </div>
            </div>
        )
    }
}



export default GameCanvas;
