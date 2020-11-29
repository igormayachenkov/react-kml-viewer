// KML types

export class Feature{
    name = null;
}

export class Container extends Feature{
    features = []
}

export class Placemark extends Feature{
    geometry = null
}

// Geometries
// <!-- Geometry id="ID" -->
//                                               <!-- Point,LineString,LinearRing,
//                                                Polygon,MultiGeometry,Model,
//                                                gx:Track -->
// <!-- /Geometry -->
export class Geometry{
}

export class Point extends Geometry{
    coordinates = null
}
export class LineString extends Geometry{
    coordinates = null
}
export class Polygon extends Geometry{
    outerCoordinates = null // outer coordinates
    innerCoordinates = [] // inner coordinates
}