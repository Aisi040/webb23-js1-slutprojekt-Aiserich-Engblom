document.getElementById('weatherForm').addEventListener('submit', function(event) {
    event.preventDefault();
  
    let city = document.getElementById('cityInput').value;
    let apiKey = 'e652f2abd85b6a6a475e0568d8dc42b9';
  
    // Fetch current weather
    fetchCurrentWeather(city, apiKey)
      .then(function(currentWeatherData) {
        displayCurrentWeather(currentWeatherData);
        return fetchWeatherForecast(city, apiKey);
      })
      .then(function(forecastData) {
        displayWeatherForecast(forecastData);
      })
      .catch(function(error) {
        let resultDiv = document.getElementById('result');
        resultDiv.innerHTML = '<p class="error-message">Error: ' + error.message + '</p>';
      });
  });
  
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
  
  function fetchWeatherForecast(city, apiKey) {
    let hours = parseInt(document.getElementById('hoursInput').value);
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
        let interval = 3; // Three-hour intervals
  
        // Extract the relevant forecast data based on the number of hours
        let forecastData = [];
        for (let i = 0; i < forecastList.length && i < hours; i += interval) {
          let time = forecastList[i].dt_txt.split(' ')[1].slice(0, -3);
          let temperature = (forecastList[i].main.temp - 273.15).toFixed(1);
          let weatherIcon = forecastList[i].weather[0].icon;
          forecastData.push({ time, temperature, weatherIcon });
        }
  
        return forecastData;
      });
  }
  
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
  
    resultDiv.append(weatherInfoDiv);
  }
  
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
      temperaturePara.innerHTML = forecast.temperature + ' °C';
      forecastDiv.append(temperaturePara);
  
      let iconImg = document.createElement('img');
      iconImg.src = 'http://openweathermap.org/img/wn/' + forecast.weatherIcon + '.png';
      iconImg.alt = 'Weather Icon';
      forecastDiv.append(iconImg);
  
      resultDiv.append(forecastDiv);
    });
  }
  