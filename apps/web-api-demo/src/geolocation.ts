import { trackGeolocation } from '@withease/web-api';

const latitudeElement = document.querySelector('#latitude')!;
const longitudeElement = document.querySelector('#longitude')!;
const getLocationButton = document.querySelector('#get-location')!;

const { $latitude, $longitude, request } = trackGeolocation({});

$latitude.watch((latitude) => {
  console.log('latitude', latitude);
  latitudeElement.textContent = JSON.stringify(latitude);
});
$longitude.watch((longitude) => {
  console.log('longitude', longitude);
  longitudeElement.textContent = JSON.stringify(longitude);
});

getLocationButton.addEventListener('click', () => request());
