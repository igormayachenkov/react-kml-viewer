
import React, { Component } from 'react';
import './App.css';
import KmlViewer from './lib-src/KmlViewer.js'
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

            window.setTimeout(()=>{
    
                const google = window.google;
                let map = new google.maps.Map(
                    document.getElementById("map"), 
                    {
                        center: {lat: 55.802, lng: 37.572}, // Igor's home
                        zoom: 13,
                    }
                );
                console.log('The map has been created')
                
                this.setState({
                    mapApiStatus : 'loaded',
                    googleMap    : map     
                })

            },2000);//timeout
    
        });
    }

    render(){
        console.log('APP.render')

        // if(!this.state.googleMap) return (
        //     <div className='loading'>The map is loading...</div>
        // );

        return (
            <div className="App">
            
            <div className="layout-info">
                <div>Google maps API status: {this.state.mapApiStatus}</div>
                <KmlViewer kmlText={kmlSample} googleMap={this.state.googleMap}/> 
            </div>

            <div className="layout-map">
                <span>The map is loading...</span>
                <div id='map'></div>
            </div>

            </div>
        );
    }
}


export default App;
