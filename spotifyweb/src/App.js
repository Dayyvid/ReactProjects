import React, {Component} from "react";
import "./App.css";
import Spotify from 'spotify-web-api-js';

const spotifyWebApi = new Spotify();

class App extends Component {
    constructor() {
        super();
        const params = this.getHashParams();
        this.state = {
            loggedIn: params.access_token?  true: false,
            clickedTopArtistsFlag: false,
            gotUserInfo: false,
        }
        if (params.access_token){
            spotifyWebApi.setAccessToken(params.access_token)
        }
    }
    getHashParams() {
        var hashParams = {};
        var e, r = /([^&;=]+)=?([^&;]*)/g,
            q = window.location.hash.substring(1);
        while ( e = r.exec(q)) {
           hashParams[e[1]] = decodeURIComponent(e[2]);
        }
        return hashParams;
    }
    getMe() {
        spotifyWebApi.getMe()
        .then((response) => {
            this.setState({
                userName: response.display_name,
                userImage: response.images[0].url,
                userFollowerCount: response.followers,
                gotUserInfo: true,
            })
        })   
    }
    getMyTopArtists(){
        spotifyWebApi.getMyTopArtists()
        .then((response) => {
            var topArtistsArray = new Array();
            response.items.forEach(function(element) {
                topArtistsArray.push(element.name)
            });
            this.setState({
                clickedTopArtistsFlag: true,
                topArtists: topArtistsArray
            });
        })
    }
    render() {
        if (!this.state.loggedIn){
            return(
                <div className="App">
                    <a href="http://localhost:8888">
                        <button>Click here to log in to Spotify</button>
                    </a>
                </div>
            );
        } else {
            if(!this.state.gotUserInfo){
                this.getMe();
            }
            const topArtistsRender = this.state.clickedTopArtistsFlag? 
            this.state.topArtists.map((element) => <li key = {element}>{element}</li>): 
            <button onClick={() => this.getMyTopArtists()}> Get Top Artists</button>;
            return(
                <div>
                    <h1> Hello {this.state.userName}!</h1>
                    <img src = {this.state.userImage}></img>
                    <br></br>
                    {topArtistsRender}
                </div>
            );
        }
    }
}

export default App;