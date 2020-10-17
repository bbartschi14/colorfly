import React, { Component } from "react";

import "./Canvas.css";
import { unstable_batchedUpdates } from "react-dom";
import Fill from "./Fill.js"
import Circle from "./Circle";
import { post,get } from "../../utilities";
import { Mongoose } from "mongoose";




class Canvas extends Component {
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
          glow: true,
          images: [],
          loadIndex: 0,
          loadId: 0,
          imageToLoad: undefined,
          modalActive: false,
          imageTitle: '',
          titleGiven: false,
          circularInputs: false,
          isAnimating: false,
          newSession: true,
          height:0,
          width:0,
      }
      // Functions are bound here so they can be properly referenced throughout the file
      this.onMouseDown = this.onMouseDown.bind(this);
      this.onMouseMove = this.onMouseMove.bind(this);
      this.endPaintEvent = this.endPaintEvent.bind(this);
      this.saveImage = this.saveImage.bind(this);
      this.saveImageContinue = this.saveImageContinue.bind(this);
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
      this.loadSession = this.loadSession.bind(this);
      this.changeLoadIndex = this.changeLoadIndex.bind(this);
      this.setImageToLoad = this.setImageToLoad.bind(this);
      this.toggleModal = this.toggleModal.bind(this);
      this.handleTitleInput = this.handleTitleInput.bind(this);
      this.handleSubmit = this.handleSubmit.bind(this);
      this.toggleCircular = this.toggleCircular.bind(this);
      this.toggleNewSession = this.toggleNewSession.bind(this);
      this.enterPressed = this.enterPressed.bind(this);
      this.toggleAnimation = this.toggleAnimation.bind(this);
    }
    toggleAnimation() {
        if (this.state.isAnimating) {
            this.stopAnimation();
        } else {
            this.startAnimation();
        }
    }
    toggleCircular() {
        this.setState({circularInputs:!this.state.circularInputs});
    }
    toggleModal() {
        if (this.state.modalActive) {
            this.setState({titleGiven:true});
            this.saveImageContinue();
            this.setState({modalActive:false});
            // this.startAnimation();
        } else {
            this.setState({modalActive:true});
            // this.stopAnimation();
        }
    }
    toggleNewSession(boolean) {
        this.setState({newSession:boolean})
    }
    handleTitleInput(event) {
        this.setState({imageTitle:event.target.value});
    }

    handleSubmit(event) {
        event.preventDefault();
      }

    setImageToLoad = (imageLoadId) => {
        this.setState({imageToLoad:imageLoadId});
    }

    // saveImage takes the canvas data and stores it to a URL. Activated by the Save Image button, where the 
    // download commences by clicking Download Image
    saveImage = () => {
        if (this.props.userId === undefined) {
            window.alert("Please login to save work");
            return;
        } else if (this.props.savedImages >= 10) {
            window.alert("Gallery full, you have 10 saved canvases");
            return;
        } else {
            this.toggleModal();
        }
    } 

    saveImageContinue = () => {
        this.setState({titleGiven:false})
        const imgData64 = this.canvas.toDataURL();
        let animData = [];
        var i;
        for (i=0; i<this.state.circlesList.length;i++) {
            let c = this.state.circlesList[i];
            let animIndex = [c.x,c.y,c.fillColor,c.brushSize,c.glowCheck,c.velX,c.velY,c.circular,c.radius,c.circAngle,c.startPoint,c.direction];
            animData.push(animIndex);
        }
        let stringMode = '';
        if (this.state.genModeBall) { 
            stringMode = 'ballMode';
        } else {
            stringMode = 'traceMode';
        }
        const body = {content:imgData64, animation:animData, animMode:stringMode, imageTitle:this.state.imageTitle};
        post("/api/image", body).then((image) => {
            this.props.handleSave();
        });
        get("/api/user/update",{}).then(() => {
        });
         
        // Set that you want to download the image when link is clicked
        // this.imgFile.setAttribute('download', 'image.png');
        // Reference the image in canvas for download
        // this.imgFile.setAttribute('href', this.canvas.toDataURL());
    }

    // resetImage redraws the original background image over the canvas, therefore erasing all brush marks
    resetImage = () => {
        this.stopAnimation();
        this.resetAnimation();
        this.ctx.fillStyle = 'black';
        this.ctx.fillRect(0, 0,this.canvas.width,this.canvas.height);
    } 



    // Palettes

    paletteList = this.props.paletteList;
    
    paletteIndex = this.props.paletteIndex;
    userStrokeStyle = this.paletteList[this.paletteIndex][0];


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
        if (this.state.isAnimating && this.toolIndex == 0) {
        } else {
            this.setState({tool:this.toolList[this.toolIndex]});
        }
    }

    circlesList = []
    // Initiates drawing
    onMouseDown({ nativeEvent }) {
        this.toggleNewSession(false);
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
            let circle = new Circle(this.canvas,point,this.userStrokeStyle,this.state.brushSize,this.state.glow,undefined,undefined,this.state.circularInputs);
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
        this.ctx.fillRect(0,0,this.state.width,this.state.height);
        for (i=0; i < this.state.circlesList.length; i++) {
            this.j++;
            this.state.circlesList[i].drawCircle();
            this.state.circlesList[i].updateCircle();
            // if (this.j%10 === 0) {
            //     let newDistance = this.state.circlesList[i].returnDistance()*10 + this.state.distanceTraveled;
            //     this.setState({distanceTraveled:newDistance});
            // }
        }

        // if (this.state.coinsList.length > 0) {
        //     for (k=0; k < this.state.coinsList.length; k++) {
        //         this.state.coinsList[k].drawCircle()
        //     }
        // }
        
        this.startAnimation();
        
    }
   
    loadSession() {
        this.resetImage(); 

        const imgLink = this.state.images[0].content;
        var transferImage = new Image();
        let ctx = this.ctx;
        let canvas = this.canvas;
        transferImage.onload = function() {
            ctx.drawImage(transferImage, 0, 0,canvas.width,canvas.height);
        };
        transferImage.src = imgLink;

        if (this.state.images[0].animMode === 'ballMode') {
            this.changeGenerateModeBounce();
        } else {
            this.changeGenerateModeTrace();
        }

        var i;
        let newCirclesList = [];
        let imageArray = this.state.images[0].animation;
        for (i=0; i<imageArray.length;i++) {
            let t = imageArray[i];
            let circle = new Circle(this.canvas,{x:t[0],y:t[1]},t[2],t[3],t[4],t[5],t[6],t[7],t[8],t[9],t[10],t[11]);
            newCirclesList.push(circle);
        }
        this.setState({circlesList:newCirclesList});
        this.startAnimation();   

    }
    changeLoadIndex() {
        if (this.state.loadIndex+1 === this.state.images.length) {
            this.setState({loadIndex:0});
        } else {
            this.setState({loadIndex:this.state.loadIndex+1})
        }
    }
    
    startAnimation() {
        if (!this.requestId) {
            this.requestId = requestAnimationFrame(this.loop);
         }
        this.setState({isAnimating:true});
        if (this.state.tool == "brushTool") this.setState({tool:"generateTool"});
    }

    stopAnimation() {
        if (this.requestId) {
            cancelAnimationFrame(this.requestId);
            this.requestId = undefined;
        }
        this.setState({isAnimating:false});

    }

    resetAnimation() {
        this.setState({circlesList: []});
    }

    changeGenerateModeTrace() {
        this.setState({circleFill:'rgba(0,0,0,0)'});
        this.setState({genModeBall:false});
        this.switchTool(2);
    }

    changeGenerateModeBounce() {
        this.setState({circleFill:'rgba(0,0,0,0.25)'});
        this.setState({genModeBall:true});
        this.switchTool(2);

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
        if (this.state.brushSize < 250) {
            let newSize = this.state.brushSize + 5;
            this.setState({brushSize:newSize});
            this.ctx.lineWidth = this.state.brushSize;
        }
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

    enterPressed(event) {
        var code = event.keyCode || event.which;
        if(code === 13) { 
            event.preventDefault();
            this.toggleModal();
        } 
    }

    componentDidMount () {
        // Define canvas element and relevant values
        this.canvas.width = 810;
        this.canvas.height = 540;
        this.setState({width:this.canvas.width,height:this.canvas.height});
        this.ctx = this.canvas.getContext("2d");
        this.ctx.fillStyle = 'black';
        this.ctx.fillRect(0, 0,this.canvas.width,this.canvas.height);
        
        this.ctx.lineJoin = "round";
        this.ctx.lineCap = "round";
        this.ctx.lineWidth = this.state.brushSize;
        if (this.props.loadId !== undefined) {
            this.ctx.fillStyle = 'black';
            this.ctx.fillRect(0, 0,this.canvas.width,this.canvas.height);
            this.ctx.fillStyle = 'white';
            this.ctx.font = "20px Sarala";
            this.ctx.textAlign = "center";
            this.ctx.fillText("Loading session...", this.canvas.width/2, this.canvas.height/2);
            this.toggleNewSession(false);
        }
        const ObjectId = mongoose.Types.ObjectId;
        get("/api/images/load",{_id:  ObjectId(this.props.loadId)}).then((imageObj) => {
            this.setState({ images: imageObj });
            if (imageObj.length !== 0) {
                this.loadSession();
            }
            this.props.resetLoadId();
        });
        
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
        let brushClass = '';
        this.state.tool == "brushTool" ? "selectedFullButton" : "fullButton"
        if (this.state.isAnimating) {
            brushClass = "inactiveButton";
        } else if (this.state.tool == "generateTool") {
            brushClass = "fullButton";
        } else {
            brushClass = "selectedFullButton"
        }
        let animBrushClass ='';
        if (this.state.circlesList.length < 1) {
            animBrushClass = "inactiveButton2"; 
        } else {
            animBrushClass = "fullButton"
        }

        return (
            <div>
                <div className={this.state.modalActive ? "Save-Canvas-modal" : "Save-Canvas-modal-hidden"} ref={modal => this.modal = modal}>
                    
                    <div className="Save-Modal-content">
                        <form className="Save-box">
                            <label className='Label'>
                            Name your canvas!
                            <input className="text-box" maxLength="24" type="text" value={this.state.imageTitle} onKeyPress={this.enterPressed} onChange={this.handleTitleInput} />
                            </label>
                            <span className="halfButton-Card" onClick={this.toggleModal}>Submit</span>
                        </form>
                        
                    </div>
                </div>
                <div className="bigWrapper">
                    <div className="Wrapper">
                        <div className={this.state.newSession ? "New-Canvases" : "Canvases"}>
                            <canvas 
                                className="Editor"
                                ref={canvas => this.canvas = canvas}
                                onMouseDown={this.onMouseDown}
                                onMouseLeave={this.endPaintEvent}
                                onMouseUp={this.endPaintEvent}
                                onMouseMove={this.onMouseMove}
                            >
                            </canvas>
                            <span className="editor-tooltip">Click in the canvas to start animating!</span>
                            
                        </div>

                        <div className="paletteManager">

                            <div className="brushManager-wrapper">
                                <div className="Canvas-icon">
                                    <span className="Info-tooltip">Increase or decrease the brush size, and select the draw tool to free draw.</span>
                                    <i className="fa fa-info"></i>
                                </div>
                                brush {'\u00A0'} {'\u00A0'}size: {this.state.brushSize}
                                <div className="buttonWrapper">
                                    
                                    <div className= "brushManager">
                                        <button className="halfButton" href="" ref="increaseB" onClick={this.increaseBrushSize}>brush+  </button>
                                        <button className="halfButton" href="" ref="decreaseB" onClick={this.decreaseBrushSize}>brush-</button>
                                    </div>

                                    <div className= "brushManager">
                                        <button className={brushClass} href="" ref="brush" onClick={() => this.switchTool(0)}>draw
                                        <span className="brush-tooltip">Cannot draw while animating</span>
                                        </button>    
                                    </div>
                                </div>
                            </div>

                            <div className="genManager-wrapper">
                                <div className="Canvas-icon">
                                    <span className="Info-tooltip">Switch between modes (ball, trace) to update the image live. Set the path (linear, circular) or toggle the glow for new circles. </span>
                                    <i className="fa fa-info"></i>
                                </div>
                                generate
                                {/* <button className={this.state.tool == "generateTool" ? "selectedFullButton" : "fullButton"} href="" ref="generate" onClick={() => this.switchTool(2)}>Generate</button> */}
                                <div className="buttonWrapper">

                                    <div className= "genManager">
                                        <button className={(this.state.tool == "generateTool" && this.state.genModeBall) ? "selectedHalfButton": "halfButton"} href="" ref="changeBounce" onClick={this.changeGenerateModeBounce}>ball mode</button>
                                        <button className={(this.state.tool == "generateTool" && !this.state.genModeBall) ? "selectedHalfButton": "halfButton"} href="" ref="changeTrace" onClick={this.changeGenerateModeTrace}>trace mode</button>
                                    </div>
                                    <div className= "genManager">
                                        <button className={(!this.state.circularInputs && this.state.tool == "generateTool") ? "selectedHalfButton": "halfButton"} href="" ref="linear" onClick={this.toggleCircular}>linear</button>
                                        <button className={(this.state.circularInputs && this.state.tool == "generateTool") ? "selectedHalfButton": "halfButton"} href="" ref="circular" onClick={this.toggleCircular}>circular</button>
                                    </div>
                                    <button className={this.state.glow ? "toggledFullButton" : "fullButton"} href="" ref="glowToggle" onClick={this.glowToggle}>toggle glow</button>
                                </div>
                            </div>
                            
                            {/* Glow State: {glowText}
                            <br/> */}
                            {/* <button href="" ref="addCoin" onClick={this.addCoin}>Add Coin</button>
                            <br/> */}
                            <div className="animManager-wrapper">
                                <div className="Canvas-icon">
                                    <span className="Info-tooltip">Stop and start the current animation.</span>
                                    <i className="fa fa-info"></i>
                                </div>
                                animation
                                <div className="buttonWrapper">

                                    <div className= "animManager">
                                        <button className={animBrushClass} href="" ref="stop" onClick={this.toggleAnimation}><i className={this.state.isAnimating ? "fa fa-pause":"fa fa-play"}></i>
                                        <span className="anim-brush-tooltip">No animation</span></button>
                                        {/* <button className={animBrushClass} href="" ref="start" onClick={this.startAnimation}><i className="fa fa-play"></i>
                                        <span className="anim-brush-tooltip">Use generate then click on the canvas to begin animating</span></button> */}
                                    </div>
                                </div>
                            </div>

                            {/* Current Number of Circles: {this.state.circlesList.length}
                            <br/>
                            Distance Traveled: {Math.floor(this.state.distanceTraveled)}
                            <br/> */}

                            <div className="Palette-wrapper">
                                <div className="Canvas-icon">
                                    <span className="Info-tooltip">Cycle through sets of unique palettes and set the brush color.</span>
                                    <i className="fa fa-info"></i>
                                </div>
                                colors
                                <button className="fullButton" href="" ref="changeP" onClick={this.changePalette}>change palette</button>
                                

                                <div className="colorPalette">
                                    <div className={this.state.isActive[0] ? "itemSelected" : "item"} ref={color0 => this.color0 = color0} 
                                        onClick={() => this.changeStrokeStyle(this.paletteList[this.paletteIndex][0],0)}>
                                        <div className="colorBox" style={this.buttonDisplay[0]}/></div>
                                    <div className={this.state.isActive[1] ? "itemSelected" : "item"} ref={color1 => this.color1 = color1} 
                                        onClick={() => this.changeStrokeStyle(this.paletteList[this.paletteIndex][1],1)}>
                                        <div className="colorBox" style={this.buttonDisplay[1]}/></div>
                                    <div className={this.state.isActive[2] ? "itemSelected" : "item"} ref={color2 => this.color2 = color2} 
                                        onClick={() => this.changeStrokeStyle(this.paletteList[this.paletteIndex][2],2)}>
                                        <div className="colorBox" style={this.buttonDisplay[2]}/></div>
                                    <div className={this.state.isActive[3] ? "itemSelected" : "item"} ref={color3 => this.color3 = color3} 
                                        onClick={() => this.changeStrokeStyle(this.paletteList[this.paletteIndex][3],3)}>
                                        <div className="colorBox" style={this.buttonDisplay[3]}/></div>
                                    <div className={this.state.isActive[4] ? "itemSelected" : "item"} ref={color4 => this.color4 = color4}  
                                        onClick={() => this.changeStrokeStyle(this.paletteList[this.paletteIndex][4],4)}>
                                        <div className="colorBox" style={this.buttonDisplay[4]}/></div>
                                </div>
                            </div>
                            <div className="lastButtonWrapper">
                                <div className="toolbar">
                                    <button className="halfButton" style={{fontSize: "15px"}}href="" ref="reset" onClick={this.resetImage}>
                                        <span className="image-brush-tooltip">Reset Canvas</span>
                                        <i className="fa fa-refresh"></i>
                                    </button>
                                    <button className="halfButton" style={{fontSize: "15px"}}href="#" ref="save" onClick={this.saveImage}>
                                        <span className="image-brush-tooltip">Save to Gallery</span>
                                        <i className="fa fa-save"></i>
                                    </button>
                                    {/* <br/>
                                    <a className="download" href="#" ref={imgFile => this.imgFile = imgFile} download="image.png"> {'\u00A0'} Download Image</a> */}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        )
    }
}



export default Canvas;
