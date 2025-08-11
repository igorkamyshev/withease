import { allSettled, createEvent, fork } from 'effector';
import { describe, test, expect, beforeEach, vi, afterEach } from 'vitest';

import { trackWindowDimensions } from './window';
import { setTimeout } from 'timers';

describe('trackWindowDimensions on server', () => {
  test('Empty values on server', async () => {
    const scope = fork();
    const setup = createEvent();

    const {
      $scrollX,
      $scrollY,
      $innerWidth,
      $innerHeight,
      $outerWidth,
      $outerHeight,
      $screenTop,
      $screenLeft,
    } = trackWindowDimensions({ setup });

    await allSettled(setup, { scope });

    expect(scope.getState($scrollX)).toBe(0);
    expect(scope.getState($scrollY)).toBe(0);
    expect(scope.getState($innerWidth)).toBe(0);
    expect(scope.getState($innerHeight)).toBe(0);
    expect(scope.getState($outerWidth)).toBe(0);
    expect(scope.getState($outerHeight)).toBe(0);
    expect(scope.getState($screenTop)).toBe(0);
    expect(scope.getState($screenLeft)).toBe(0);
  });
});

describe('trackWindowDimensions on client', () => {
  // Mock window properties
  globalThis.window = {} as any;
  globalThis.document = {} as any;
  const originalWindow = { ...window };
  const mockAddEventListener = vi.fn();
  const mockRemoveEventListener = vi.fn();
  const mockRequestAnimationFrame = vi.fn();
  const mockCancelAnimationFrame = vi.fn();

  beforeEach(() => {
    // Reset mocks
    mockAddEventListener.mockReset();
    mockRemoveEventListener.mockReset();
    mockRequestAnimationFrame.mockReset();
    mockCancelAnimationFrame.mockReset();

    // Mock implementation of requestAnimationFrame to just return an incrementing ID
    let frameId = 0;
    mockRequestAnimationFrame.mockImplementation((callback) => {
      frameId += 1;

      setTimeout(() => {
        callback();
      });

      return frameId;
    });

    // Override window and document methods
    window.addEventListener = mockAddEventListener;
    window.removeEventListener = mockRemoveEventListener;
    document.addEventListener = mockAddEventListener;
    document.removeEventListener = mockRemoveEventListener;
    window.requestAnimationFrame = mockRequestAnimationFrame;
    window.cancelAnimationFrame = mockCancelAnimationFrame;

    // Set window dimensions
    window.scrollX = 10;
    window.scrollY = 20;
    window.innerWidth = 800;
    window.innerHeight = 600;
    window.outerWidth = 1024;
    window.outerHeight = 768;
    window.screenTop = 30;
    window.screenLeft = 40;
  });

  afterEach(() => {
    window.scrollX = originalWindow.scrollX;
    window.scrollY = originalWindow.scrollY;
    window.innerWidth = originalWindow.innerWidth;
    window.innerHeight = originalWindow.innerHeight;
    window.outerWidth = originalWindow.outerWidth;
    window.outerHeight = originalWindow.outerHeight;
    window.screenTop = originalWindow.screenTop;
    window.screenLeft = originalWindow.screenLeft;
  });

  test('attaches correct event listeners', async () => {
    const setup = createEvent();
    const teardown = createEvent();
    trackWindowDimensions({ setup, teardown });

    const scope = fork();
    await allSettled(setup, { scope });

    // Add a small delay to ensure all microtasks and macrotasks are processed
    await new Promise((resolve) => setTimeout(resolve, 10));

    // Check that event listeners were attached
    expect(document.addEventListener).toHaveBeenCalledWith(
      'scroll',
      expect.any(Function)
    );
    expect(window.addEventListener).toHaveBeenCalledWith(
      'resize',
      expect.any(Function)
    );

    expect(window.requestAnimationFrame).toHaveBeenCalled();
  });

  test('removes event listeners on teardown', async () => {
    const setup = createEvent();
    const teardown = createEvent();
    trackWindowDimensions({ setup, teardown });

    const scope = fork();
    await allSettled(setup, { scope });
    await allSettled(teardown, { scope });

    // Check that event listeners were removed
    expect(document.removeEventListener).toHaveBeenCalledWith(
      'scroll',
      expect.any(Function)
    );
    expect(window.removeEventListener).toHaveBeenCalledWith(
      'resize',
      expect.any(Function)
    );

    expect(window.cancelAnimationFrame).toHaveBeenCalled();
  });

  test('updates stores on window events', async () => {
    const setup = createEvent();
    const teardown = createEvent();
    // Create a separate setup to capture the event handlers
    const scrollHandler = vi.fn();
    const scrollHandlers: Function[] = [];
    const resizeHandler = vi.fn();
    const resizeHandlers: Function[] = [];

    // Override addEventListener to capture handlers
    mockAddEventListener.mockImplementation((event, handler) => {
      if (event === 'scroll') scrollHandlers.push(handler);
      if (event === 'resize') resizeHandlers.push(handler);
    });

    scrollHandler.mockImplementation(() => {
      scrollHandlers.forEach((handler) => handler());
    });
    resizeHandler.mockImplementation(() => {
      resizeHandlers.forEach((handler) => handler());
    });

    const {
      $scrollX,
      $scrollY,
      $innerWidth,
      $innerHeight,
      $outerWidth,
      $outerHeight,
    } = trackWindowDimensions({ setup, teardown });

    const scope = fork();
    await allSettled(setup, { scope });

    // Simulate scroll event
    window.scrollX = 50;
    window.scrollY = 75;

    // Trigger scroll handler
    scrollHandler();

    expect($scrollX.getState()).toBe(50);
    expect($scrollY.getState()).toBe(75);

    // Simulate resize event
    window.innerWidth = 1200;
    window.innerHeight = 900;
    window.outerWidth = 1280;
    window.outerHeight = 1024;

    // Trigger resize handler
    resizeHandler();

    // Check that resize values were updated
    expect($innerWidth.getState()).toBe(1200);
    expect($innerHeight.getState()).toBe(900);
    expect($outerWidth.getState()).toBe(1280);
    expect($outerHeight.getState()).toBe(1024);
  });
});
