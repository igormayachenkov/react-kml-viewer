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
// parseFromString(kmlString,options)
// options: { 
//      domParser : custom DOMParser to work outside a browser 
//      parseStyles: true/false 
//      includeXmlElement: true/false - add xmlElement field to each object 
//}
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
import * as KML from './kml';
export function parseFromDOMDocument(domDocument) {
  console.log('KmlParcer.parseFromDOMDocument'); // Verify structure: kml/Document

  let kml = getChildByTagName(domDocument, "kml");
  if (!kml) throw String('KML format error: Element "kml" is not found');
  if (!kml.children || kml.children.length < 1) throw String('No children within <kml> tag');
  if (kml.children.length > 1) throw String('Only a single root feature allowed within <kml> tag'); // Parce root as a container

  let root = kml.children[0];
  return parseContainer(root);
} //var idBase = 0; // parallel parcing will make wrong ids

class ParsingError {
  constructor(text) {
    this.text = text;
  }

} // CONTAINER 


const parseContainer = function (element) {
  let obj = element.tagName === 'Document' ? new KML.Document() : new KML.Folder();

  if (element.children) {
    for (let i = 0; i < element.children.length; i++) {
      let elementChild = element.children[i];

      switch (elementChild.tagName) {
        case 'name':
          obj.name = elementChild.textContent;
          break;

        case 'Document':
        case 'Folder':
          obj.features.push(parseContainer(elementChild));
          break;

        case 'Placemark':
          let child = parsePlacemark(elementChild);
          if (child) obj.features.push(child);
          break;

        default:
          break;
      }
    }
  }

  return obj;
}; // PLACEMARK 


const parsePlacemark = function (element) {
  try {
    let obj = new KML.Placemark();

    if (element.children) {
      for (let i = 0; i < element.children.length; i++) {
        let elementChild = element.children[i];

        switch (elementChild.tagName) {
          case 'name':
            obj.name = elementChild.textContent;
            break;

          case 'Point':
            if (obj.geometry) throw new ParsingError("More then one Geometry in Placemark");
            obj.geometry = parsePoint(elementChild);
            break;

          case 'LineString':
            if (obj.geometry) throw new ParsingError("More then one Geometry in Placemark");
            obj.geometry = parseLineString(elementChild);
            break;

          case 'Polygon':
            if (obj.geometry) throw new ParsingError("More then one Geometry in Placemark");
            obj.geometry = parsePolygon(elementChild);
            break;

          default:
            break;
        }
      }
    }

    return obj;
  } catch (err) {
    handleError(err);
    return null;
  }
};

const parsePoint = function (element) {
  let obj = new KML.Point(); // Coordinates

  let elementCoordinates = getChildByTagName(element, 'coordinates');
  if (!elementCoordinates) throw new ParsingError('Point without "coordinates" element');
  obj.coordinates = parseCoordinates(elementCoordinates);
  if (!obj.coordinates || obj.coordinates.length === 0) throw new ParsingError("Point with empty coordinates");
  obj.coordinates = obj.coordinates[0];
  return obj;
};

const parseLineString = function (element) {
  let obj = new KML.LineString(); // Coordinates

  let elementCoordinates = getChildByTagName(element, 'coordinates');
  if (!elementCoordinates) throw new ParsingError('LineString without "coordinates" element');
  obj.coordinates = parseCoordinates(elementCoordinates);
  if (!obj.coordinates || obj.coordinates.length === 0) throw new ParsingError("LineString with empty coordinates");
  return obj;
};

const parsePolygon = function (element) {
  let obj = new KML.Polygon(); // outer

  let elementOuter = getChildByTagName(element, 'outerBoundaryIs');
  if (!elementOuter) throw new ParsingError('Polygon without "outerBoundaryIs" element');
  let elementLinearRing = getChildByTagName(elementOuter, 'LinearRing');
  if (!elementLinearRing) throw new ParsingError('Polygon.outerBoundaryIs without "LinearRing" element');
  let elementCoordinates = getChildByTagName(elementLinearRing, 'coordinates');
  if (!elementCoordinates) throw new ParsingError('Polygon.outerBoundaryIs.LinnearRing without "coordinates" element');
  let coordinates = parseCoordinates(elementCoordinates);
  if (!coordinates || coordinates.length === 0) throw new ParsingError("Polygon.outerBoundaryIs.LinnearRing with empty coordinates");
  obj.outerCoordinates = coordinates;
  return obj;
}; // COORDINATES


const parseCoordinates = function (element) {
  let text = element.textContent; // Split into text items

  let items = text.split(/\s+/); // Parse the text items

  let coordinates = [];
  items.forEach(item => {
    if (!item.length) return; // Split into text values

    let values = item.split(',');

    if (values.length < 2) {
      handleError(new ParsingError('wrong coordinates "' + item + '" (length<2)'));
      return;
    } // Convert to digits


    let coord = [];

    for (let i = 0; i < values.length; i++) {
      let num = Number(values[i]);

      if (isNaN(num)) {
        handleError(new ParsingError('wrong coordinates "' + item + '" (not a number)'));
        return;
      }

      coord.push(num);
    }

    coordinates.push(coord);
  });
  return coordinates;
}; // UTILS


const getChildByTagName = function (element, tagName) {
  if (element.children && element.children.length) {
    for (let i = 0; i < element.children.length; i++) {
      // element.children is NOT an ARRAY !
      let child = element.children[i];
      if (child.tagName === tagName) return child;
    }
  }

  return null;
};

const handleError = function (error) {
  if (error instanceof ParsingError) console.warn('KmlParcer: ' + error.text);else throw error;
};