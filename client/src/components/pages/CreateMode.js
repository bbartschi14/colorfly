import React, { Component } from "react";
import GoogleLogin, { GoogleLogout } from "react-google-login";
import Canvas from "../modules/Canvas.js"
import NavBar from "../modules/NavBar"
import { Redirect } from "@reach/router";

import "../../utilities.css";

class CreateMode extends Component {
    constructor(props) {
      super(props);
      this.state = {
          paletteList: [['#ffff00', '#ffda00', '#ffc300', '#ffb500', '#ff9e00'],
                        ['#1a2a2c', '#194343', '#6e4533', '#cc672a', '#ea8d45'],
                        ['#519ca5', '#d5e2c0', '#37486d', '#811c4e', '#fdb663'],
                        ['#7b1e32', '#88162e', '#a6243f', '#b73a5d', '#d54d76'],
                        ['#eecc5a', '#d56caa', '#5cad92', '#bbbbbb', '#aaaaaa'],
                        ['#fffdd6', '#bbbddf', '#4b12a7', '#300260', '#2d1700'],
                        ['#C1CFDA', '#20A4F3', '#59F8E8', '#941C2F', '#03191E'],
                        ['#3A405A', '#F9DEC9', '#99B2DD', '#E9AFA3', '#685044'],
                        ['#BEC5AD', '#A4B494', '#519872', '#3B5249', '#34252F']],
          paletteIndex: this.random(0,9),
          height: undefined,
          width: undefined,
      };
      this.startBackground = this.startBackground.bind(this);
      this.drawCircle = this.drawCircle.bind(this);
      this.setHeight = this.setHeight.bind(this);

    }

    setHeight(xWidth,yHeight) {
        this.setState({height:yHeight});
        this.setState({width:xWidth});
    }

    startBackground() {
        let fillColorsList = this.state.paletteList[this.state.paletteIndex];
        var i;
        for (i=0;i<11;i++) {
            this.drawCircle(fillColorsList[i % 5],75,this.canvas.height/2.25,i)
        }
        
        
    }

    drawCircle(fillStyle, minSize, maxSize,index) {
        this.ctx.beginPath();
        this.ctx.fillStyle = fillStyle;
        this.ctx.arc(this.canvas.width/10*index,this.canvas.height,this.random(minSize,maxSize),0,2*Math.PI);
        this.ctx.fill();
    }
    random(min,max) {
        var num = Math.floor(Math.random()*(max-min)) + min;
        // if min = 10 max = 15 random var = 0.1544465; it will return approzimately 10 because of math.floor
        return num;
      }
    componentDidMount(){
        this.canvas.width = window.screen.width;
        this.canvas.height = window.innerHeight; 
        this.setHeight(this.canvas.width,this.canvas.height);
 
        this.ctx = this.canvas.getContext("2d");
        this.ctx.globalAlpha = .85;

        this.startBackground();
    }
    render() {
        return (
            <>
                <NavBar
                 userId = {this.props.userId}
                 loggedIn = {this.props.loggedIn}
                 handleLogin={this.props.handleLogin}
                 handleLogout={this.props.handleLogout}
                 resetLogout={this.props.resetLogout}
                 name={this.props.name}

                 />
                 <canvas className="Background"
                    style={{height:this.state.height,width:this.state.width}}
                    ref={canvas => this.canvas = canvas}
                 />
                <Canvas
                 userId = {this.props.userId}
                 loadId={this.props.loadId}
                 resetLoadId={this.props.resetLoadId}
                 paletteIndex={this.state.paletteIndex}
                 paletteList={this.state.paletteList}
                 handleSave={this.props.handleSave}
                 savedImages={this.props.savedImages}

                />
            </>
        );
    }
}

export default CreateMode;
