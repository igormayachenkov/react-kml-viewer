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
import React, { Component } from "react";
import { parseFromDOMDocument } from "./parser";
import * as KML from './kml';
import './KmlViewer.css';
export default class KmlViewer extends Component {
  constructor() {
    super(); // State

    this.state = {
      error: 'data is empty',
      data: null,
      dataLength: 0
    };
  }

  static getDerivedStateFromProps(props, state) {
    console.log('KML.getDerivedStateFromProps', state, props);
    let kmlText = props.kmlText;

    try {
      // Verify KML text
      if (!kmlText) throw 'kmlText is undefined';
      if (state.dataLength == kmlText.length) return null; // memoization 
      // UPDATE DATA
      // Clear old

      KmlViewer.removeAllDrawings(state.data); // Parse: string => DOM Document

      let parser = new DOMParser();
      if (!parser) throw 'DOMParser is unsupported';
      let domDocument = parser.parseFromString(kmlText, "text/xml"); // Parse: DOM Document => JavaScript object

      let data = parseFromDOMDocument(domDocument);
      return {
        error: null,
        data: data,
        dataLength: kmlText.length
      };
    } catch (error) {
      return {
        error: error.toString(),
        data: null,
        dataLength: 0
      };
    }
  }

  componentWillUnmount() {
    console.log('KML.componentWillUnmount');
    KmlViewer.removeAllDrawings(this.state.data);
  } // RENDER DATA


  renderFolder(obj, key) {
    // Placemarks
    var contentHTML = obj.placemarks ? obj.placemarks.map((pm, i) => this.renderPlacemark(pm, i)) : null; // Folders

    var foldersHTML = obj.folders ? obj.folders.map((folder, i) => this.renderFolder(folder, i)) : null; // Render

    return /*#__PURE__*/React.createElement("div", {
      key: key,
      className: "kml-viewer-folder"
    }, /*#__PURE__*/React.createElement("div", {
      className: "kml-viewer-name"
    }, obj.name), contentHTML, foldersHTML);
  }

  renderPlacemark(obj, key) {
    // Geometry type
    let geotype = 'no geometry';

    if (obj.geometry instanceof KML.Point) {
      geotype = 'Point';
    }

    if (obj.geometry instanceof KML.LineString) {
      geotype = 'LineString';
    }

    if (obj.geometry instanceof KML.Polygon) {
      geotype = 'Polygon';
    } // Selected


    let cls = obj.isSelected ? 'kml-viewer-placemark selected' : 'kml-viewer-placemark';
    let locate = obj.isSelected ? /*#__PURE__*/React.createElement("i", {
      className: "kml-viewer-locate",
      onClick: e => {
        e.stopPropagation();
        this.locatePlacemark(obj);
      }
    }) : null; // Render

    return /*#__PURE__*/React.createElement("div", {
      key: key,
      className: cls,
      onClick: () => this.onPlacemarkClick(obj)
    }, /*#__PURE__*/React.createElement("span", {
      className: "kml-viewer-geotype",
      tag: geotype
    }, geotype), /*#__PURE__*/React.createElement("span", {
      className: "kml-viewer-geoname"
    }, obj.name), locate);
  }

  renderData() {
    let data = this.state.data;
    if (!data) return null;
    return this.renderFolder(data, 0);
  }

  render() {
    console.log('KML.render');

    if (this.state.error) {
      var htmlError = /*#__PURE__*/React.createElement("div", {
        className: "kml-viewer-error"
      }, this.state.error);
    }

    return /*#__PURE__*/React.createElement("div", {
      className: "kml-viewer"
    }, htmlError, this.renderData());
  } //--------------------------------------------------
  // HANDLERS


  onPlacemarkClick(obj) {
    // Toggle selected
    obj.isSelected = obj.isSelected ? false : true;
    this.updateMapDrawing(obj); // Refresh

    this.setState({
      data: this.state.data
    });
  }

  updateMapDrawing(obj) {
    let map = this.props.googleMap;
    if (!map) return;
    if (obj.isSelected && !obj.drawing) this.createDrawing(obj, map);
    if (!obj.isSelected && obj.drawing) KmlViewer.removeDrawing(obj);
  } // MAP DRAWINGS


  createDrawing(obj, map) {
    //console.log('Create drawing');
    obj.drawing = {};
    let geometry = obj.geometry;
    if (!geometry) return;

    if (geometry instanceof KML.Point) {
      let coord = geometry.coordinates;
      let pos = {
        lat: coord[1],
        lng: coord[0]
      };
      obj.drawing.marker = new window.google.maps.Marker({
        map: map,
        position: pos,
        title: obj.name
      });
    }

    if (geometry instanceof KML.LineString) {
      let coord = geometry.coordinates; // verified by KmlParser

      let path = coord.map(x => ({
        lat: x[1],
        lng: x[0]
      }));
      obj.drawing.polyline = new window.google.maps.Polyline({
        map: map,
        path: path,
        geodesic: true,
        strokeColor: '#FF0000',
        strokeOpacity: 1.0,
        strokeWeight: 5
      });
    }

    if (geometry instanceof KML.Polygon) {
      let coord = geometry.outerCoordinates; // verified by KmlParser

      let path = coord.map(x => ({
        lat: x[1],
        lng: x[0]
      }));
      obj.drawing.polygon = new window.google.maps.Polygon({
        map: map,
        paths: path,
        strokeColor: "#FF0000",
        strokeOpacity: 0.8,
        strokeWeight: 3,
        fillColor: "#FF0000",
        fillOpacity: 0.25
      });
    }
  }

  static removeDrawing(obj) {
    //console.log('Remove drawing');
    if (obj.drawing) {
      if (obj.drawing.marker) obj.drawing.marker.setMap(null);
      if (obj.drawing.polyline) obj.drawing.polyline.setMap(null);
      if (obj.drawing.polygon) obj.drawing.polygon.setMap(null);
      obj.drawing = null;
    }
  }

  static removeDrawingRecursive(obj) {
    KmlViewer.removeDrawing(obj);
    if (obj.placemarks) obj.placemarks.forEach(item => KmlViewer.removeDrawingRecursive(item));
    if (obj.folders) obj.folders.forEach(item => KmlViewer.removeDrawingRecursive(item));
  }

  static removeAllDrawings(data) {
    console.log('KML.removeAllDrawings', data);
    if (data) KmlViewer.removeDrawingRecursive(data);
  }

  locatePlacemark(obj) {
    let map = this.props.googleMap;
    if (!map) return;

    if (obj.drawing.marker) {
      map.panTo(obj.drawing.marker.position);
    } else if (obj.drawing.polyline) {
      var bounds = new window.google.maps.LatLngBounds();
      obj.drawing.polyline.getPath().forEach(pt => {
        bounds.extend(pt);
      });
      map.panToBounds(bounds);
    } else if (obj.drawing.polygon) {
      var bounds = new window.google.maps.LatLngBounds();
      obj.drawing.polygon.getPath().forEach(pt => {
        bounds.extend(pt);
      });
      map.panToBounds(bounds);
    }
  }

}