import React, { Component } from "react";
import Canvas from "../modules/Canvas.js"
import NavBar from "../modules/NavBar"

import "../../utilities.css";
import GameCanvas from "../modules/GameCanvas.js";

class GameMode extends Component {
    constructor(props) {
      super(props);
      this.state = {};
    }

    render() {
        return (
            <>
             <NavBar/>
             <GameCanvas/>

            </>
        );
    }
}

export default GameMode;