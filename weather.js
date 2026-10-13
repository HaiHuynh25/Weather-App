const apiKey = "139009ed334735582800834038c8b81f";
let apiUrl = "https://api.openweathermap.org/data/2.5/weather?units=metric&q=";
let forecastUrl = "https://api.openweathermap.org/data/2.5/forecast?units=metric&q=";

const searchBox = document.querySelector(".search-container input");
const searchBtn = document.querySelector("#search-btn");
const weatherIcon = document.querySelector(".weather-icon");
const errorElement = document.querySelector(".error");
const weatherDisplay = document.querySelector(".weather-display");
const unitButtons = document.querySelectorAll(".unit-btn");

// Recent searches functionality
const recentList = document.querySelector(".recent-list");
const recentSearches = [];

// Add to recent searches
function addToRecent(city) {
  if (!recentSearches.includes(city)) {
    recentSearches.unshift(city);
    if (recentSearches.length > 10) {
      recentSearches.pop();
    }
    
    updateRecentList();
  }
}

// Update recent list display
function updateRecentList() {
  recentList.innerHTML = '';
  recentSearches.forEach(city => {
    const item = document.createElement('div');
    item.className = 'recent-item';
    item.textContent = city;
    item.addEventListener('click', () => {
      searchBox.value = city;
      checkWeather(city);
    });
    recentList.appendChild(item);
  });
}

// Unit conversion
unitButtons.forEach(btn => {
  btn.addEventListener('click', () => {
    unitButtons.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    
    const unit = btn.dataset.unit;
    apiUrl = `https://api.openweathermap.org/data/2.5/weather?units=${unit}&q=`;
    forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?units=${unit}&q=`;
    
    if (searchBox.value) {
      checkWeather(searchBox.value);
    }
  });
});

async function checkWeather(city) {
  try {
    // Current weather
    const response = await fetch(apiUrl + city + `&appid=${apiKey}`);
    
    if (response.status === 404) {
      showError();
      return;
    }
    
    const data = await response.json();
    
    // Update DOM
    document.querySelector(".city").textContent = data.name;
    document.querySelector(".temp").textContent = Math.round(data.main.temp) + "°" + (document.querySelector('.unit-btn.active').dataset.unit === 'metric' ? 'C' : 'F');
    document.querySelector(".humidity").textContent = data.main.humidity + "%";
    document.querySelector(".wind").textContent = data.wind.speed + (document.querySelector('.unit-btn.active').dataset.unit === 'metric' ? " km/h" : " mph");
    document.querySelector(".pressure").textContent = data.main.pressure + " hPa";
    document.querySelector(".feels-like").textContent = Math.round(data.main.feels_like) + "°" + (document.querySelector('.unit-btn.active').dataset.unit === 'metric' ? 'C' : 'F');
    
    // Weather icon
    const weatherMain = data.weather[0].main;
    if (weatherMain === "Clouds") {
      weatherIcon.src = "https://cdn-icons-png.flaticon.com/512/6122/6122714.png";
    } else if (weatherMain === "Clear") {
      weatherIcon.src = "https://cdn-icons-png.flaticon.com/512/3222/3222800.png";
    } else if (weatherMain === "Rain") {
      weatherIcon.src = "https://cdn-icons-png.flaticon.com/512/414/414927.png";
    } else if (weatherMain === "Drizzle") {
      weatherIcon.src = "https://cdn-icons-png.flaticon.com/512/3093/3093393.png";
    } else if (weatherMain === "Mist") {
      weatherIcon.src = "https://cdn-icons-png.flaticon.com/512/1197/1197102.png";
    } else if (weatherMain === "Snow") {
      weatherIcon.src = "https://cdn-icons-png.flaticon.com/512/642/642102.png";
    } else {
      weatherIcon.src = "https://cdn-icons-png.flaticon.com/512/1146/1146857.png";
    }
    
   
    weatherDisplay.style.display = "flex";
    errorElement.style.display = "none";
    
 
    addToRecent(city);
    
   
    getForecast(city);
    
  } catch (error) {
    console.error('Error fetching weather:', error);
    showError();
  }
}

async function getForecast(city) {
  try {
    const response = await fetch(forecastUrl + city + `&appid=${apiKey}`);
    const data = await response.json();
    
    // Filter to get one forecast per day (every 24 hours)
    const dailyForecast = data.list.filter((item, index) => index % 8 === 0);
    
    // Update forecast items
    const forecastItems = document.querySelectorAll('.forecast-item');
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    
    dailyForecast.slice(0, 5).forEach((item, index) => {
      const date = new Date(item.dt * 1000);
      const dayName = days[date.getDay()];
      
      forecastItems[index].querySelector('.forecast-day').textContent = dayName;
      
      // Set forecast icon based on weather
      const forecastIcon = forecastItems[index].querySelector('.forecast-icon');
      const weatherMain = item.weather[0].main;
      
      if (weatherMain === "Clouds") {
        forecastIcon.src = "https://cdn-icons-png.flaticon.com/512/1146/1146857.png";
      } else if (weatherMain === "Clear") {
        forecastIcon.src = "https://cdn-icons-png.flaticon.com/512/3222/3222800.png";
      } else if (weatherMain === "Rain") {
        forecastIcon.src = "https://cdn-icons-png.flaticon.com/512/414/414927.png";
      } else if (weatherMain === "Drizzle") {
        forecastIcon.src = "https://cdn-icons-png.flaticon.com/512/3093/3093393.png";
      } else if (weatherMain === "Mist") {
        forecastIcon.src = "https://cdn-icons-png.flaticon.com/512/1197/1197102.png";
      } else if (weatherMain === "Snow") {
        forecastIcon.src = "https://cdn-icons-png.flaticon.com/512/642/642102.png";
      } else {
        forecastIcon.src = "https://cdn-icons-png.flaticon.com/512/1146/1146857.png";
      }
      
      // Set temperature range (min and max for the day)
      const maxTemp = Math.round(item.main.temp_max);
      const minTemp = Math.round(item.main.temp_min);
      const unit = document.querySelector('.unit-btn.active').dataset.unit === 'metric' ? 'C' : 'F';
      
      forecastItems[index].querySelector('.forecast-temp').textContent = `${maxTemp}°${unit} / ${minTemp}°${unit}`;
    });
    
  } catch (error) {
    console.error('Error fetching forecast:', error);
  }
}

function showError() {
  weatherDisplay.style.display = "none";
  errorElement.style.display = "block";
}

searchBtn.addEventListener("click", () => {
  if (searchBox.value.trim() !== "") {
    checkWeather(searchBox.value);
  }
});

searchBox.addEventListener("keyup", (e) => {
  if (e.key === "Enter") {
    if (searchBox.value.trim() !== "") {
      checkWeather(searchBox.value);
    }
  }
});


checkWeather("Michigan");