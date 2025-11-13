
'use client';

// This is a simulation. A real implementation would use an API.
// Note: The main WeatherApp project DOES use a real API, but for this self-contained
// password game, we'll simulate it to avoid requiring an API key just for this mini-feature.
const weatherConditions = ['Clear', 'Clouds', 'Rain', 'Drizzle', 'Thunderstorm', 'Snow', 'Mist'];
let currentWeather = 'Clouds';

// Helper function to format the time as HH:mm
export const getFormattedTime = () => {
  const now = new Date();
  const hours = now.getHours().toString().padStart(2, '0');
  const minutes = now.getMinutes().toString().padStart(2, '0');
  return `${hours}:${minutes}`;
};


const updateWeather = () => {
  const randomIndex = Math.floor(Math.random() * weatherConditions.length);
  currentWeather = weatherConditions[randomIndex];
  return currentWeather;
};

// This function is called periodically from the main game component.
export const getCurrentWeather = () => {
  // To make it slightly less random, only change it occasionally.
  if (Math.random() < 0.1) {
    return updateWeather();
  }
  return currentWeather;
};

// Dummy component, logic is in the functions above.
export const CurrentTime = () => null;
export const CurrentWeather = () => null;
