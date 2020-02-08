import React, {Component} from "react";
import "./App.css";
import Spotify from 'spotify-web-api-js';
import Dropdown from 'react-bootstrap/Dropdown';
import 'bootstrap/dist/css/bootstrap.min.css';

const spotifyWebApi = new Spotify();

class Picker extends Component{
    constructor() {
        super();
        const params = this.getHashParams();
        this.state = {
            loggedIn: params.access_token?  true: false,
            gotUserInfo: false,
            topArtistsTracksGenresChosen: false,
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
    userPicked() {
        this.setState({
            topArtistsTracksGenresChosen: true,
        })
        // if choose others, then set topArtistsTracksGenresChosen to false
    }

    // if choose top artist/genre
    render() {
        var displayText;
        if(!this.state.gotUserInfo){
            this.getMe();
        }
        return(
            <div>
                <h1> Hello {this.state.userName}!</h1>
                <img src = {this.state.userImage}></img>
                <br></br>
                <Dropdown>
                    <Dropdown.Toggle variant="success" id="Dropdown-basic">
                        Choose an action
                    </Dropdown.Toggle>
                    <Dropdown.Menu>
                        <Dropdown.Item onClick={() => this.userPicked()}> Get your top artists, tracks, and genres </Dropdown.Item>
                        <Dropdown.Item href="#"> b </Dropdown.Item>
                        <Dropdown.Item href="#"> c </Dropdown.Item>
                    </Dropdown.Menu>
                </Dropdown>
                <div>
                {this.state.topArtistsTracksGenresChosen?displayText = "Your top artists, tracks, and genres are: " : ''}
                <TopArtistsTracksGenres chosen={this.state.topArtistsTracksGenresChosen} />
                </div>
            </div>
        );
    }
}
class TopArtistsTracksGenres extends Picker {
    constructor(props){
        super(props);
        this.state = {
            topArtistsArray: [],
            topGenreArray: [],
            topTracksArray: [],
        };
        this.getMyTopArtists();
        this.getMyTopTracks();
    }

    getMyTopArtists(){
        spotifyWebApi.getMyTopArtists()
        .then((response) => {
            var topGenreObject = new Object();
            var topArtistsArray = new Array();

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

            var sortedTopGenreArray = new Array();
            for(var genre in topGenreObject){
                sortedTopGenreArray.push([genre, topGenreObject[genre]]);
            }
            sortedTopGenreArray.sort(function(a,b){
                return b[1] - a[1];
            });
            this.setState({
                topArtistsArray: topArtistsArray.slice(0,5),
                topGenreArray: sortedTopGenreArray.slice(0,5)
            })
        })

    }
    getMyTopTracks(){
        spotifyWebApi.getMyTopTracks()
        .then((response) => {
            var topTracksArray = new Array();
            response.items.forEach(function(element){
                topTracksArray.push(element.name);
            });
            this.setState({
                topTracksArray: topTracksArray.slice(0,5),
            })
        })
    }
    render() {
        if (this.props.chosen === true) {
            const topArtistsRender = this.state.topArtistsArray.map((element) => <li key = {element}>{element}</li>);
            const topGenresRender = this.state.topGenreArray.map((element) => <li key = {element}>{element[0]} : {element[1]}</li>);
            const topTracksRender = this.state.topTracksArray.map((element) => <li key = {element}>{element}</li>);
            return (
                <div>
                    <div className="topArtistsRender">
                        <ul> {topArtistsRender} </ul>
                    </div>
                    <div className="topTracksRender">
                        <ul> {topTracksRender} </ul>
                    </div>
                    <div className="topGenresRender">
                        <ul> {topGenresRender} </ul>
                    </div>
                </div>
            )
        } else {
            return null;
        }
    }
}
class App extends Component {
    constructor(props) {
        super(props);
        const params = this.getHashParams();
        this.state = {
            loggedIn: params.access_token?  true: false,
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
            return (
                <Picker />
            )
        }
    }
}

export default App;