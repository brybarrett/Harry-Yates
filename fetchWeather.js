const fetch = (...args) =>
  import("node-fetch").then(({ default: fetch }) => fetch(...args));
const fs = require("fs");
const path = require("path");
require("dotenv").config();
const getWeatherMessage = require("./weatherDescriptions.js");
const cities = require("./cities.js");

// SET CITY HERE
const currentCity = cities.Stockholm;

const fetchWeather = async () => {
  const apiKey = process.env.OPEN_WEATHER;
  const url = `https://api.openweathermap.org/data/3.0/onecall?lat=${currentCity.lat}&lon=${currentCity.lon}&units=metric&appid=${apiKey}`;

  try {
    console.log("Fetching weather data...");
    const response = await fetch(url);
    console.log(`Response status: ${response.status}`);
    if (!response.ok) {
      console.error(
        `API call failed with status: ${response.status} ${response.statusText}`
      );
      return "API call failed";
    }
    const data = await response.json();
    console.log("Data received:", data);

    const temperature = data.current.temp; // Current temperature in Celsius
    const weatherCondition = data.current.weather[0].description; // Current weather condition
    console.log(`Weather condition received: ${weatherCondition}`); // Log the condition
    const weatherMessage = getWeatherMessage(
      temperature,
      weatherCondition,
      currentCity.name
    );

    return weatherMessage;
  } catch (error) {
    console.error("Error fetching weather data:", error);
    return "Unable to fetch weather data.";
  }
};

const updateReadme = async (weatherData) => {
  try {
    const readmePath = path.join(__dirname, "./README.md");
    console.log(__dirname);
    console.log(`Reading README.md from ${readmePath}`);
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

    console.log("Writing updated weather data to README.md");
    fs.writeFileSync(readmePath, readmeContent, "utf8");
    console.log("Successfully updated README.md");
  } catch (error) {
    console.error("An error occurred in updateReadme:", error);
    throw error; // Rethrow the error to be caught in the calling function
  }
};

fetchWeather()
  .then(updateReadme)
  .catch((error) => console.error("An error occurred:", error));
