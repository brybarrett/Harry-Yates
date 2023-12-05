const fetch = (...args) =>
  import("node-fetch").then(({ default: fetch }) => fetch(...args));
// Rest of your script...

const fs = require("fs");
const path = require("path");
require("dotenv").config();

const fetchWeather = async () => {
  const apiKey = process.env.OPEN_WEATHER; // Access the API key from environment variables
  const lat = "59.3293"; // Latitude for Stockholm
  const lon = "18.0686"; // Longitude for Stockholm
  const url = `https://api.openweathermap.org/data/3.0/onecall?lat=${lat}&lon=${lon}&units=metric&appid=${apiKey}`;

  try {
    const response = await fetch(url);
    const data = await response.json();

    // Extract the desired information
    const temperature = data.current.temp; // Assuming you want the current temperature
    const weatherCondition = data.current.weather[0].description; // Current weather condition

    return `Current weather in Stockholm: ${temperature}°C, ${weatherCondition}`;
  } catch (error) {
    console.error("Error fetching weather data:", error);
    return "Unable to fetch weather data.";
  }
};

const updateReadme = async (weatherData) => {
  const readmePath = path.join(__dirname, "README.md");
  let readmeContent = fs.readFileSync(readmePath, "utf8");

  const startMarker = "<!-- WEATHER_START -->";
  const endMarker = "<!-- WEATHER_END -->";
  const startIndex = readmeContent.indexOf(startMarker) + startMarker.length;
  const endIndex = readmeContent.indexOf(endMarker);

  if (startIndex < 0 || endIndex < 0 || startIndex >= endIndex) {
    throw new Error("Could not find placeholders in README.md");
  }

  const beforeWeather = readmeContent.substring(0, startIndex);
  const afterWeather = readmeContent.substring(endIndex);
  readmeContent = beforeWeather + "\n" + weatherData + "\n" + afterWeather;

  fs.writeFileSync(readmePath, readmeContent, "utf8");
};

fetchWeather()
  .then(updateReadme)
  .catch((error) => console.error("An error occurred:", error));
