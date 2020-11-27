
import React, { useState } from 'react';
import './App.css';
import {KmlViewer}  from './lib-src/KmlViewer.js'
import GoogleMapReact from 'google-map-react';

import kmlSample from './test-data.js' 

function App() {
  let center = {lat: 55.802, lng: 37.572} // Igor's home

  const [greeting, setGreeting] = useState(
    'Hello Function Component!'
  );
  const [api, setApi] = useState(null);

  const handleApiLoaded = (map, maps) => {
      console.log('Maps Api Loaded', map, maps);
      setApi({map:map, maps:maps})
      setGreeting('Maps Api Loaded')
  }
  
  return (
    <div className="App">
      
      <div className="layout-info">
        <h1>{greeting}</h1>
        <KmlViewer kmlText={kmlSample} googleMapsAPI={api}/> 
      </div>

      <div className="layout-map">
      <GoogleMapReact
            bootstrapURLKeys={{ key: 'AIzaSyAeM9hAb_UitOiVfNKxxR3wIWwnvU7m-LY' }}
            defaultCenter={center}
            defaultZoom={13}
            yesIWantToUseGoogleMapApiInternals
            onGoogleApiLoaded={({ map, maps }) => handleApiLoaded(map, maps)}
            />
      </div>

    </div>
  );
}


export default App;
