// Lyssna på formulärets submit-händelse
document.getElementById('weatherForm').addEventListener('submit', function(event) {
  event.preventDefault(); // Förhindra att formuläret skickas

  // Hämta stad och API-nyckel från input-fälten
  let city = document.getElementById('cityInput').value;
  let apiKey = 'e652f2abd85b6a6a475e0568d8dc42b9';

  // Validera stadsinput
  if (!city) {
    let resultDiv = document.getElementById('result');
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
      let resultDiv = document.getElementById('result');
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

      // Extrahera relevant väderprognosdata baserat på antalet timmar och aktuell tid
      for (let i = 0; i <= hours; i++) {
        let forecastIndex = currentHour + i; // Använd nuvarande timme och i för att hitta rätt prognos
        let forecastTime = new Date(currentTime.getTime() + i * 60 * 60 * 1000); // Tid för varje prognos framåt
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

// Funktion för att formatera tiden som "HH:MM"
function formatTime(hours, minutes) {
  let formattedHours = hours < 10 ? '0' + hours : hours;
  let formattedMinutes = minutes < 10 ? '0' + minutes : minutes;
  return formattedHours + ':' + formattedMinutes;
}

// Funktion för att visa aktuellt väder
function displayCurrentWeather(currentWeatherData) {
  let resultDiv = document.getElementById('result');
  resultDiv.innerHTML = '';

  let weatherInfoDiv = document.createElement('div');
  weatherInfoDiv.classList.add('weather-info');

  let iconImg = document.createElement('img');
  iconImg.src = 'http://openweathermap.org/img/wn/' + currentWeatherData.weatherIcon + '.png';
  iconImg.alt = 'Weather Icon';
  weatherInfoDiv.append(iconImg);

  let descriptionPara = document.createElement('p');
  descriptionPara.innerHTML = '<strong>Description:</strong> ' + currentWeatherData.description;
  weatherInfoDiv.append(descriptionPara);

  let temperaturePara = document.createElement('p');
  temperaturePara.innerHTML = '<strong>Temperature:</strong> ' + currentWeatherData.temperature + ' °C';
  weatherInfoDiv.append(temperaturePara);

  let windSpeedPara = document.createElement('p');
  windSpeedPara.innerHTML = '<strong>Wind Speed:</strong> ' + currentWeatherData.windSpeed + ' m/s';
  weatherInfoDiv.append(windSpeedPara);

  let currentTime = new Date();
  let timePara = document.createElement('p');
  timePara.innerHTML = '<strong>Current Time:</strong> ' + formatTime(currentTime.getHours(), currentTime.getMinutes());
  weatherInfoDiv.append(timePara);

  resultDiv.append(weatherInfoDiv);

  // Försvinnande bakgrundsfärg baserat på temperatur
  let temperature = currentWeatherData.temperature;
  let color = '';

  if (temperature <= 0) {
    color = '#85c1e9'; // Ljusblå för kallt väder
  } else if (temperature > 0 && temperature <= 20) {
    color = '#f7dc6f'; // Ljusgul för milt väder
  } else {
    color = '#e74c3c'; // Ljusröd för varmt väder
  }

  animateBackgroundColor(weatherInfoDiv, color); // Animerar bakgrundsfärgen

  // Återställ bakgrundsfärgen efter 5 sekunder
  setTimeout(function() {
    weatherInfoDiv.style.backgroundColor = '';
  }, 5000);
}

// Funktion för att animera bakgrundsfärgen för ett element
function animateBackgroundColor(element, color) {
  element.classList.add('animate'); // Lägger till en klass för animering
  element.style.backgroundColor = color;
}

// Återställ bakgrundsfärgen efter animation
function resetBackgroundColor(element) {
  element.classList.remove('animate');
  element.style.backgroundColor = '';
}

// Funktion för att visa väderprognos
function displayWeatherForecast(forecastData) {
  let resultDiv = document.getElementById('result');
  resultDiv.innerHTML = '';

  forecastData.forEach(function(forecast) {
    let forecastDiv = document.createElement('div');
    forecastDiv.classList.add('forecast-info');

    let timePara = document.createElement('p');
    timePara.innerHTML = forecast.time + 'h';
    forecastDiv.append(timePara);

    let temperaturePara = document.createElement('p');
    temperaturePara.innerHTML = '<strong>Temperature:</strong> ' + forecast.temperature + ' °C';
    forecastDiv.append(temperaturePara);

    let windSpeedPara = document.createElement('p');
    windSpeedPara.innerHTML = '<strong>Wind Speed:</strong> ' + forecast.windSpeed + ' m/s';
    forecastDiv.append(windSpeedPara);

    let iconImg = document.createElement('img');
    iconImg.src = 'http://openweathermap.org/img/wn/' + forecast.weatherIcon + '.png';
    iconImg.alt = 'Weather Icon';
    forecastDiv.append(iconImg);

    let descriptionPara = document.createElement('p');
    descriptionPara.innerHTML = '<strong>Description:</strong> ' + forecast.description;
    forecastDiv.append(descriptionPara);

    resultDiv.append(forecastDiv);
  });
}
