// KML types

export class Feature{
    //name = null;
}

// CONTAINER
export class Container extends Feature{
    //features = []
}
export class Document extends Container{
}
export class Folder extends Container{
}

// PLACEMARK
export class Placemark extends Feature{
    //geometry = null
}

// GEOMETRY (Point,LineString,LinearRing,Polygon,MultiGeometry,Model,gx:Track)
export class Geometry{
}

export class Point extends Geometry{
    //coordinates = null
}
export class LineString extends Geometry{
    //coordinates = null
}
export class Polygon extends Geometry{
    //outerCoordinates = null // outer coordinates
    //innerCoordinates = [] // inner coordinates
}