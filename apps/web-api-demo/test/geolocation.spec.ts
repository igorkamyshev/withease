import { expect, test } from '@playwright/test';

const GEOLOCATION_PAGE = '/geolocation.html';

test.use({
  geolocation: { longitude: 41.890221, latitude: 12.492348 },
  permissions: ['geolocation'],
});

test('request', async ({ page, context }) => {
  await page.goto(GEOLOCATION_PAGE);

  const latitudeContainer = await page.$('#latitude');
  const longitudeContainer = await page.$('#longitude');
  const getLocationButton = await page.$('#get-location');

  // By default it should be null
  expect(await latitudeContainer!.textContent()).toBe('null');
  expect(await longitudeContainer!.textContent()).toBe('null');

  // After requesting the location, it should be updated
  await getLocationButton!.click();
  expect(await latitudeContainer!.textContent()).toBe('12.492348');
  expect(await longitudeContainer!.textContent()).toBe('41.890221');

  // Change geolocation, values should NOT be updated
  await context.setGeolocation({ longitude: 22.492348, latitude: 32.890221 });
  expect(await latitudeContainer!.textContent()).toBe('12.492348');
  expect(await longitudeContainer!.textContent()).toBe('41.890221');
  // Request the location again, values should be updated
  await getLocationButton!.click();
  expect(await latitudeContainer!.textContent()).toBe('32.890221');
  expect(await longitudeContainer!.textContent()).toBe('22.492348');
});

test('watch', async ({ page, context }) => {
  await page.goto(GEOLOCATION_PAGE);

  const latitudeContainer = await page.$('#latitude');
  const longitudeContainer = await page.$('#longitude');
  const startWatchingButton = await page.$('#start-watching');
  const stopWatchingButton = await page.$('#stop-watching');

  // By default it should be null
  expect(await latitudeContainer!.textContent()).toBe('null');
  expect(await longitudeContainer!.textContent()).toBe('null');

  // After watching the location, it should be updated immediately
  await startWatchingButton!.click();
  expect(await latitudeContainer!.textContent()).toBe('12.492348');
  expect(await longitudeContainer!.textContent()).toBe('41.890221');

  // Change geolocation, values should be updated immediately
  await context.setGeolocation({ longitude: 22.492348, latitude: 32.890221 });
  expect(await latitudeContainer!.textContent()).toBe('32.890221');
  expect(await longitudeContainer!.textContent()).toBe('22.492348');

  // Stop watching and change geolocation, values should NOT be updated
  await stopWatchingButton!.click();
  await context.setGeolocation({ longitude: 42.492348, latitude: 52.890221 });
  expect(await latitudeContainer!.textContent()).toBe('32.890221');
  expect(await longitudeContainer!.textContent()).toBe('22.492348');
});
