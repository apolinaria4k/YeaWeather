const API_ID_2 = "3e1d42d8505e43d0bd7151425261808"; //weatherapi

const API_ID = "a4e00d1b9339f6483796b6930f02922c"; //openweather

const inputElement = document.getElementById("input");
const searchButtonElement = document.getElementById("search");
const weatherElement = document.getElementById("weather");
const leftBlock = document.getElementById("leftBlock");
const propertiesElement = document.getElementById("properties");
const forecastElement = document.getElementById("forecast");

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

const fetchData = async () => {
    try{
        const response = await fetch(
            `http://api.weatherapi.com/v1/current.json?key=${API_ID_2}&q=${store.city}`,
        );
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

        renderComponent();
    }
    catch(error){
        console.log(error)
    }
  
};

const fetchTomorrowData = async () => {
    try{
        const response = await fetch(
            `http://api.weatherapi.com/v1/forecast.json?key=${API_ID_2}&q=${store.city}&days=2`,
        );

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
        renderComponent();
    }
    catch(error){
        console.log(error)
    }
  
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

  if (isDay) {
    leftBlock.classList.add("is-day");
  }

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

const handleFocus = () => {
  event.target.placeholder = "";
};

const handleBlur = () => {
  store.city = inputElement.value;
  inputElement.placeholder = inputElement.value;
  inputElement.value = "";

  fetchData();
};

const handleClick = () => {
  store.city = inputElement.value;
  inputElement.placeholder = inputElement.value;
  inputElement.value = "";

  fetchData();
};

const handleForecastClick = () => {
  if (event.target.classList.contains("tomorrow")) {
    fetchTomorrowData();
    event.target.classList.add("active");
    event.target.previousElementSibling.classList.remove("active");
  }

  if (event.target.classList.contains("today")) {
    fetchData();
    event.target.classList.add("active");
    event.target.nextElementSibling.classList.remove("active");
  }
};

inputElement.addEventListener("focus", handleFocus);
inputElement.addEventListener("blur", handleBlur);
searchButtonElement.addEventListener("click", handleClick);
forecastElement.addEventListener("click", handleForecastClick);

fetchData();
