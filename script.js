const API_ID = "3e1d42d8505e43d0bd7151425261808";

const inputElement = document.getElementById("input");
const searchButtonElement = document.getElementById("search");
const weatherElement = document.getElementById("weather");
const leftBlock = document.getElementById("leftBlock");
const propertiesElement = document.getElementById("properties");
const forecastElement = document.getElementById("forecast");
const todayElement = document.getElementById("today");
const tomorrowElement = document.getElementById("tomorrow");

let store = {
  city: "Saint-Petersburg",
  temperature: 0,
  description: "",
  localtime: "",
  isDay: 1,
  properties: {
    chanceOfRain: {},
    feelslike: {},
    humidity: {},
    pressure: {},
    uv: {},
    visibility: {},
    windDir: {},
    windSpeed: {},
  },
};

let city;

const fetchData = async (day = todayElement) => {
  inputElement.placeholder = localStorage.city || store.city;
  const secondDay = day.previousElementSibling ?? day.nextElementSibling;

  city = localStorage.city || store.city;

  if (!day.classList.contains("active")) {
    day.classList.add("active");
    secondDay.classList.remove("active");
  }

  try {
    if (day.classList.contains("today")) {
      await fetchToday(city);
      localStorage.city = store.city;
    }
    if (day.classList.contains("tomorrow")) {
      await fetchTomorrow(city);
    }

    renderComponent();
  } catch (error) {
    console.log(error);
    showError(error);
  }
};

const fetchToday = async (city) => {
  const URL_TODAY = `https://api.weatherapi.com/v1/current.json?key=${API_ID}&q=${city}`;
  const response = await fetch(URL_TODAY);

  if (response.ok) {
    const data = await response.json();
    const {
      current: {
        chance_of_rain: chanceOfRain,
        condition: { text: description },
        feelslike_c: feelslike,
        humidity,
        is_day: isDay,
        pressure_mb: pressure,
        temp_c: temperature,
        uv,
        vis_km: visibility,
        wind_kph: windSpeed,
      },
      location: { localtime, name },
    } = data;

    updateStore(
      name,
      temperature,
      description,
      localtime,
      isDay,
      feelslike,
      chanceOfRain,
      humidity,
      pressure,
      uv,
      visibility,
      windSpeed,
    );
  } else {
    localStorage.city = "";
    throw new Error("Failed to fetch weather data. Please try again.");
  }
};

const fetchTomorrow = async (city) => {
  const URL_TOMORROW = `https://api.weatherapi.com/v1/forecast.json?key=${API_ID}&q=${city}&days=2`;
  const response = await fetch(URL_TOMORROW);

  if (response.ok) {
    const data = await response.json();
    const {
      current: { is_day: isDay, pressure_mb: pressure },
      forecast: {
        forecastday: {
          1: {
            date: localtime,
            day: {
              daily_chance_of_rain: chanceOfRain,
              condition: { text: description },
              avgtemp_c: feelslike,
              avghumidity: humidity,

              maxtemp_c: temperature,
              uv,
              avgvis_km: visibility,
              maxwind_kph: windSpeed,
            },
          },
        },
      },
      location: { name },
    } = data;

    updateStore(
      name,
      temperature,
      description,
      localtime,
      isDay,
      feelslike,
      chanceOfRain,
      humidity,
      pressure,
      uv,
      visibility,
      windSpeed,
    );
  } else {
    localStorage.city = "";
    throw new Error("Failed to fetch weather data. Please try again.");
  }
};

const updateStore = (
  name,
  temperature,
  description,
  localtime,
  isDay,
  feelslike,
  chanceOfRain,
  humidity,
  pressure,
  uv,
  visibility,
  windSpeed,
) => {
  store = {
    ...store,
    city: name,
    temperature,
    description,
    localtime,
    isDay,
    properties: {
      feelslike: {
        title: "Real feel",
        value: `${Math.floor(feelslike)}°C`,
      },
      chanceOfRain: {
        title: "Chance of rain",
        value: `${chanceOfRain}%`,
      },

      humidity: {
        title: "Humidity",
        value: `${humidity}%`,
      },
      pressure: {
        title: "Pressure",
        value: `${pressure} mb`,
      },
      uv: {
        title: "UV index",
        value: `${uv}`,
      },
      visibility: {
        title: "Visibility",
        value: `${visibility} km`,
      },
      windSpeed: {
        title: "Wind",
        value: `${Math.floor(windSpeed)} km/h`,
      },
    },
  };
};

const getImage = (description) => {
  switch (description.toLowerCase()) {
    case "sunny":
      return "sun.svg";
    case "partly cloudy":
      return "partly_cloudy.svg";
    case "cloudy":
    case "overcast":
    case "haze":
      return "clouds.svg";
    case "patchy rain nearby":
    case "patchy light rain":
    case "light rain":
    case "light rain shower":
    case "moderate rain":
      return "rain.svg";
    case "patchy snow nearby":
    case "blowing snow":
    case "patchy light snow":
    case "light snow":
      return "snow.svg";
    default:
      return "therm.svg";
  }
};

const markup = () => {
  const { city, temperature, description, localtime, isDay } = store;

  isDay
    ? leftBlock.classList.add("is-day")
    : leftBlock.classList.remove("is-day");

  return `<div class="left__weather">
              <img
                class="weather__img"
                src="icons/${getImage(description)}"
                alt="Иллюстрация погоды"
              />
              <div class="weather__text">
                <p class="weather__temperature">
                  ${Math.floor(temperature)}°C
                </p>
                <p class="weather__description">${description}</p>
              </div>
            </div>

            <div class="left__location">
              <div class="location__data">
                <p class="data">${localtime}</p>
              </div>
              <div class="location__city">${city}</div>
            </div>
          </div>`;
};

const renderProperties = () => {
  const { properties } = store;

  return Object.values(properties)
    .map(({ title, value }) => {
      return `<div class="property">
              <p class="property__header">${title}</p>
              <p class="property__value">${value}</p>
            </div>`;
    })
    .join("");
};

const renderComponent = () => {
  weatherElement.innerHTML = markup();
  propertiesElement.innerHTML = renderProperties();
};

const showError = (message) => {
  weatherElement.innerHTML = `<div class="error">${message}</div>`;
};

const handleFocus = (event) => {
  event.target.placeholder = "";
};

const handleClick = () => {
  const inputValue = inputElement.value.trim();

  if (inputValue.length === 0) {
    inputElement.value = "";
    inputElement.placeholder = store.city;
    return;
  }

  localStorage.city = inputValue;
  inputElement.placeholder = inputValue;
  inputElement.value = "";

  fetchData();
};

const handleKeyDown = (event) => {
  if (event.key === "Enter") {
    event.preventDefault();
    event.currentTarget.blur();
    handleClick();
  }
};

const handleForecastClick = (event) => {
  if (event.target.classList.contains("tomorrow")) {
    fetchData(event.target);
    return;
  }
  fetchData();
};

inputElement.addEventListener("focus", handleFocus);
inputElement.addEventListener("blur", handleClick);
inputElement.addEventListener("keydown", handleKeyDown);
searchButtonElement.addEventListener("click", handleClick);
forecastElement.addEventListener("click", handleForecastClick);

fetchData();
