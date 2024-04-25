import { trackGeolocation } from '@withease/web-api';

const latitudeElement = document.querySelector('#latitude')!;
const longitudeElement = document.querySelector('#longitude')!;
const getLocationButton = document.querySelector('#get-location')!;
const startWatchingButton = document.querySelector('#start-watching')!;
const stopWatchingButton = document.querySelector('#stop-watching')!;

const { $latitude, $longitude, request, watching } = trackGeolocation({});

$latitude.watch((latitude) => {
  console.log('latitude', latitude);
  latitudeElement.textContent = JSON.stringify(latitude);
});
$longitude.watch((longitude) => {
  console.log('longitude', longitude);
  longitudeElement.textContent = JSON.stringify(longitude);
});

getLocationButton.addEventListener('click', () => request());
startWatchingButton.addEventListener('click', () => watching.start());
stopWatchingButton.addEventListener('click', () => watching.stop());
