import React, {Component} from "react";
import "./App.css";

class App extends Component {
    render() {
        return(
            <div className="App">
                <a href="http://localhost:8888">
                <button>Click here to log in to Spotify</button>
                </a>
            </div>
        );
    }
}

export default App;