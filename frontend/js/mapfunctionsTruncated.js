function MapFunctions(baseelem, coordinates){
  let displayed = false;
  let map;

  this.init = init;
  this.invalidateSize = invalidate;
  this.addMarker = addMarker;

  function init(){
    if(displayed === false){
      let mapdiv = document.createElement('div');
      document.querySelector(baseelem).appendChild(mapdiv);

      map = L.map(mapdiv, { layers: [
        L.tileLayer('https://tile.openstreetmap.org/${z}/${x}/${y}.png	', {
          attribution: "<a href='http://www.openstreetmap.org/copyright'>OpenStreetMap</a>",
        })],
        preferCanvas: true,
        center: coordinates,
        zoom: 11
      });
      L.control.scale().addTo(map).setPosition('bottomright');
    }

    displayed = true;
    return this;
  };

  function invalidate(){
    return map.invalidateSize();
  };

  function addMarker(lat, lng){
    let marker = L.marker([lat, lng]).addTo(map);
    marker.bindPopup('Coordinates: ' + lat + ',' + lng).openPopup();
    map.setView([lat, lng], 11);
  };

}
