// KML document container

export class Kml{
    constructor(options){
        this.options = {}
        if(options) Object.assign(this.options,options);
        this.root = null 
        this.map  = null
    }
    
    parseFromString(kmlText){
        console.log('KML.parseFromString')

        // Parse: string => DOM Document
        let domParser = new DOMParser();
        if(!domParser) throw String('DOMParser is unsupported')
        let domDocument = domParser.parseFromString(kmlText,"text/xml");
        
        // Verify structure: kml/Document
        let kml = getChildByTagName(domDocument,"kml");
        if(!kml) throw String('KML format error: Element "kml" is not found');
        if(!kml.children || kml.children.length<1) throw String('No children within <kml> tag')
        if(kml.children.length>1) throw String('Only a single root feature allowed within <kml> tag')
        let root = kml.children[0]
        if(root.tagName!=='Document') throw String('The root tag within <kml> must be <Document>')
        
        // Parce root as a Document
        this.root = new Document(this).parse(root)
    }

    setMap(map){ 
        if(this.map===map) return;
        console.log('KML.setMap',map)
        this.map = map 
        if(this.root) this.root.updateMapDrawing()
    }

    deselectAll(){
        if(this.root)
            this.root.deselectAll()
    }

}


// KML types
export class Feature{
    constructor(kml){
        this.kml  = kml
        this.name = null
    }
    updateMapDrawing(){}
    locate(map){}
    deselectAll(){}
}

// CONTAINER
export class Container extends Feature{
    constructor(kml){
        super(kml)
        this.features=[]
    }
    parse(element){
        if (element.children) for(let i=0; i<element.children.length;i++){
            let elementChild = element.children[i];
            try{
                switch(elementChild.tagName){
                    case 'name': 
                        this.name = elementChild.textContent; 
                        break;

                    case 'Document':
                        this.features.push(new Document(this.kml).parse(elementChild))
                        break;

                    case 'Folder':
                        this.features.push(new Folder(this.kml).parse(elementChild))
                        break;

                    case 'Placemark':
                        this.features.push(new Placemark(this.kml).parse(elementChild))
                        break;
                    
                    default: break;
                }
            }catch(err){
                handleError(err)
            }
        }    
        return this
    }
    
    // MAP DRAWING
    updateMapDrawing(){
        this.features.forEach(f=>f.updateMapDrawing())
    }
    // SELECTED STATE
    deselectAll(){
        this.features.forEach(f=>f.deselectAll())
    }
}
export class Document extends Container{
}
export class Folder extends Container{
}

// PLACEMARK
export class Placemark extends Feature{
    constructor(kml){
        super(kml)
        this.geometry = null
        this.isSelected = false
    }
    parse(element){
        if (element.children){
            for(let i=0; i<element.children.length;i++){
                let elementChild = element.children[i];
                switch(elementChild.tagName){
                    case 'name': 
                        this.name = elementChild.textContent; 
                        break;
                    case 'Point':
                        if(this.geometry) throw new ParsingError("More then one Geometry in Placemark")
                        this.geometry = new Point().parse(elementChild)
                        break;
                    case 'LineString':
                        if(this.geometry) throw new ParsingError("More then one Geometry in Placemark")
                        this.geometry = new LineString().parse(elementChild)
                        break;
                    case 'Polygon':
                        if(this.geometry) throw new ParsingError("More then one Geometry in Placemark")
                        this.geometry = new Polygon().parse(elementChild)
                        break;
                    default: break;
                }
            }
        }
        return this
    }
    
    // MAP DRAWING    
    updateMapDrawing(){
        if(this.geometry)
            this.geometry.updateMapDrawing(this.kml.map, this.name, this.isSelected);
    }

    locate(){
        if(this.kml.map && this.geometry)
            this.geometry.locate(this.kml.map)
    }

    // SELECTED STATE
    setSelected(selected){
        if(selected && this.kml.options.singleSelection)
            this.kml.deselectAll()
        this.isSelected = selected
        this.updateMapDrawing()
    }
    deselectAll(){
        this.setSelected(false)
    }

}

//-------------------------------------------------------------------------------------------
// GEOMETRY (Point,LineString,LinearRing,Polygon,MultiGeometry,Model,gx:Track)
export class Geometry{
    updateMapDrawing(map,name,isSelected){}
    locate(map){}
}

export class Point extends Geometry{
    constructor(){
        super()
        this.coordinates = null
    }
    parse(element){
        // Coordinates
        let elementCoordinates = getChildByTagName(element,'coordinates')
        if(!elementCoordinates) throw new ParsingError('Point without "coordinates" element')
        this.coordinates = parseCoordinates(elementCoordinates)
        if(!this.coordinates || this.coordinates.length===0) throw new ParsingError("Point with empty coordinates")
        this.coordinates = this.coordinates[0]
        return this
    }

    // MAP DRAWING
    static getOptions(isSelected){return isSelected?
        {icon : {url: "http://maps.google.com/mapfiles/ms/icons/red-dot.png"}} :
        {icon : {url: "http://maps.google.com/mapfiles/ms/icons/blue-dot.png"}}
    }
    updateMapDrawing(map,name,isSelected){
        // Update marker
        if(this.marker){
            this.marker.setMap(map)
        }else{
            if(map){
                let coord = this.coordinates;

                let options = Point.getOptions(isSelected);
                options.map      = map
                options.position = {lat:coord[1], lng:coord[0]}
                options.title    = name

                this.marker = new window.google.maps.Marker(options);
            }
        }
        // Update selected color
        if(this.isSelected !== isSelected){
            this.isSelected = isSelected
            if(this.marker)
                this.marker.setOptions(Point.getOptions(isSelected))
        }
    }
    locate(map){
        if(map && this.marker)
            map.panTo(this.marker.position)
    }

}
export class LineString extends Geometry{
    constructor(){
        super()
        this.coordinates = null
    }
    parse(element){
        // Coordinates
        let elementCoordinates = getChildByTagName(element,'coordinates')
        if(!elementCoordinates) throw new ParsingError('LineString without "coordinates" element')
        this.coordinates = parseCoordinates(elementCoordinates)
        if(!this.coordinates || this.coordinates.length===0) throw new ParsingError("LineString with empty coordinates")
        return this
    }

    // MAP DRAWING
    static getOptions(isSelected){return isSelected?
        {strokeColor: '#FF0000', strokeOpacity: 1.0, strokeWeight: 5} :
        {strokeColor: '#00008F', strokeOpacity: 1.0, strokeWeight: 3}
    }
    updateMapDrawing(map,name,isSelected){
        // Update polyline
        if(this.polyline){
            this.polyline.setMap(map)
        }else{
            if(map){
                let coord = this.coordinates; // verified by KmlParser
    
                let options  = LineString.getOptions(isSelected)
                options.map  = map
                options.path = coord.map(x=>({lat:x[1], lng:x[0]}))

                this.polyline = new window.google.maps.Polyline(options)
            }
        }
        // Update selected color
        if(this.isSelected !== isSelected){
            this.isSelected = isSelected
            if(this.polyline)
                this.polyline.setOptions(LineString.getOptions(isSelected))
        }
    }
    locate(map){
        if(this.polyline){
            let bounds = new window.google.maps.LatLngBounds();
            this.polyline.getPath().forEach(pt=>{
                bounds.extend(pt)
            })
            map.panToBounds(bounds)
        }
    }

}

export class Polygon extends Geometry{
    constructor(){
        super()
        this.outerCoordinates = null // outer coordinates
        this.innerCoordinates = [] // inner coordinates
    }
    parse(element){
        let elementOuter = getChildByTagName(element,'outerBoundaryIs')
        if(!elementOuter) throw new ParsingError('Polygon without "outerBoundaryIs" element')
        let elementLinearRing = getChildByTagName(elementOuter,'LinearRing')
        if(!elementLinearRing) throw new ParsingError('Polygon.outerBoundaryIs without "LinearRing" element')
        let elementCoordinates = getChildByTagName(elementLinearRing,'coordinates')
        if(!elementCoordinates) throw new ParsingError('Polygon.outerBoundaryIs.LinnearRing without "coordinates" element')
        let coordinates = parseCoordinates(elementCoordinates)
        if(!coordinates || coordinates.length===0) throw new ParsingError("Polygon.outerBoundaryIs.LinnearRing with empty coordinates")
        this.outerCoordinates = coordinates    
        return this
    }

    // MAP DRAWING
    static getOptions(isSelected){ return isSelected?
        {strokeColor:'#FF0000',strokeOpacity:1.0,strokeWeight:5,fillColor:'#FF0000',fillOpacity:0.3}:
        {strokeColor:'#00008F',strokeOpacity:1.0,strokeWeight:3,fillColor:'#00008F',fillOpacity:0.2}
    }
    updateMapDrawing(map,name,isSelected){
        // Update polygon
        if(this.polygon){
            this.polygon.setMap(map)
        }else{
            if(map){
                let coord = this.outerCoordinates; // verified by KmlParser
                let path = coord.map(x=>({lat:x[1], lng:x[0]}));
    
                let options = Polygon.getOptions(isSelected)
                options.map = map
                options.paths = path
                this.polygon = new window.google.maps.Polygon(options);
            }
        }
        // Update selected color
        if(this.isSelected !== isSelected){
            this.isSelected = isSelected
            if(this.polygon)
                this.polygon.setOptions(Polygon.getOptions(isSelected))
        }
        
    }

    locate(map){
        if(this.polygon){
            let bounds = new window.google.maps.LatLngBounds();
            this.polygon.getPath().forEach(pt=>{
                bounds.extend(pt)
            })
            map.panToBounds(bounds)
        }
    }
}

export class ParsingError{
    constructor(text){
        this.text=text
    }
}
// COORDINATES
const parseCoordinates = function(element){
    let text = element.textContent;
    // Split into text items
    let items = text.split(/\s+/)

    // Parse the text items
    let  coordinates = [];
    items.forEach(item=>{
        if(!item.length) return;
        // Split into text values
        let values = item.split(',');
        if(values.length<2) {handleError(new ParsingError('wrong coordinates "'+item+'" (length<2)')); return; }
        // Convert to digits
        let coord=[]
        for(let i=0; i<values.length; i++){
            let num = Number(values[i])
            if(isNaN(num)){handleError(new ParsingError('wrong coordinates "'+item+'" (not a number)')); return; }
            coord.push(num);
        }
        coordinates.push(coord)
    })
    return coordinates;
}
// UTILS
const getChildByTagName = function(element, tagName){
    if(element.children && element.children.length){
        for(let i=0; i<element.children.length; i++){// element.children is NOT an ARRAY !
            let child = element.children[i];
            if(child.tagName===tagName) return child;
        }
    }
    return null;
}
const handleError = function(error){
    if(error instanceof ParsingError)
        console.warn('KmlParcer: '+error.text);
    else
        throw error
}
