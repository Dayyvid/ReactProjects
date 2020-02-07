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
            var topGenreObject = new Object();
            response.items.forEach(function(element) {
                topArtistsArray.push(element.name)
                element.genres.forEach(function(genre) {
                    if (genre in topGenreObject){
                        topGenreObject[genre] += 1;
                    } else {
                        topGenreObject[genre] = 1;
                    }
                })
            });

            var sortedTopGenreArray = [];
            for(var genre in topGenreObject){
                sortedTopGenreArray.push([genre, topGenreObject[genre]]);
            }
            sortedTopGenreArray.sort(function(a,b){
                return b[1] - a[1];
            });

            this.setState({
                clickedTopArtistsFlag: true,
                topArtists: topArtistsArray.slice(0,6),
                topGenres: sortedTopGenreArray.slice(0,6),
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
            <button onClick={() => this.getMyTopArtists()}> Get Top Artists and Genres</button>;

            const topGenresRender = this.state.clickedTopArtistsFlag?
            this.state.topGenres.map((element) => <li key = {element}>{element[0]} : {element[1]}</li>): 
            null;

            return(
                <div>
                    <h1> Hello {this.state.userName}!</h1>
                    <img src = {this.state.userImage}></img>
                    <br></br>
                    <div className="topArtistsRender">
                        <ul> {topArtistsRender} </ul>
                    </div>
                    <div className="topGenresRender">
                        <ul> {topGenresRender} </ul>
                    </div>
                </div>
            );
        }
    }
}

export default App;