const fetch = (...args) =>
  import("node-fetch").then(({ default: fetch }) => fetch(...args));
const fs = require("fs");
const path = require("path");
require("dotenv").config();
const getWeatherMessage = require("./weatherDescriptions.js");
const cities = require("./cities.js");

/// SET CITY HERE
const currentCity = cities.Sweden.Stockholm;

const fetchWeather = async () => {
  const apiKey = process.env.OPEN_WEATHER;
  const url = `https://api.openweathermap.org/data/3.0/onecall?lat=${currentCity.lat}&lon=${currentCity.lon}&units=metric&appid=${apiKey}`;
  console.log("URL being fetched:", url);

  try {
    console.log("Fetching weather data...");
    const response = await fetch(url);
    console.log(`Response status: ${response.status}`);
    if (!response.ok) {
      console.error(
        `API call failed with status: ${response.status} ${response.statusText}`
      );
      return "Based in Stockholm, the sky appears to have started a jigsaw, with broken clouds scattered about as if in the midst of an existential crisis about whether to come together or remain aloof.";
    }
    const data = await response.json();
    // console.log("Data received:", data);

    const temperature = Math.round(data.current.temp);
    const weatherCondition = data.current.weather[0].description;
    // console.log(`Weather condition received: ${weatherCondition}`);
    const weatherMessage = getWeatherMessage(
      temperature,
      weatherCondition,
      currentCity.name
    );

    return weatherMessage;
  } catch (error) {
    console.error("Error fetching weather data:", error);
    return "Based in Stockholm, the sky appears to have started a jigsaw, with broken clouds scattered about as if in the midst of an existential crisis about whether to come together or remain aloof.";
  }
};

const updateReadme = async (weatherData) => {
  try {
    const readmePath = path.join(__dirname, "README.md");
    // console.log(__dirname);
    // console.log(`Reading README.md from ${readmePath}`);
    let readmeContent = fs.readFileSync(readmePath, "utf8");

    console.log(readmeContent);
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
    // console.log(readmeContent);
    // console.log("Writing updated weather data to README.md");
    fs.writeFileSync(readmePath, readmeContent, "utf8");
    // console.log("Successfully updated README.md");
  } catch (error) {
    console.error("An error occurred in updateReadme:", error);
    throw error;
  }
};

fetchWeather()
  .then(updateReadme)
  .catch((error) => console.error("An error occurred:", error));
