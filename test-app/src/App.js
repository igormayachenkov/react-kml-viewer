import logo from './';
import './App.css';
import {KmlViewer}  from './lib-src/KmlViewer.js'

const kmlSample = 
'<?xml version="1.0" encoding="UTF-8"?>\
<kml xmlns="http://www.opengis.net/kml/2.2" xmlns:gx="http://www.google.com/kml/ext/2.2" xmlns:kml="http://www.opengis.net/kml/2.2" xmlns:atom="http://www.w3.org/2005/Atom">\
<Document>\
    <name>Ngulia</name>\
    <Folder>\
        <name>Bounds</name>\
        <Placemark>\
            <name>test point</name>\
            <Point>\
                <coordinates>37.57209,55.80533</coordinates>\
            </Point>\
        </Placemark>\
        <Placemark>\
            <name>wrong point</name>\
            <Point>\
            </Point>\
        </Placemark>\
        <Placemark>\
            <name>LinearRing.kml</name>\
            <Polygon>\
                <outerBoundaryIs>\
                    <LinearRing>\
                        <coordinates>\
                        -122.365662,37.826988,0 -122.365202,37.826302,0\r\n\
                        -122.364581,37.82655,0  \r\
                        -122.364581  \r\
                        -122.365038,37.827237,0 \n\
                        wrong,value,0\
                        -122.365662,37.826988,0\
                        </coordinates>\
                    </LinearRing>\
                </outerBoundaryIs>\
            </Polygon>\
        </Placemark>\
    </Folder>\
    <Folder>\
        <name>Roads</name>\
        <Folder>\
            <name>Roads subfolder</name>\
        </Folder>\
    </Folder>\
</Document>\
</kml>';


function App() {
  return (
    <div className="App">
      <h1>Test</h1>
      <KmlViewer kmlText={kmlSample} googleMapsAPI={null}/> 
    </div>
  );
}

export default App;
