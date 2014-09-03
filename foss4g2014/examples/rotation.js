var rasterLayer = new ol.layer.Tile({
  source: new ol.source.BingMaps({
    key: 'Ak-dzM4wZjSqTlzveKz5u0d4IQ4bRzVI309GxmkgSVr1ewS6iPSrOvOKhA-CJlm3',
    imagerySet: 'Aerial',
    preload: Infinity
  })
});

var styleCache = {};
var vectorLayer = new ol.layer.Vector({
  source: new ol.source.GeoJSON({
    url: 'data/countries.geojson',
    projection: 'EPSG:3857'
  }),
  style: function(feature, resolution) {
    var text = feature.get('name');
    if (!styleCache[text]) {
      styleCache[text] = [new ol.style.Style({
        fill: new ol.style.Fill({
          color: 'rgba(255, 255, 255, 0.1)'
        }),
        stroke: new ol.style.Stroke({
          color: '#319FD3',
          width: 2
        }),
        text: new ol.style.Text({
          font: '16px Calibri,sans-serif',
          text: text,
          fill: new ol.style.Fill({
            color: '#000'
          }),
          stroke: new ol.style.Stroke({
            color: '#fff',
            width: 3
          })
        })
      })];
    }
    return styleCache[text];
  }
});

var greenSightStyle = new ol.style.Style({
  image: new ol.style.Icon({
    src: 'data/sight-2.png',
    anchor: [0.5, 1]
  })
});
var pinkSightStyle = new ol.style.Style({
  image: new ol.style.Icon({
    src: 'data/sight-2-pink.png',
    anchor: [0.5, 1]
  })
});

var marker = new ol.Feature(
    new ol.geom.Point([-8620815.572252877, 2078464.5633878764]));
marker.setStyle(greenSightStyle);
marker.setId('marker');
vectorLayer.getSource().addFeature(marker);

var map = new ol.Map({
  target: 'map',
  layers: [rasterLayer, vectorLayer],
  view: new ol.View({
    center: marker.getGeometry().getCoordinates(),
    zoom: 6
  })
});

map.on('click', function(e) {
  var feature = map.forEachFeatureAtPixel(e.pixel, function(feature, layer) {
    if (feature.getId() == 'marker') {
      return feature;
    }
  });
  if (feature) {
    feature.setStyle(pinkSightStyle);
  } else {
    marker.setStyle(greenSightStyle);
  }
});


var rotation = new ol.dom.Input(document.getElementById('rotation'));
rotation.bindTo('value', map.getView(), 'rotation');

document.onkeydown = function(e) {
  var view = map.getView();
  var rotation = view.getRotation();
  if (e.keyCode == 82) {
    // "r" key
    rotation += 0.01;
    view.setRotation(Math.min(rotation, 3.14159));
  } else if (e.keyCode == 76) {
    // "l" key
    rotation -= 0.01;
    view.setRotation(Math.max(rotation, -3.14159));
  } else if (e.keyCode == 70 || e.keyCode == 66) {
    // "f" key - fly to Mexico
    // "b" key - fly back to 
    var duration = 2000;
    var start = +new Date();
    var pan = ol.animation.pan({
      duration: duration,
      source: view.getCenter(),
      start: start
    });
    var bounce = ol.animation.bounce({
      duration: duration,
      resolution: 4 * view.getResolution(),
      start: start
    });
    map.beforeRender(pan, bounce);
    if (e.keyCode == 70) {
      // Mexico
      view.setCenter([-11405013.422465283, 2746182.234668064]);
    } else {
      // Jamaica
      view.setCenter(marker.getGeometry().getCoordinates());
    }
  }
};
