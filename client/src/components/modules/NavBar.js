import React, { Component } from "react";
import GoogleLogin, { GoogleLogout } from "react-google-login";
import { post } from "../../utilities";

import "./NavBar.css";
import { Link } from "@reach/router";
import logo from "../../../dist/cursiveLogoSmall.png"
import logoback from "../../../dist/cursiveLogoSmall_noline.png"


const GOOGLE_CLIENT_ID = "473302145912-uucgul3s3cpn156ma18qqt7gggaea337.apps.googleusercontent.com";

class NavBar extends Component {
    constructor(props) {
        super(props);
    
        this.state = {
        };
      }

    componentDidMount(){

    }
    render() {
        if (this.props.name !== '') {
            var stringArray = this.props.name.split(" ");
            var name = stringArray[0];
            var output = 'logged in as ' + name +'\u00A0'+'\u00A0';
        } else {
            var output = ''
        }
               
        return (
            <div className="NavBar-wrapper"> 
                <div className="NavBar-title">
                    <div className="Nav-text">
                        {output}
                    {this.props.loggedIn ? (
                    <GoogleLogout
                        clientId={GOOGLE_CLIENT_ID}
                        buttonText="Logout"
                        onLogoutSuccess={this.props.handleLogout}
                        onFailure={(err) => console.log(err)}
                        render={(renderProps)=> (
                        <button className="Login-button-nav" onClick={renderProps.onClick}>logout</button>
                        )}
                    />
                    ) : (
                    <GoogleLogin
                        clientId={GOOGLE_CLIENT_ID}
                        buttonText="Login"
                        onSuccess={this.props.handleLogin}
                        onFailure={(err) => console.log(err)}
                        render={(renderProps)=> (
                        <button className="Login-button-nav" onClick={renderProps.onClick}>login</button>
                        )}
                    />
                    )}
                    </div>
                    <div className="Link-wrapper">
                    <Link to='/create' className='Page-link-nav'>create</Link>

                    <Link to='/gallery' className='Page-link-nav'>my gallery</Link>

                    <Link to='/browse' className='Page-link-nav'>browse</Link>

                    <Link to='/' className='Page-link-nav-logo'>
                            <img src={logoback} className="Logo-box-small"></img>
                            <img src={logo} className="Logo-box-small-back"></img>
                    </Link>
                    
                    </div>
                </div>
            </div>
        );
    }
}

export default NavBar;