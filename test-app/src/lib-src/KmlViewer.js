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
//  kml : KML data object
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
        }
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
        let kml = this.props.kml;
        if(!kml) 
            return null;

        return this.renderContainer(kml, 0)
    }

    render() {
        console.log('KmlViewer.render')

        return (
            <div className='kml-viewer'>
                {this.renderData()}
            </div>
        );
    }

    //--------------------------------------------------
    // HANDLERS
    onPlacemarkClick(obj){
        if(obj.setSelected){
            // Toggle selected
            obj.setSelected(obj.isSelected?false:true)

            // Refresh ui
            this.setState(this.state)
        }
    }

    locatePlacemark(obj){
        obj.locate()
    }

}