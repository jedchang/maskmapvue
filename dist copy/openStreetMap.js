import L from 'leaflet';

const markerIconsConfig = {
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
};

export const markerIcons = {
  blue: new L.Icon({
    iconUrl:
      'https://cdn.rawgit.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
    ...markerIconsConfig,
  }),
  grey: new L.Icon({
    iconUrl:
      'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-grey.png',
    ...markerIconsConfig,
  }),
};

export default class OpenStreetMap {
  map = {};

  constructor(domId, lat, lng) {
    this.init(domId, lat, lng);
  }

  init(domId, lat, lng) {
    this.map = L.map(domId, {
      center: [lat, lng],
      zoom: 15,
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png?{foo}', { foo: 'bar' }).addTo(
      this.map,
    );
  }

  addMarker(lat, lng, icon = markerIcons.blue, popUpHtml = '', isOpenPopUp = false) {
    const layer = L.marker([lat, lng], { icon })
      .addTo(this.map)
      .bindPopup(popUpHtml);

    if (isOpenPopUp === true) {
      layer.openPopup();
    }
  }

  removeAllMarkers() {
    this.map.eachLayer((layer) => {
      if (layer instanceof L.Marker) {
        this.map.removeLayer(layer);
      }
    });
  }

  moveTo(lat, lng) {
    this.map.panTo(new L.LatLng(lat, lng));
  }
}
