
import React, { Component } from 'react';
import './App.css';
import { KmlViewer}  from './lib-src/KmlViewer.js'
import { Loader }    from "google-maps"

import kmlSample from './test-data.js' 

class App extends Component{
    constructor(){
        super()
        this.state={
            mapApiStatus : 'loading...',
            googleMap    : null 
        }
    }

    componentDidMount(){
        this.loadGoogleMapsAPI()
    }

    loadGoogleMapsAPI(){
        const loader = new Loader('AIzaSyAeM9hAb_UitOiVfNKxxR3wIWwnvU7m-LY');
        loader.load().then(() => {
            console.log('Maps API loader finished!')
    
            const google = window.google;
            let map = new google.maps.Map(
                document.getElementById("map"), 
                {
                    center: {lat: 55.802, lng: 37.572}, // Igor's home
                    zoom: 13,
                }
            );
            
            this.setState({
                mapApiStatus : 'loaded',
                googleMap    : map     
            })
    
        });
    }

    render(){
        console.log('render')

        return (
            <div className="App">
            
            <div className="layout-info">
                <div>Google maps API status: {this.state.mapApiStatus}</div>
                <KmlViewer kmlText={kmlSample} googleMap={this.state.googleMap}/> 
            </div>

            <div className="layout-map">
                <div id='map'></div>
            </div>

            </div>
        );
    }
}


export default App;
