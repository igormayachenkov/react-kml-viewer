
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
            map          : null,
            kmlText      : kmlSample,
            editorText   : kmlSample,
            kml          : null // parsed data object
        }
        this.onEditorChange = this.onEditorChange.bind(this)
        this.onKmlChange    = this.onKmlChange.bind(this)
        this.onFileSelected = this.onFileSelected.bind(this);

    }

    componentDidMount(){
        // Load map
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
                    map    : map     
                })

            },2000);//timeout
    
        });
    }
    onEditorChange(e){
        this.setState({editorText:e.target.value})
    }
    onFileSelected(event){
        const files = event.target.files; if(!files) return;
        const file = files[0]; if(!file) return;

        const reader = new FileReader();
        reader.addEventListener('load', (event) => {
            //img.src = event.target.result;
            if(event.target.readyState===2){
            //  if(file.name.endsWith('.kml'))
            //     this.insertKML(event.target.result)
            //   else
            //     this.insertGeoJSON(event.target.result)
                this.setState({
                    editorText : event.target.result
                })
            }else{
                console.error("File open error")
            }    
        });
        reader.readAsText(file);
    }

    onKmlChange(kml){
        console.warn('onKmlChange',kml)
        this.setState({kml:kml})
    }

    deselectAll(){
        let kml = this.state.kml
        if(kml){
            kml.deselectAll()
            this.setState({kmlText:this.state.kmlText})
        }
    }

    render(){
        console.log('APP.render')

        return (
            <div className="App">
            
            <div className="layout-info">
                <h1>Kml Text</h1>
                <div>
                    <input type="file"  accept=".kml" onChange={this.onFileSelected}></input>
                </div>
                <textarea 
                    value  ={this.state.editorText}
                    onChange={this.onEditorChange}/>

                <h1>Kml Viewer</h1>
                <div>
                    <button onClick={()=>{this.setState({kmlText:this.state.editorText})}}>Parse from the text</button>
                    {this.state.kmlText &&
                        <button onClick={()=>{this.setState({kmlText:null})}}>Clear data</button>}
                    {this.state.kml &&
                        <button onClick={()=>{this.deselectAll()}}>Deselect all</button>}
                </div>
                <KmlViewer 
                    kmlText     = {this.state.kmlText} 
                    kmlOptions  = {{singleSelection:false}}
                    map         = {this.state.map}
                    onKmlChange = {this.onKmlChange} /> 
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
