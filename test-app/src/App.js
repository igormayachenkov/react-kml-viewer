
import React, { Component } from 'react';
import './App.css';
import KmlViewer from './lib-src/KmlViewer.js'
import * as KML from './lib-src/kml.js'

import { Loader }    from "google-maps"

import kmlSample from './test-data.js' 

class App extends Component{
    constructor(){
        super()
        this.state={
            mapApiStatus : 'loading...',
            map    : null,
            kml          : null
        }
    }

    componentDidMount(){
        // Load kml
        this.parseKml(kmlSample)

        // Load map
        this.loadGoogleMapsAPI()
    }
    parseKml(kmlText){
        try{
            // Verify KML text
            if(!kmlText) throw String('data is empty')

            // UPDATE DATA
            console.warn('App: update KML')

            // Parse: text => JavaScript object
            let kml = KML.parseFromString(kmlText)
    
            // Set state changes
            this.setState({
                error : null,  
                kml   : kml
            })
        }catch(error){
            this.setState({
                error : error.toString(),
                kml   : null
            })
        }

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
                    map    : map     
                })

            },2000);//timeout
    
        });
    }

    render(){
        console.log('APP.render')

        // if(!this.state.map) return (
        //     <div className='loading'>The map is loading...</div>
        // );
        if(this.state.error){
            var htmlError = <div className="kml-viewer-error">{this.state.error}</div>;
        }


        return (
            <div className="App">
            
            <div className="layout-info">
                <div>Google maps API status: {this.state.mapApiStatus}</div>
                {htmlError}
                <KmlViewer kml={this.state.kml} map={this.state.map}/> 
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
