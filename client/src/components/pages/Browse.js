import React, { Component } from "react";
import GoogleLogin, { GoogleLogout } from "react-google-login";
import { Link } from "@reach/router";
import "../../utilities.css";
import NavBar from "../modules/NavBar";
import Card from "../modules/Card"
import { get, post } from "../../utilities";
import "./Gallery.css";
import { Redirect } from "@reach/router";


class Browse extends Component {
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
            userList: [],
            contributors: [],
      };
        this.startBackground = this.startBackground.bind(this);
        this.drawCircle = this.drawCircle.bind(this);
        this.handleDelete = this.handleDelete.bind(this);
        this.setHeight = this.setHeight.bind(this);
        this.toggleInfoActive = this.toggleInfoActive.bind(this);
        this.handleLike = this.handleLike.bind(this);
        this.getTotalFromId = this.getTotalFromId.bind(this);
        this.getShortName = this.getShortName.bind(this);
    }
    getShortName(name) {
        if (name !== '') {
            var stringArray = name.split(" ");
            var newName = stringArray[0];
            var output = newName;
            return output
        } else {
            var output = ''
            return output;
        }
    }
    getTotalFromId(id) {
        let obj = undefined;
        for (var i=0; i < this.state.userList.length; i++) {
            if (this.state.userList[i]._id === id) {
                if (!this.state.contributors.includes(this.state.userList[i].name)) {
                    let newList = this.state.contributors;
                    newList.push(this.state.userList[i].name);
                    this.setState({contributors:newList});
                }
                 obj = this.state.userList[i];
                 let total = obj.numCreated;
                 return total
            }
        }
    }
    handleLike(id) {
        if (this.props.userId == undefined) {
            window.alert('Please login to like canvases');
        } else {
            const ObjectId = mongoose.Types.ObjectId;
            get("/api/images/update",{_id:ObjectId(id)}).then(() => {
            });
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
        console.log(this.canvas.height)
        let extra = 0;
        if (this.canvas.height > 1000) {
            extra = Math.floor((this.canvas.height - 1000) / 225)
        }
        for (i=0;i<(11+extra);i++) {
            this.drawCircle(fillColorsList[i % 5],25,this.canvas.width/6,i,0,extra)
        }
        for (i=0;i<(11+extra);i++) {
            this.drawCircle(fillColorsList[i % 5],25,this.canvas.width/6,i,this.canvas.width,extra)
        }
        
    }
    drawCircle(fillStyle, minSize, maxSize,index,x,extra) {
        this.ctx.beginPath();
        this.ctx.fillStyle = fillStyle;
        this.ctx.arc(x,this.canvas.height/(10+extra)*index,this.random(minSize,maxSize),0,2*Math.PI);
        this.ctx.fill();
    }
    random(min,max) {
        var num = Math.floor(Math.random()*(max-min)) + min;
        // if min = 10 max = 15 random var = 0.1544465; it will return approzimately 10 because of math.floor
        return num;
      }
    componentDidMount() {
        
        this.setState({checkedImages:false});
        get("/api/images/all", {}).then((imageObjs) => {
            let reversedImageObjs = imageObjs.reverse();
            reversedImageObjs.map((imageObj) => {
                this.setState({ images: this.state.images.concat([imageObj]) });
            if (imageObjs.length > 0) {
                this.setState({infoActive:true});
            }
            });
            get("/api/user/all", {}).then((userObjs) => {
                this.setState({userList:userObjs})
                this.setState({checkedImages:true});
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
                    hasDelete={false}
                    handleLike={this.handleLike}
                    userId={this.props.userId}
                    galleryLoaded={false}
                    shortName={this.getShortName(imageObj.creator_name)}
                    canvasTotal={this.getTotalFromId(imageObj.creator_id)}
                    />
            ));

        } else if (this.state.checkedImages){
            imageList = <div className="Text-message">No images in the collection.</div>;
        } else {
            imageList = <div className="Text-message">Loading images...</div>;
        }

        if (this.state.infoActive) {
            infoBox =   <div className="galleryInfo-wrapper">
                            <div className="galleryTitle">the collection</div>
                            <div className="text-wrapper">
                                <div className="closeInfo" onClick={this.toggleInfoActive}><i className="fa fa-close"></i></div>
                                <div className="galleryInfo">Here you can view and interact with creations from the community!</div>
                                <div className="counterWrapper">
                                <div className="canvasCounter">canvases loaded: {this.state.images.length}</div>
                                <div className="canvasCounter">contributors: {this.state.contributors.length}</div>
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

export default Browse;