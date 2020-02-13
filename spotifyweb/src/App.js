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
            personalMusicInfoMode: '',
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
    userPickedFromDropdown(mode) {
        this.setState({
            personalMusicInfoMode: mode
        })
    }

    // if choose top artist/genre
    render() {
        var displayText = '';
        
        if(!this.state.gotUserInfo){
            this.getMe();
        }
        if(this.state.personalMusicInfoMode === "ArtistsTracksGenres"){
            displayText = "Your top artists, tracks, and genres are: ";
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
                        <Dropdown.Item onClick={() => this.userPickedFromDropdown("ArtistsTracksGenres")}> Get your top artists, tracks, and genres </Dropdown.Item>
                        <Dropdown.Item onClick={() => this.userPickedFromDropdown("Recommendations")}> Get your music recommendations </Dropdown.Item>
                        <Dropdown.Item > c </Dropdown.Item>
                    </Dropdown.Menu>
                </Dropdown>
                <div>
                {displayText}
                {<PersonalMusicInfo mode={this.state.personalMusicInfoMode} />}
                </div>
            </div>
        );
    }
}
class PersonalMusicInfo extends Picker {
    constructor(props){
        super(props);
        this.state = {
            topArtistsArray: [],
            topGenreArray: [],
            topTracksArray: [],
            topArtistsIDArray: [],
            topGenresIDArray: [],
            topTracksIDArray: [],
            recommendedTracks: [],
            numberOfSeedArtists: Math.round(Math.random() * 5),
            seedArtistsIDArray: [],
            seedTracksIDArray: [],
            didRecommend: false,
            recommendedTracksArray: [],
        };
        this.getMyTopArtists();
        this.getMyTopTracks();
    }

    static getDerivedStateFromProps(props, state){
        if(props){
            if(props.mode === "ArtistsTracksGenres"){
                return {
                    didRecommend: false,
                }
            }
        }
        return null;
    }

    getMyTopArtists(){
        spotifyWebApi.getMyTopArtists({time_range: 'medium_term', limit:10})
        .then((response) => {
            var topGenreObjectTemp = new Object();
            var topArtistsArrayTemp = new Array();
            var topArtistsIDArrayTemp = new Array();

            response.items.forEach(function(element) {
                topArtistsArrayTemp.push(element.name);
                topArtistsIDArrayTemp.push(element.id);
                element.genres.forEach(function(genre) {
                    if (genre in topGenreObjectTemp){
                        topGenreObjectTemp[genre] += 1;
                    } else {
                        topGenreObjectTemp[genre] = 1;
                    }

                })
            });

            var sortedTopGenreArrayTemp = new Array();
            for(var genre in topGenreObjectTemp){
                sortedTopGenreArrayTemp.push([genre, topGenreObjectTemp[genre]]);
            }
            sortedTopGenreArrayTemp.sort(function(a,b){
                return b[1] - a[1];
            });

            var seedArtistsIDArrayTemp = new Array();
            var randomIndex = Math.round(Math.random() * 9);

            for(let i = 0; i < this.state.numberOfSeedArtists; i++){
                while (seedArtistsIDArrayTemp.includes(topArtistsIDArrayTemp[randomIndex])){
                    randomIndex = Math.round(Math.random() * 9);
                }
                seedArtistsIDArrayTemp.push(topArtistsIDArrayTemp[randomIndex]);
            }
            this.setState({
                topArtistsArray: topArtistsArrayTemp,
                topGenreArray: sortedTopGenreArrayTemp,
                topArtistsIDArray: topArtistsIDArrayTemp,
                seedArtistsIDArray: seedArtistsIDArrayTemp,
            })
        })
    }
    getMyTopTracks(){
        spotifyWebApi.getMyTopTracks({time_range: 'medium_term', limit:10})
        .then((response) => {
            var topTracksArrayTemp = new Array();
            var topTracksIDArrayTemp = new Array();

            response.items.forEach(function(element){
                topTracksArrayTemp.push(element.name);
                topTracksIDArrayTemp.push(element.id);
            });

            var seedTracksIDArrayTemp = new Array();
            var randomIndex = Math.round(Math.random() * 9);
            for(let i = 0; i < 5 - this.state.numberOfSeedArtists; i++){
                while (seedTracksIDArrayTemp.includes(topTracksIDArrayTemp[randomIndex])){
                    randomIndex = Math.round(Math.random() * 9);
                }
                seedTracksIDArrayTemp.push(topTracksIDArrayTemp[randomIndex]);
            }

            this.setState({
                topTracksArray: topTracksArrayTemp,
                topTracksIDArray: topTracksIDArrayTemp,
                seedTracksIDArray: seedTracksIDArrayTemp,
            })
        })
    }

    getMyRecommendations(){
        // prevents rerenders
        if(this.state.didRecommend){
            return;
        }
        spotifyWebApi.getRecommendations({time_range: 'medium_term', limit:10, seed_artists: this.state.seedArtistsIDArray,
    seed_tracks: this.state.seedTracksIDArray})
        .then((response) => {
            var recommendedTracksArrayTemp = new Array();
            response.tracks.forEach(function(element){
                recommendedTracksArrayTemp.push(element.name);
            })
            this.setState({
                recommendedTracksArray: recommendedTracksArrayTemp,
                didRecommend: true,
            })
            console.log(response);
        })
    }
    
    render() {
        if (this.props.mode === "ArtistsTracksGenres") {
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
        } else if (this.props.mode === "Recommendations"){
            const recommendedTracksRender = this.state.recommendedTracksArray.map((element) => <li key = {element}> {element}</li>)
            this.getMyRecommendations();
            return(
                <div>
                    {recommendedTracksRender}
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