import React, { Component } from "react";
import "./Card.css"
import {Link} from "@reach/router";
import { get } from "../../utilities";


class Card extends Component {
    constructor(props) {
        super(props);
        this.state = {
            content: '',
            delModalActive: false,
            downModalActive: false,
            likeable: true,
            tempLiked: false,
        }
        this.toggleDelModal = this.toggleDelModal.bind(this);
        this.delete = this.delete.bind(this);
        this.toggleDownModal = this.toggleDownModal.bind(this);
        this.setDownload = this.setDownload.bind(this);
        this.handleLikeable = this.handleLikeable.bind(this);
    }

    handleLikeable(id) {
        if (this.props.userId == undefined) {
            window.alert('Please login to like canvases');
            return;
        } else {
            this.setState({tempLiked:true});
            this.props.handleLike(id);
        }
        
    }

    toggleDelModal() {
        if (this.state.delModalActive) {
            this.setState({delModalActive:false});
        } else {
            this.setState({delModalActive:true});
        }
    }
    toggleDownModal() {
        if (this.state.downModalActive) {
            this.setState({downModalActive:false});
        } else {
            this.setState({downModalActive:true});
        }
    }
    setDownload() {
        this.imgFile.setAttribute('href', this.props.content);
        this.toggleDownModal();
    }
    delete() {
        this.toggleDelModal();
        this.props.handleDelete(this.props.creator_id,this.props._id);
    }

    componentDidMount() {
        if (this.props.likedBy.includes(this.props.userId)) {
            this.setState({likeable:false});
        }
        const imgLink = this.props.content;
        this.canvas.width = 450;
        this.canvas.height = 300;
        var ctx = this.canvas.getContext("2d");
        var transferImage = new Image();
        transferImage.onload = function() {
            ctx.drawImage(transferImage, 0, 0,450,300);
          };
        transferImage.src = imgLink;
        // this.setState({loadId:this.props.loadId});
    }

    

    render () {

        let deleteButton = null;
        if (this.props.hasDelete) {
            deleteButton =  <div className="Icon-wrapper" onClick={this.toggleDelModal}>    
                                <span className="Icon-tooltip">Delete</span>
                                <i className="fa fa-trash"></i>
                            </div>
        }
        let likeButton = null;

        if (this.props.galleryLoaded) {
            likeButton = <a className="Like-wrapper-gallery">
                            <span className="helper2"><i className="fa fa-heart"></i></span>
                            {this.props.likedBy.length}
                         </a>
        } else if (this.state.likeable && this.state.tempLiked) {
            likeButton = <a className="Like-wrapper-off">
                            <span className="helper2"><i className="fa fa-heart"></i></span>
                            {this.props.likedBy.length+1}
                         </a>

        } else if (!this.props.likedBy.includes(this.props.userId) || this.props.userId == undefined) {
            likeButton = <a className="Like-wrapper" onClick={() => handleLikeable(this.props._id)}>
                            <span className="helper"><i className="fa fa-heart-o"></i></span>
                            <span className="helper2"><i className="fa fa-heart"></i></span>
                            {this.props.likedBy.length}
                         </a>
        } else {
            likeButton = <a className="Like-wrapper-off">
                            <span className="helper2"><i className="fa fa-heart"></i></span>
                            {this.props.likedBy.length}
                         </a>
        }
        let rankNames = ['Cave Painter','Bob Ross Stan','Neighborhood Picasso','Renaissance Maestro'];
        let rankName = '';
        let count = this.props.canvasTotal;
        if (count >= 0 && count < 5) {
            rankName = rankNames[0];
        } else if (count >= 5 && count < 20) {
            rankName = rankNames[1];
        } else if (count >= 20 && count < 50) {
            rankName = rankNames[2];
        } else if (count >= 50) {
            rankName = rankNames[3];
        }


        let creatorBox = null;
        if (!this.props.galleryLoaded) {
            creatorBox =    <div className="Creator-info">
                                <div className="Creator-name">created by: {this.props.shortName}</div>
                                <div className="Creator-stats">canvases created: {this.props.canvasTotal}</div>
                                <div className="Creator-stats">rank: {rankName}</div>

                            </div>
        }
        
        const { handleClick,handleDelete,handleLike } = this.props;
        const { handleLikeable} = this;
        return (
            <div>
                <div className={this.state.delModalActive ? "Card-Canvas-modal" : "Card-Canvas-modal-hidden"} ref={modal => this.modal = modal}>
                        <div className="Card-Modal-content">
                            Are you sure?
                            <button className="halfButton-Card" style={{margin:'5px'}} onClick={this.delete}>delete</button>
                            <button className="halfButton-Card" onClick={this.toggleDelModal}>cancel</button>

                        </div>
                    </div>

                    <div className={this.state.downModalActive ? "Card-Canvas-modal" : "Card-Canvas-modal-hidden"} ref={modal => this.modal = modal}>
                        <div className="Card-Modal-content">
                            Are you sure?
                            <a className="halfButton-Card" style={{margin:'5px',textDecoration:'none'}} onClick={this.toggleDownModal} href='#' ref={imgFile => this.imgFile = imgFile} download={this.props.imageTitle + '.png'}>download</a>
                            <button className="halfButton-Card" onClick={this.toggleDownModal}>cancel</button>

                        </div>
                    </div>

                <div className="Card-container">
                    <div className="Info-box">
                        <div className="Creator-wrapper">
                            {likeButton}
                            {creatorBox}
                            
                        </div>
                        {/* <div className="Delete" onClick={this.handleDelete}>Delete Image</div> */}
                        <div className="Gallery-bar">
                            <div className="Icon-list">
                                {/* <div className="Icon-wrapper" onClick={() => handleDelete(this.props.creator_id,this.props._id)}> */}
                                {deleteButton}
                                <a className="Icon-wrapper" onClick={this.setDownload} /*{this.props.content}*/ >
                                    <span className="Icon-tooltip">Download</span>
                                    <i className="fa fa-download"></i>
                                </a>
                                <Link to='/create' onClick={() => handleClick(this.props._id)}>
                                <div className="Icon-wrapper">
                                    <span className="Icon-tooltip">Load Session</span>
                                    <i className="fa fa-edit"></i>
                                </div>
                                </Link>
                            </div>
                            
                        </div>
                        <div className="Gallery-title">{this.props.imageTitle}</div>
                    </div>
                    <canvas
                        className="Gallery-canvas"
                        ref={canvas => this.canvas = canvas}
                    />

                </div>
            </div>
        )
    }
}

export default Card;