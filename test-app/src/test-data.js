export default '<?xml version="1.0" encoding="UTF-8"?>\
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
            <Placemark>\
			<name>Road 1</name>\
			<visibility>0</visibility>\
			<styleUrl>#m_ylw-pushpin121</styleUrl>\
			<LineString>\
				<tessellate>1</tessellate>\
				<coordinates>\
					38.19439626089172,-2.976954651398529,0 38.19637224425649,-2.978710515333976,0 38.19846637016621,-2.977969044662994,0 38.20673351343918,-2.983741961709745,0 38.20722170044486,-2.980913516552085,0 38.24083266278009,-2.991494872784786,0 38.24641062006339,-2.993116115255185,0 38.25541398743441,-2.999220008259863,0 38.25697784506721,-3.005557147965376,0 38.25809772745807,-3.012103528367668,0 38.2631542799225,-3.016004357566955,0 38.26407659698351,-3.020301040021368,0 38.27110540885661,-3.023438627000819,0 38.26795198835482,-3.029591888488652,0 38.27082942692792,-3.032820557993619,0 \
				</coordinates>\
			</LineString>\
		</Placemark>\
        </Folder>\
    </Folder>\
</Document>\
</kml>';
