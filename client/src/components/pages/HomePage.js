import React, { Component } from "react";
import GoogleLogin, { GoogleLogout } from "react-google-login";
import { Link } from "@reach/router";
import Circle from "../modules/Circle";
import "../../utilities.css";
import "./HomePage.css";
import image1 from "../../../dist/cover1.png"
import image2 from "../../../dist/cover2.png"
import image3 from "../../../dist/cover3.png"
import image4 from "../../../dist/cover4.png"
import image5 from "../../../dist/cover5.png"
import image6 from "../../../dist/cover6.png"
import image7 from "../../../dist/cover7.png"
import image8 from "../../../dist/cover8.png"
import image9 from "../../../dist/cover9.png"
import image10 from "../../../dist/cover10.png"

import logo from "../../../dist/cursiveLogo.png"





const GOOGLE_CLIENT_ID = "473302145912-uucgul3s3cpn156ma18qqt7gggaea337.apps.googleusercontent.com";

class HomePage extends Component {
  constructor(props) {
    super(props);
    this.state = {
      circlesList: [],
      imageList: [image1,image2,image3,image4,image5,image6,image7,image8,image9,image10],
      imageIndices: [],
      width: 0,
      height: 0,
    };
    this.startBackground = this.startBackground.bind(this);
    this.loop = this.loop.bind(this);
  }

  startBackground() {

    let circle = new Circle(this.canvas,{x:this.random(50,this.canvas.width-50),y:this.random(50,this.canvas.height-50)},'lightyellow',10,true);
    let circle1 = new Circle(this.canvas,{x:this.random(50,this.canvas.width-50),y:this.random(50,this.canvas.height-50)},'yellow',10,true);
    let circle2 = new Circle(this.canvas,{x:this.random(50,this.canvas.width-50),y:this.random(50,this.canvas.height-50)},'yellow',10,true);
    let circle3 = new Circle(this.canvas,{x:this.random(50,this.canvas.width-50),y:this.random(50,this.canvas.height-50)},'lightyellow',5,true);
    let circle5 = new Circle(this.canvas,{x:this.random(50,this.canvas.width-50),y:this.random(50,this.canvas.height-50)},'yellow',5,true);

    let newCirclesList = this.state.circlesList.concat([circle,circle1,circle2,circle3,circle5]);
    this.setState({circlesList: newCirclesList});
    
    requestAnimationFrame(this.loop);
  }

  loop() {
      var i;
      this.ctx.fillStyle = 'rgba(20,20,20,.35)';
      this.ctx.fillRect(0,0,this.state.width,this.state.height);
      for (i=0; i < this.state.circlesList.length; i++) {
          this.state.circlesList[i].drawCircle();
          this.state.circlesList[i].updateCircle();
      }

      
      requestAnimationFrame(this.loop);
      
  }
  random(min,max) {
        var num = Math.floor(Math.random()*(max-min)) + min;
        // if min = 10 max = 15 random var = 0.1544465; it will return approzimately 10 because of math.floor
        return num;
      }
  componentDidMount() {
    var i;
    while (this.state.imageIndices.length<4) {
      let index = this.random(0,this.state.imageList.length);
      if (this.state.imageIndices.includes(index)) {
        continue;
      } else {
        this.state.imageIndices.push(index);
      }
    }
    this.canvas.width = 960;
    this.canvas.height = 540;  
    this.setState({width:this.canvas.width,height:this.canvas.height})
    this.ctx = this.canvas.getContext("2d");

    this.startBackground();
  }

  render() {
    return (
      <>
          <canvas className="Background"
                    ref={canvas => this.canvas = canvas}
            />
          <div className="Full-wrapper">
            
            <div className = "Title-wrapper">
              <div className="Title"><img src={logo} className="Logo-box"></img></div>
              <div className="Subtitle">easy to create. mesmerizing to watch.</div>
              <div className = "Login-wrapper">
              {this.props.loggedIn ? (
                <GoogleLogout
                  clientId={GOOGLE_CLIENT_ID}
                  buttonText="Logout"
                  onLogoutSuccess={this.props.handleLogout}
                  onFailure={(err) => console.log(err)}
                  render={(renderProps)=> (
                    <button className="Login-button" onClick={renderProps.onClick}>logout</button>
                  )}
                />
              ) : (
                <GoogleLogin
                  clientId={GOOGLE_CLIENT_ID}
                  buttonText="Login"
                  onSuccess={this.props.handleLogin}
                  onFailure={(err) => console.log(err)}
                  render={(renderProps)=> (
                    <button className="Login-button" onClick={renderProps.onClick}>login</button>
                  )}
                />
              )} {'\u00A0'} <Link to='/create/' className='Page-link'>and <i>click here</i> to start </Link>
            </div>
            </div>
            <div className="Image-wrapper">
              <img src={this.state.imageList[this.state.imageIndices[0]]} className="Image-box"></img>
              <img src={this.state.imageList[this.state.imageIndices[1]]} className="Image-box"></img>
              <img src={this.state.imageList[this.state.imageIndices[2]]} className="Image-box"></img>
              <img src={this.state.imageList[this.state.imageIndices[3]]} className="Image-box"></img>




            </div>
          </div>
          
      </>
    );
  }
}

export default HomePage;
