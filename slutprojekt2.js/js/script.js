// Lyssna på formulärets submit-händelse
document.getElementById('weatherForm').addEventListener('submit', function(event) {
  event.preventDefault(); // Förhindra att formuläret skickas

  // Hämta stad och API-nyckel från input-fälten
  let city = document.getElementById('cityInput').value;
  let apiKey = 'e652f2abd85b6a6a475e0568d8dc42b9';

  // Hämta DOM-element för resultat och prognos
  let resultDiv = document.getElementById('result');
  let forecastDiv = document.getElementById('forecast');

  // Rensa tidigare resultat och prognos
  resultDiv.innerHTML = '';
  forecastDiv.innerHTML = '';

  // Validera stadsinput
  if (!city) {
    resultDiv.innerHTML = '<p class="error-message">Please enter a city name.</p>';
    return;
  }
  // Hämta aktuellt väder och väderprognos
  Promise.all([fetchCurrentWeather(city, apiKey), fetchWeatherForecast(city, apiKey)])
    .then(function([currentWeatherData, forecastData]) {
      displayCurrentWeather(currentWeatherData); // Visa aktuellt väder
      displayWeatherForecast(forecastData); // Visa väderprognos
    })
    .catch(function(error) {
      resultDiv.innerHTML = '<p class="error-message">Error: ' + error.message + '</p>';
    });
});
// Funktion för att hämta aktuellt väder
function fetchCurrentWeather(city, apiKey) {
  let url = 'https://api.openweathermap.org/data/2.5/weather?q=' + city + '&appid=' + apiKey;

  return fetch(url)
    .then(function(response) {
      if (!response.ok) {
        throw new Error('Could not fetch current weather information for ' + city);
      }
      return response.json();
    })
    .then(function(data) {
      let description = data.weather[0].description;
      let temperature = (data.main.temp - 273.15).toFixed(1);
      let windSpeed = data.wind.speed;
      let weatherIcon = data.weather[0].icon;
      return { description, temperature, windSpeed, weatherIcon };
    });
}

// Funktion för att hämta väderprognos
function fetchWeatherForecast(city, apiKey) {
  let hours = parseInt(document.getElementById('hoursInput').value) || 0;

  let url = 'https://api.openweathermap.org/data/2.5/forecast?q=' + city + '&appid=' + apiKey;

  return fetch(url)
    .then(function(response) {
      if (!response.ok) {
        throw new Error('Could not fetch weather forecast information for ' + city);
      }
      return response.json();
    })
    .then(function(data) {
      let forecastList = data.list;
      let forecastData = [];
      let currentTime = new Date(); // Aktuell tid när användaren trycker på "Get Weather"
      let currentHour = currentTime.getHours(); // Aktuell timme när användaren trycker på "Get Weather"

      let numberOfForecasts = Math.ceil(hours / 3); // Beräkna antalet prognoser vi vill visa

      // Extrahera relevant väderprognosdata baserat på antalet timmar och aktuell tid
      for (let i = 0; i < numberOfForecasts; i++) {
        let forecastIndex = currentHour + i * 3; // Använd nuvarande timme och i för att hitta rätt prognos
        if (forecastIndex >= forecastList.length) { // Säkerställ att vi inte går utanför listans gränser
          break;
        }

        let forecastTime = new Date(currentTime.getTime() + i * 3 * 60 * 60 * 1000); // Tid för varje prognos framåt
        let time = formatTime(forecastTime.getHours(), forecastTime.getMinutes()); // Formatera tiden som "HH:MM"
        let temperature = (forecastList[forecastIndex].main.temp - 273.15).toFixed(1);
        let windSpeed = forecastList[forecastIndex].wind.speed;
        let weatherIcon = forecastList[forecastIndex].weather[0].icon;
        let description = forecastList[forecastIndex].weather[0].description;
        forecastData.push({ time, temperature, windSpeed, weatherIcon, description });
      }

      return forecastData;
    });
}

// Funktion för att visa aktuellt väder
function displayCurrentWeather(currentWeatherData) {
  let resultDiv = document.getElementById('result');
  resultDiv.innerHTML = '';

  let weatherInfoDiv = document.createElement('div');
  weatherInfoDiv.classList.add('weather-info');

  let weatherIcon = document.createElement('img');
  weatherIcon.src = 'https://openweathermap.org/img/wn/' + currentWeatherData.weatherIcon + '@2x.png';
  weatherIcon.alt = currentWeatherData.description;
  weatherInfoDiv.append(weatherIcon);

  let descriptionP = document.createElement('p');
  descriptionP.textContent = currentWeatherData.description;
  weatherInfoDiv.append(descriptionP);

  let temperatureP = document.createElement('p');
  temperatureP.textContent = currentWeatherData.temperature + '°C';
  weatherInfoDiv.append(temperatureP);

  let windSpeedP = document.createElement('p');
  windSpeedP.textContent = 'Wind: ' + currentWeatherData.windSpeed + ' m/s';
  weatherInfoDiv.append(windSpeedP);

  resultDiv.append(weatherInfoDiv);

  // Ändring börjar här:
  // Ta bort tidigare kod för att ändra bakgrundsfärg baserat på temperatur.
  // Istället, ändra bakgrundsfärg baserat på väderbeskrivning.
  let description = currentWeatherData.description;
  let color = '';

  if (description.includes("clear")) {
    color = '#85c1e9'; 
  } else if (description.includes("clouds")) {
    color = '#f7dc6f';
  } else if (description.includes("rain") || description.includes("thunderstorm")) {
    color = '#e74c3c';
  }

  changeBackgroundColor(weatherInfoDiv, color); 

  setTimeout(function() {
    resetBackgroundColor(weatherInfoDiv);
  }, 5000);
}

// Funktion för att visa väderprognos
function displayWeatherForecast(forecastData) {
  let forecastDiv = document.getElementById('forecast');
  forecastDiv.innerHTML = '';

  for (let forecast of forecastData) {
    let forecastInfoDiv = document.createElement('div');
    forecastInfoDiv.classList.add('forecast-info');

    let timeP = document.createElement('p');
    timeP.textContent = forecast.time;
    forecastInfoDiv.appendChild(timeP);

    let weatherIcon = document.createElement('img');
    weatherIcon.src = 'https://openweathermap.org/img/wn/' + forecast.weatherIcon + '@2x.png';
    weatherIcon.alt = forecast.description;
    forecastInfoDiv.appendChild(weatherIcon);

    let descriptionP = document.createElement('p');
    descriptionP.textContent = forecast.description;
    forecastInfoDiv.appendChild(descriptionP);

    let temperatureP = document.createElement('p');
    temperatureP.textContent = forecast.temperature + '°C';
    forecastInfoDiv.appendChild(temperatureP);

    let windSpeedP = document.createElement('p');
    windSpeedP.textContent = 'Wind: ' + forecast.windSpeed + ' m/s';
    forecastInfoDiv.appendChild(windSpeedP);

    forecastDiv.append(forecastInfoDiv);
  }
}

// Funktion för att formatera tid
function formatTime(hours, minutes) {
  return (hours < 10 ? '0' : '') + hours + ':' + (minutes < 10 ? '0' : '') + minutes;
}

// Funktion för att ändra bakgrundsfärg
function changeBackgroundColor(element, color) {
  element.style.backgroundColor = color;
}

// Funktion för att återställa bakgrundsfärg
function resetBackgroundColor(element) {
  element.style.backgroundColor = '';
}
