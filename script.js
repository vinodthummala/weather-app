const apiKey = 'ef22962633b63d7974d27f5e91999de4'; // Replace with your OpenWeatherMap API key
const searchBtn = document.getElementById('searchBtn');
const locationBtn = document.getElementById('locationBtn');
const cityInput = document.getElementById('cityInput');

const currentTemperatureElement = document.querySelector('.current-weather h2');
const weatherDescriptionElement = document.querySelector('.current-weather p:nth-of-type(2)');
const dateElement = document.querySelector('.card-footer p:first-child');
const locationElement = document.querySelector('.card-footer p:last-child');

const airQualityIndexElement = document.querySelector('.air-index'); // Ensure this matches your HTML structure
const humidityElement = document.querySelector('.highlights .humidity'); // Update with appropriate class
const pressureElement = document.querySelector('.highlights .pressure'); // Update with appropriate class
const visibilityElement = document.querySelector('.highlights .visibility'); // Update with appropriate class
const feelsLikeElement = document.querySelector('.highlights .feels-like'); // Update with appropriate class

const todayAtElements = document.querySelectorAll('.today-at .timing-item span');

searchBtn.addEventListener('click', () => {
    const cityName = cityInput.value;
    getWeatherData(cityName);
});

locationBtn.addEventListener('click', () => {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(position => {
            const { latitude, longitude } = position.coords;
            getWeatherDataByCoords(latitude, longitude);
        });
    } else {
        alert("Geolocation is not supported by this browser.");
    }
});

function getWeatherData(city) {
    fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`)
        .then(response => response.json())
        .then(data => {
            if (data.cod === 200) {
                updateWeatherData(data);
                getForecastData(data.coord.lat, data.coord.lon);
            } else {
                alert("City not found. Please try again.");
            }
        })
        .catch(error => console.error("Error fetching weather data:", error));
}

function getWeatherDataByCoords(lat, lon) {
    fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`)
        .then(response => response.json())
        .then(data => {
            updateWeatherData(data);
            getForecastData(lat, lon);
        })
        .catch(error => console.error("Error fetching weather data:", error));
}

function updateWeatherData(data) {
    const { main, weather, name, dt } = data;

    currentTemperatureElement.textContent = `${main.temp.toFixed(1)}°C`;
    weatherDescriptionElement.textContent = weather[0].description;
    dateElement.textContent = new Date(dt * 1000).toLocaleDateString();
    locationElement.textContent = name;

    if (humidityElement) {
        humidityElement.textContent = `Humidity: ${main.humidity}%`;
    }
    if (pressureElement) {
        pressureElement.textContent = `Pressure: ${main.pressure} hPa`;
    }
    if (visibilityElement) {
        visibilityElement.textContent = `Visibility: ${data.visibility / 1000} km`;
    }
    if (feelsLikeElement) {
        feelsLikeElement.textContent = `Feels Like: ${main.feels_like.toFixed(1)}°C`;
    }
}

function getForecastData(lat, lon) {
    fetch(`https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`)
        .then(response => response.json())
        .then(data => {
            updateForecast(data);
        })
        .catch(error => console.error("Error fetching forecast data:", error));
}

function updateForecast(data) {
    const forecastItems = document.querySelectorAll('.day-forecast .forecast-item');

    for (let i = 0; i < forecastItems.length; i++) {
        const forecast = data.list[i * 8]; // Get 8-hour intervals (every 3 hours)
        if (forecast) {
            const forecastTemp = forecast.main.temp.toFixed(1);
            const forecastDate = new Date(forecast.dt * 1000).toLocaleDateString();
            forecastItems[i].querySelector('.icon-wrapper span').textContent = `${forecastTemp}°C`;
            forecastItems[i].querySelector('p:first-of-type').textContent = forecastDate;
            // Add more details if needed
        }
    }

    // Populate the today's timings section (6 AM, 9 AM, 12 PM, etc.)
    todayAtElements.forEach((element, index) => {
        const hourForecast = data.list[index * 2]; // Use a 3-hour interval
        if (hourForecast) {
            const temp = hourForecast.main.temp.toFixed(1);
            element.textContent = `${temp}°C`;
        }
    });
}
