import React, { Component } from "react";
import GoogleLogin, { GoogleLogout } from "react-google-login";
import { Link } from "@reach/router";
import "../../utilities.css";
import NavBar from "../modules/NavBar";
import Card from "../modules/Card"
import { get, post } from "../../utilities";
import "./Gallery.css";
import { Redirect } from "@reach/router";


class Gallery extends Component {
    constructor(props) {
        super(props);
        this.state = {
            images: [],
            checkedImages: false,
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
            infoActive: false,
            totalLikes: 0,
      };
        this.startBackground = this.startBackground.bind(this);
        this.drawCircle = this.drawCircle.bind(this);
        this.handleDelete = this.handleDelete.bind(this);
        this.setHeight = this.setHeight.bind(this);
        this.toggleInfoActive = this.toggleInfoActive.bind(this);
        this.calculateLikes = this.calculateLikes.bind(this);
    }
    calculateLikes() {
        var i;
        for (i=0;i<this.state.images.length;i++) {
            let newLikes = this.state.totalLikes + this.state.images[i].likedBy.length;
            this.setState({totalLikes:newLikes});
        }
    }
    toggleInfoActive() {
        this.setState({infoActive:!this.state.infoActive});
    }
    
    handleDelete(creator,id) {
        const ObjectId = mongoose.Types.ObjectId;
        get("/api/images/delete",{creator_id:creator,_id:  ObjectId(id)}).then(() => {
        });
        var newArray = this.state.images.filter(function (el) {
            return el._id.toString() !== id;
        });
        this.setState({images:newArray});
        this.props.handleDelete();
    }
    setHeight(xWidth,yHeight) {
        this.setState({height:yHeight});
        this.setState({width:xWidth});

    }
    startBackground() {
        let fillColorsList = this.state.paletteList[this.state.paletteIndex];
        var i;
        for (i=0;i<11;i++) {
            this.drawCircle(fillColorsList[i % 5],25,this.canvas.width/6,i,0)
        }
        for (i=0;i<11;i++) {
            this.drawCircle(fillColorsList[i % 5],25,this.canvas.width/6,i,this.canvas.width)
        }
        
    }
    drawCircle(fillStyle, minSize, maxSize,index,x) {
        this.ctx.beginPath();
        this.ctx.fillStyle = fillStyle;
        this.ctx.arc(x,this.canvas.height/10*index,this.random(minSize,maxSize),0,2*Math.PI);
        this.ctx.fill();
    }
    random(min,max) {
        var num = Math.floor(Math.random()*(max-min)) + min;
        // if min = 10 max = 15 random var = 0.1544465; it will return approzimately 10 because of math.floor
        return num;
      }
    componentDidMount() {
        this.setState({checkedImages:false});
        get("/api/images", { creator_id: this.props.userId}).then((imageObjs) => {
            let reversedImageObjs = imageObjs.reverse();
            reversedImageObjs.map((imageObj) => {
                this.setState({ images: this.state.images.concat([imageObj]) });
            });
            this.setState({checkedImages:true});
            
            this.calculateLikes();
            if (imageObjs.length > 0) {
                this.setState({infoActive:true});
            }
            if (window.screen.height > document.body.scrollHeight) {
                this.canvas.height = window.screen.height;  
    
            } else {
                this.canvas.height = document.body.scrollHeight;
            }   
                this.canvas.width = window.innerWidth;
                this.ctx = this.canvas.getContext("2d");
                this.setHeight(this.canvas.width,this.canvas.height);
                this.ctx.globalAlpha = .85;
                this.startBackground();
        });
        if (window.screen.height > document.body.scrollHeight) {
            this.canvas.height = window.screen.height;  

        } else {
            this.canvas.height = document.body.scrollHeight;
        }   
            this.canvas.width = window.innerWidth;
            this.ctx = this.canvas.getContext("2d");
            this.setHeight(this.canvas.width,this.canvas.height);
            this.ctx.globalAlpha = .85;
            this.startBackground();
        
    }

    render() {
        let rankNames = ['Cave Painter','Bob Ross Stan','Neighborhood Picasso','Renaissance Maestro'];
        let rankName = '';
        let nextRank = 0
        let count = this.props.numCreated;
        if (count >= 0 && count < 5) {
            rankName = rankNames[0];
            nextRank = 5;
        } else if (count >= 5 && count < 20) {
            rankName = rankNames[1];
            nextRank = 20;
        } else if (count >= 20 && count < 50) {
            rankName = rankNames[2];
            nextRank = 50;
        } else if (count >= 50) {
            rankName = rankNames[3];
            nextRank = 1000;

        }   

        if (this.props.name !== '') {
            var stringArray = this.props.name.split(" ");
            var name = stringArray[0];
            var output = name;
        } else {
            var output = ''
        }

        let imageList = null;
        let infoBox = null;
        const hasImages = this.state.images.length !== 0;
        if (hasImages) {
            imageList = this.state.images.map((imageObj) => (
                <Card className = "Image"
                    key={`Card_${imageObj._id}`}
                    _id={imageObj._id.toString()}
                    creator_name={imageObj.creator_name}
                    creator_id={imageObj.creator_id}
                    content={imageObj.content}
                    loadId={imageObj.loadId}
                    likedBy={imageObj.likedBy}
                    handleClick={this.props.handleClick}
                    imageTitle={imageObj.imageTitle}
                    componentDidMount={this.componentDidMount}
                    render={this.render}
                    handleDelete={this.handleDelete}
                    hasDelete={true}
                    userId={this.props.userId}
                    galleryLoaded={true}
                    shortName = {output}

                    />
            ));

        } else if (this.state.checkedImages){
            imageList = <div className="Text-message">No images in your gallery. Login, create, and save your images to see them here!</div>;
        } else {
            imageList = <div className="Text-message">Loading images...</div>;
        }

        if (this.state.infoActive) {
            infoBox =   <div className="galleryInfo-wrapper">
                            <div className="title-wrapper">
                            <a className="rank-icon" /*{this.props.content}*/ >
                                    <span className="Icon-tooltip">Rank: {rankName}</span>
                                    <span className="Icon-tooltip-2">Canvases to next rank: {nextRank-this.props.numCreated}</span>
                                    <i className="fa fa-graduation-cap"></i>
                                </a>
                            <div className="galleryTitle">{output.toLowerCase()}'s gallery</div>
                            </div>
                            <div className="text-wrapper">
                                <div className="closeInfo" onClick={this.toggleInfoActive}><i className="fa fa-close"></i></div>
                                <div className="galleryInfo">Here you can delete, download, or reload saved canvases!</div>
                                <div className="counterWrapper">
                                <div className="canvasCounter">space: {this.state.images.length}/10</div>
                                <div className="likeCounter">canvases created: {this.props.numCreated}</div>
                                <div className="likeCounter">likes: {this.state.totalLikes}</div>
                                </div>
                            </div>
                        </div>
        }
        
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
                <canvas className="newBackground"
                    style={{height:this.state.height,width:this.state.width}}
                    ref={canvas => this.canvas = canvas}
                 />
                <div className="galleryWrapper">
                    
                    <div className="Image-container">
                        {imageList}
                        {infoBox}
                    </div>
                </div>
            </>
        );
    }
}

export default Gallery;