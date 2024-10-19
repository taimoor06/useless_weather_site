const cityInput = document.getElementById('city');
const suggestionsDiv = document.getElementById('suggestions');
const resultDiv = document.getElementById('result');

cityInput.addEventListener('input', function() {
	const query = cityInput.value;

	if (query.length < 2) {
		suggestionsDiv.innerHTML = '';
		return;
	}

	// Nominatim API for suggestions
	const apiUrl = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=5`;

	fetch(apiUrl)
		.then(response => response.json())
		.then(data => {
			suggestionsDiv.innerHTML = ''; // Clear previous suggestions
			if (data.length > 0) {
				data.forEach(item => {
					const suggestionItem = document.createElement('div');
					suggestionItem.classList.add('suggestion');
					suggestionItem.textContent = item.display_name;
					suggestionItem.addEventListener('click', () => {
						cityInput.value = item.display_name; // Set selected value
						suggestionsDiv.innerHTML = ''; // Clear suggestions
					});
					suggestionsDiv.appendChild(suggestionItem);
				});
			}
		})
		.catch(error => {
			console.error('Error fetching suggestions:', error);
		});
});

// Clear suggestions when the input loses focus
cityInput.addEventListener('blur', function() {
	setTimeout(() => {
		suggestionsDiv.innerHTML = ''; // Clear suggestions after a brief timeout
	}, 100); // Delay to allow click event on suggestion to register
});

document.getElementById('locationForm').addEventListener('submit', function(event) {
	event.preventDefault(); // Prevent form submission

	const city = cityInput.value.trim();
	if (city === "") {
		resultDiv.innerHTML = "<p>Please enter a city name.</p>";
		return;
	}

	const apiUrl = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(city)}&format=json&limit=1`;

	fetch(apiUrl)
		.then(response => response.json())
		.then(data => {
			if (data.length > 0) {
				const { lat, lon } = data[0];
				//resultDiv.innerHTML = `<p>Coordinates for <strong>${city}</strong>:<br>Latitude: ${lat}, Longitude: ${lon}</p>`;
				fetchWeather(lat, lon); // Fetch weather information
			} else {
				resultDiv.innerHTML = "<p>No results found for the city name.</p>";
			}
		})
		.catch(error => {
			resultDiv.innerHTML = "<p>Error fetching data. Please try again later.</p>";
			console.error('Error:', error);
		});
});

// Fetch weather information using Open Meteo
function fetchWeather(lat, lon) {
	const weatherApiUrl = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true`;
	fetch(weatherApiUrl)
		.then(response => response.json())
		.then(data => {
			const { temperature, windspeed, weathercode } = data.current_weather;
			const weatherDescriptions = {
				0: "Clear sky ☀️",
				1: "Mainly clear ☀️",
				2: "Partly cloudy ⛅",
				3: "Overcast ☁️",
				45: "Fog 🌫️",
				48: "Depositing rime fog 🌁",
				61: "Drizzle ☔",
				63: "Rain 🌧️",
				80: "Rain showers 🌧️",
				95: "Thunderstorm 🌩️",
				99: "Thunderstorm with rain ⛈️",
			};
			const description = weatherDescriptions[weathercode] || "Unknown weather";
			resultDiv.innerHTML += `<p>Current Weather: ${description}, Temperature: ${temperature}°C, Windspeed: ${windspeed} km/h</p>`;
		})
		.catch(error => {
			resultDiv.innerHTML += "<p>Error fetching weather information. Please try again later.</p>";
			console.error('Error fetching weather:', error);
		});
}

