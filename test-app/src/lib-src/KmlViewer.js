//-----------------------------------------------------------------------------
//
// XMLDocument : The XMLDocument interface represents an XML document.
//               https://developer.mozilla.org/en-US/docs/Web/API/XMLDocument
// Document    : The Document interface represents any web page loaded in the browser.          
//               https://developer.mozilla.org/en-US/docs/Web/API/Document
// Element     : Element is the most general base class from which all element objects (i.e. objects that represent elements) in a Document inherit.
//               https://developer.mozilla.org/en-US/docs/Web/API/Element
// Node        : The DOM Node interface is an abstract base class upon which many other DOM API objects 
//               https://developer.mozilla.org/en-US/docs/Web/API/Node
// 
// https://reactjs.org/blog/2018/06/07/you-probably-dont-need-derived-state.html#when-to-use-derived-state
// https://reactjs.org/blog/2018/03/27/update-on-async-rendering.html#fetching-external-data-when-props-change

// PROPS:
//
//  kmlText  |  kmlFile
//  googleMap : window.google must be defined!
//  
import React, { Component } from "react"
//import {parseFromString} from "./parser"
import * as KML from './kml'
import './KmlViewer.css'

export default class KmlViewer extends Component{
    constructor(){
        super();
        // State
        this.state = { 
            error       : 'data is empty',
            kmlText     : null,
            data        : null,
            googleMap   : null
        }
    }
    
    static getDerivedStateFromProps(props, state) {
        let stateChanges = {}

        // UPDATE KML DATA?
        let kmlText = props.kmlText
        if(state.kmlText !== kmlText){ // memoization 
            stateChanges.kmlText= kmlText
            try{
                // Verify KML text
                if(!kmlText) throw String('data is empty')

                // UPDATE DATA
                console.warn('KmlViewer: update KML')

                // Parse: DOM Document => JavaScript object
                let data = KML.parseFromString(kmlText)
        
                // Set state changes
                stateChanges.error  = null;  
                stateChanges.data   = data;
                
            }catch(error){
                stateChanges.error = error.toString()
                stateChanges.data  = null
            }
        }

        // SAVE MAP IN THE STATE
        if(state.googleMap !== props.googleMap)
            stateChanges.googleMap = props.googleMap

        // UPDATE MAP DRAWINGS?
        if(stateChanges.data!==undefined || stateChanges.googleMap!==undefined ){
            console.warn('UPDATE DRAWINGS REQUIRED')
            // Remove old
            if(state.data) state.data.updateMapDrawing(null)
            // Create new
            let dataNew = stateChanges.data?stateChanges.data:state.data
            if(dataNew) dataNew.updateMapDrawing(props.googleMap)
        }

        console.log('KmlViewer.getDerivedStateFromProps',stateChanges,state, props)

        return stateChanges;
    }

    componentWillUnmount(){
        console.log('KmlViewer.componentWillUnmount');
        if(this.state.data) this.state.data.updateMapDrawing(null)
    }

    // RENDER DATA
    renderContainer(obj, key){
        var rows=[]

        if(obj.features){
            obj.features.forEach((feature,i)=>{
                if(feature instanceof KML.Container){
                    rows.push(this.renderContainer(feature,i))
                }else if(feature instanceof KML.Placemark){
                    rows.push(this.renderPlacemark(feature,i))
                }
            })
        }
        // Render
        return (<div key={key} className="kml-viewer-folder"> 
            <div className="kml-viewer-name">{obj.name}</div>
            {rows}
        </div>);
    }

    renderPlacemark(obj, key){
        // Geometry type
        let geotype = 'no geometry';
        if(obj.geometry instanceof KML.Point){
            geotype = 'Point'
        }
        if(obj.geometry instanceof KML.LineString){
            geotype = 'LineString'
        }
        if(obj.geometry instanceof KML.Polygon){
            geotype = 'Polygon'
        }
        // Selected
        let cls = obj.isSelected ? 'kml-viewer-placemark selected' : 'kml-viewer-placemark';
        // Render
        return (
        <div key={key} className={cls} onClick={()=>this.onPlacemarkClick(obj)}>
            <span className="kml-viewer-geotype" tag={geotype}>{geotype}</span>
            <span className="kml-viewer-geoname">{obj.name}</span>
            <i className="kml-viewer-locate" onClick={e=>{e.stopPropagation();this.locatePlacemark(obj)}}></i>
        </div>);
    }
    renderData(){
        let data = this.state.data;
        if(!data) 
            return null;

        return this.renderContainer(data, 0)
    }

    render() {
        console.log('KmlViewer.render')

        if(this.state.error){
            var htmlError = <div className="kml-viewer-error">{this.state.error}</div>;
        }

        return (
            <div className='kml-viewer'>
                {htmlError}
                {this.renderData()}
            </div>
        );
    }

    //--------------------------------------------------
    // HANDLERS
    onPlacemarkClick(obj){
        // Toggle selected
        obj.isSelected = obj.isSelected?false:true;
        obj.updateMapDrawing(this.state.googleMap);
        // Refresh ui
        this.setState({data:this.state.data})
    }

    locatePlacemark(obj){
        obj.locate(this.state.googleMap)
    }

}