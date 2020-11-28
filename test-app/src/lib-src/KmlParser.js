
//--------------------------------------------------------------------------------------------
// KML scheme: https://developers.google.com/kml/documentation/kmlreference
// 
// Parameters:
//      domDocument : DOM Document interface https://developer.mozilla.org/en-US/docs/Web/API/Document
// usage example:
//          let parser = new DOMParser();
//          let domDocument = parser.parseFromString(props.kmlText,"text/xml");
//          let obj = kmlParser.parseFromDOMDocument(domDocument)
//           
// Parsed data node format:
// {
//   //   id          : Number - inique number generated during parsing
//      // for Container
//      name        : String
//      folders     : Array
//      placemarks  : Array
//
//      // for Placemark
//      point       : Object
//      lineString  : Object
//      polygon     : Object
//  }
exports.parseFromDOMDocument = function(domDocument){
    console.log('KmlParcer.parseFromDOMDocument')

    // Verify structure: kml/Document
    let kml = getChildByTagName(domDocument,"kml");
    if(!kml) throw String('KML format error: Element "kml" is not found');
    let document = getChildByTagName(kml,"Document");    //domDocument.getElementsByTagName("Document")[0]
    if(!document) throw String('KML format error: Element "Document" is not found');
    
    // Parce document as a container
 //   idBase = 0;
    return parseElement(document, containerChildParcers);
}
//var idBase = 0; // parallel parcing will make wrong ids

class ParsingError{
    constructor(text){
        this.text=text
    }
}

// COMMON PARSER
const parseElement = function(element,childParcers){
    let obj = {}
    if (element.children){
        for(let i=0; i<element.children.length;i++){
            let child = element.children[i];
            let childParcer = childParcers[child.tagName];
            if(childParcer)
                childParcer(obj,child);
        }
    }
    return obj;
}
// SPECIAL PARSERS
const parseName = function(parent,element){
    parent.name = element.textContent; 
}
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


// CONTAINER CHILDREN
const containerChildParcers = {
    'name'      : parseName,

    'Folder'    : (parent,element)=>{ 
        let obj = parseElement(element,containerChildParcers)
        // Add to the parent
        if(!parent.folders) parent.folders=[];
        parent.folders.push( obj ); 
    },

    'Placemark' : (parent,element)=>{ 
        try{
            let obj = parseElement(element,placemarkChildParcers);
        
            // Add to the parent
            if(!parent.placemarks)  parent.placemarks=[];
            parent.placemarks.push(obj); 
        }catch(err){
            handleError(err)
        }
    }
}

// PLACEMARK CHILDREN
const placemarkChildParcers = {
    'name'      : parseName,

    'Point'     : (parent,element)=>{ 
        let obj = parseElement(element,geometryChildParcers)
        // Verify
        if(!obj.coordinates || obj.coordinates.length===0) throw new ParsingError("Point with empty coordinates")
        obj.coordinates = obj.coordinates[0]
        // Add to the parent
        parent.point = obj; 
    },

    'LineString': (parent,element)=>{ 
        let obj = parseElement(element,geometryChildParcers)
        // Verify
        if(!obj.coordinates || obj.coordinates.length===0) throw new ParsingError("LineString with empty coordinates")
        // Add to the parent
        parent.lineString = obj;
    },

    'Polygon'   : (parent,element)=>{ 
        let obj = parseElement(element,geometryChildParcers)
        // Verify
        if(!obj.outerBoundaryIs) throw new ParsingError("Polygon with empty outerBoundaryIs")
        // Add to the parent
        parent.polygon = obj; 
    },
}

// GEOMETRY CHILDREN
const geometryChildParcers = {

    'outerBoundaryIs'   : (parent,element)=>{ 
        let obj = parseElement(element,geometryChildParcers)
        // Veerify
        if(!obj.linearRing) throw new ParsingError("outerBoundaryIs without LinearRing")
        // Add to the parent
        parent.outerBoundaryIs = obj; 
    },

    'innerBoundaryIs'   : (parent,element)=>{ 
        let obj = parseElement(element,geometryChildParcers)
        // Veerify
        if(!obj.linearRing) throw new ParsingError("innerBoundaryIs without LinearRing")
        // Add to the parent
        if(!parent.innerBoundaryIs) parent.innerBoundaryIs=[];
        parent.innerBoundaryIs.push( obj ); 
    },

    'LinearRing'        : (parent,element)=>{ 
        let obj = parseElement(element,geometryChildParcers) 
        // Verify
        if(!obj.coordinates) throw new ParsingError("LinearRing without cordinates")
        // Add to the parent
        parent.linearRing = obj
    },

    'coordinates'       : (parent,element)=>{ 
        parent.coordinates     = parseCoordinates(element) 
    },
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


