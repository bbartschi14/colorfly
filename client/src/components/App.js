import React, { Component } from "react";
import { Router,useHistory } from "@reach/router";
import NotFound from "./pages/NotFound.js";
import HomePage from "./pages/HomePage.js";
import "../utilities.css";
import { get, post } from "../utilities";
import CreateMode from "./pages/CreateMode.js";
import GameMode from "./pages/GameMode.js";
import Gallery from "./pages/Gallery.js";
import NavBar from "../components/modules/NavBar"
import Card from "../components/modules/Card"
import Browse from "./pages/Browse"
/**
 * Define the "App" component as a class.
 */
class App extends Component {
  // makes props available in this component
  constructor(props) {
    super(props);
    this.state = {
      userId: undefined,
      loggedIn: false,
      loggedOut: false,
      loadId: undefined,
      name: '',
      savedImages: 0,
      numCreated: 0,
    };
  }

  componentDidMount() {
    get("/api/whoami").then((user) => {
      if (user._id) {
        // they are registed in the database, and currently logged in.
        this.setState({ userId: user._id });
        this.setState({loggedIn: true});
        this.setState({name:user.name});

      }
    });
  }

  handleClick = (newId) => {
    this.setState({loadId:newId});
  }

  resetLoadId = () => {
    this.setState({loadId:undefined});
  }
  
  handleSave = () => {
    this.setState({savedImages:this.state.savedImages+1});
    this.setState({numCreated:this.state.numCreated+1});

  }
  handleDelete = () => {
    this.setState({savedImages:this.state.savedImages-1});
  }

  handleLogin = (res) => {
    console.log(`Logged in as ${res.profileObj.name}`);
    this.setState({name:res.profileObj.name});
    this.setState({ loggedIn: true });
    const userToken = res.tokenObj.id_token;
    post("/api/login", { token: userToken }).then((user) => {
      this.setState({ userId: user._id });
      this.setState({ numCreated: user.numCreated });
      get("/api/images", { creator_id: this.state.userId}).then((imageObjs) => {
        this.setState({savedImages:imageObjs.length})
      });
    });
    
  };

  handleLogout = () => {
    this.setState({ loggedIn: false, userId:undefined,name:'' });
    post("/api/logout");
    window.alert("Log out successful");
    this.setState({loggedOut:true});
    this.setState({savedImages:0});
  };

  resetLogout () {
    this.setState({loggedOut:false});
  }

  render() {
    return (
      <>
        <Router>
          <HomePage
            path="/"
            handleLogin={this.handleLogin}
            handleLogout={this.handleLogout}
            loggedIn={this.state.loggedIn}
            userId={this.state.userId}
            loggedOut={this.state.loggedOut}
            resetLogout={this.state.resetLogout}
          />
          <CreateMode
            path="/create/"
            userId={this.state.userId}
            loggedIn={this.state.loggedIn}
            userId={this.state.userId}
            handleLogin={this.handleLogin}
            handleLogout={this.handleLogout}
            loggedOut={this.state.loggedOut}
            loadId={this.state.loadId}
            resetLoadId={this.resetLoadId}
            name={this.state.name}
            handleSave={this.handleSave}
            savedImages={this.state.savedImages}


          />
          <GameMode
            path="/play/"
            userId={this.state.userId}
            loggedIn={this.state.loggedIn}
            userId={this.state.userId}
            handleLogin={this.handleLogin}
            handleLogout={this.handleLogout}
            loggedOut={this.state.loggedOut}

          />
          <Gallery
            path="/gallery/"
            userId={this.state.userId}
            loggedIn={this.state.loggedIn}
            handleLogin={this.handleLogin}
            handleLogout={this.handleLogout}
            loggedOut={this.state.loggedOut}
            handleClick={this.handleClick}
            name={this.state.name}
            handleDelete={this.handleDelete}
            numCreated={this.state.numCreated}

          />
          <Browse
            path="/browse/"
            userId={this.state.userId}
            loggedIn={this.state.loggedIn}
            userId={this.state.userId}
            handleLogin={this.handleLogin}
            handleLogout={this.handleLogout}
            loggedOut={this.state.loggedOut}
            handleClick={this.handleClick}
            name={this.state.name}
            handleDelete={this.handleDelete}

          />
          <Card
            path="/card/"
          />
          <NotFound default />
        </Router>
      </>
    );
  }
}

export default App;
