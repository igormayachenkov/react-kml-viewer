// KML types
export class Feature {
  constructor() {
    this.name = null;
  }

  updateMapDrawing(map) {}

  locate(map) {}

} // CONTAINER

export class Container extends Feature {
  constructor() {
    super();
    this.features = [];
  }

  updateMapDrawing(map) {
    this.features.forEach(f => f.updateMapDrawing(map));
  }

}
export class Document extends Container {}
export class Folder extends Container {} // PLACEMARK

export class Placemark extends Feature {
  updateMapDrawing(map) {
    if (this.geometry) this.geometry.updateMapDrawing(map, this.name, this.isSelected);
  }

  locate(map) {
    if (this.geometry) this.geometry.locate(map);
  }

} // GEOMETRY (Point,LineString,LinearRing,Polygon,MultiGeometry,Model,gx:Track)

export class Geometry {
  updateMapDrawing(map, name, isSelected) {}

  locate(map) {}

}
export class Point extends Geometry {
  constructor() {
    super();
    this.coordinates = null;
  } // MAP DRAWING


  static getOptions(isSelected) {
    return isSelected ? {
      icon: {
        url: "http://maps.google.com/mapfiles/ms/icons/red-dot.png"
      }
    } : {
      icon: {
        url: "http://maps.google.com/mapfiles/ms/icons/blue-dot.png"
      }
    };
  }

  updateMapDrawing(map, name, isSelected) {
    console.warn('Point[' + name + '].updateMapDrawing'); // Update marker

    if (this.marker) {
      this.marker.setMap(map);
    } else {
      if (map) {
        let coord = this.coordinates;
        let options = Point.getOptions(isSelected);
        options.map = map;
        options.position = {
          lat: coord[1],
          lng: coord[0]
        };
        options.title = name;
        this.marker = new window.google.maps.Marker(options);
      }
    } // Update selected color


    if (this.isSelected !== isSelected) {
      this.isSelected = isSelected;
      if (this.marker) this.marker.setOptions(Point.getOptions(isSelected));
    }
  }

  locate(map) {
    if (map && this.marker) map.panTo(this.marker.position);
  }

}
export class LineString extends Geometry {
  constructor() {
    super();
    this.coordinates = null;
  } // MAP DRAWING


  static getOptions(isSelected) {
    return isSelected ? {
      strokeColor: '#FF0000',
      strokeOpacity: 1.0,
      strokeWeight: 5
    } : {
      strokeColor: '#00008F',
      strokeOpacity: 1.0,
      strokeWeight: 3
    };
  }

  updateMapDrawing(map, name, isSelected) {
    console.warn('LineString[' + name + '].updateMapDrawing'); // Update polyline

    if (this.polyline) {
      this.polyline.setMap(map);
    } else {
      if (map) {
        let coord = this.coordinates; // verified by KmlParser

        let options = LineString.getOptions(isSelected);
        options.map = map;
        options.path = coord.map(x => ({
          lat: x[1],
          lng: x[0]
        }));
        this.polyline = new window.google.maps.Polyline(options);
      }
    } // Update selected color


    if (this.isSelected !== isSelected) {
      this.isSelected = isSelected;
      if (this.polyline) this.polyline.setOptions(LineString.getOptions(isSelected));
    }
  }

  locate(map) {
    if (this.polyline) {
      let bounds = new window.google.maps.LatLngBounds();
      this.polyline.getPath().forEach(pt => {
        bounds.extend(pt);
      });
      map.panToBounds(bounds);
    }
  }

}
export class Polygon extends Geometry {
  constructor() {
    super();
    this.outerCoordinates = null; // outer coordinates

    this.innerCoordinates = []; // inner coordinates
  } // MAP DRAWING


  static getOptions(isSelected) {
    return isSelected ? {
      strokeColor: '#FF0000',
      strokeOpacity: 1.0,
      strokeWeight: 5,
      fillColor: '#FF0000',
      fillOpacity: 0.3
    } : {
      strokeColor: '#00008F',
      strokeOpacity: 1.0,
      strokeWeight: 3,
      fillColor: '#00008F',
      fillOpacity: 0.2
    };
  }

  updateMapDrawing(map, name, isSelected) {
    console.warn('Polygon[' + name + '].updateMapDrawing'); // Update polygon

    if (this.polygon) {
      this.polygon.setMap(map);
    } else {
      if (map) {
        let coord = this.outerCoordinates; // verified by KmlParser

        let path = coord.map(x => ({
          lat: x[1],
          lng: x[0]
        }));
        let options = Polygon.getOptions(isSelected);
        options.map = map;
        options.paths = path;
        this.polygon = new window.google.maps.Polygon(options);
      }
    } // Update selected color


    if (this.isSelected !== isSelected) {
      this.isSelected = isSelected;
      if (this.polygon) this.polygon.setOptions(Polygon.getOptions(isSelected));
    }
  }

  locate(map) {
    if (this.polygon) {
      let bounds = new window.google.maps.LatLngBounds();
      this.polygon.getPath().forEach(pt => {
        bounds.extend(pt);
      });
      map.panToBounds(bounds);
    }
  }

}