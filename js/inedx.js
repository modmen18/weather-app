  /**********************( بِسْمِ اللَّـهِ الرَّحْمَـٰنِ الرَّحِيمِ )******************************/ 


                                                    /*****المتغيرات*****/ 
const navLinks = Array.from(document.querySelectorAll('.nav-item'));
const btnFind = document.querySelector('#btnFind');
const findInput = document.querySelector('#findInput');
const forecast = document.querySelector('#forecast');


                                   //////// بتاع الطقس  API////////

const APIKey = '0504276985d1463eaa6155223233112';
const baseURL = 'https://api.weatherapi.com/v1/forecast.json';

let searchLocation = '';
let weatherList = {};
const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

getUserCity(); //بنجيب موقع الشخص علشان نعرض الطقس//

// *=============== JS FUNCTIONS HELPERS ===============
function toggleCssClass(el, className, condition) {
    condition ? el.classList.add(className) : el.classList.remove(className);
}

function handleDay(dateString) {           // بترجع اسم اليوم//
    let d = new Date(dateString);
    let dayName = days[d.getDay()];
    return dayName;
}

function handleMonth(dateString) {        //بترجع اسم الشهر//
    let d = new Date(dateString);
    let monthName = monthNames[d.getMonth()];
    return monthName;
}

function normalizeCityName(cityName) {
    return cityName.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

function getUserCity() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(async (position) => {
            const latitude = position.coords.latitude;
            const longitude = position.coords.longitude;
            try {
                let response = await fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`);
                let data = await response.json();
                data.city ? searchLocation = normalizeCityName(data.city) : searchLocation = 'Assiut';
                displayWeather();
            } catch (err) {
                console.log("Error fetching geolocation data:", err);
                searchLocation = 'Assiut';
                displayWeather();
            }
        }, (error) => {
            console.log("Error getting user location:", error.message);
            searchLocation = 'Assiut';
            displayWeather();
        });
    } else {
        console.log("Geolocation is not supported by this browser.");
        searchLocation = 'Assiut';
        displayWeather();
    }
}

// ^=============== JS FUNCTIONS ===============
function handleActiveNavLink(linksArr, link) {
    linksArr.forEach(l => toggleCssClass(l, 'active', false));
    toggleCssClass(link, 'active', true);
}

async function getWeather(searchLocation) {   //هنكلم ال api عن طريق المدينة علشان ترجعلنا الطقس لمدة 3 ايام//
    try {
        let response = await fetch(`${baseURL}?key=${APIKey}&q=${searchLocation}&days=3`);
        if (response.ok && response.status === 200) {
            return await response.json();
        } else {
            throw new Error('Failed to fetch weather data');
        }
    } catch (e) {
        console.log("An error occurred:", e);
        return null;
    }
}

async function displayWeather() {   
    weatherList = await getWeather(searchLocation);
    if (!weatherList) {
        forecast.innerHTML = '<p class="text-danger">Unable to fetch weather data. Please try again later.</p>';
        return;
    }
    let currentObj = weatherList.current;
    let locationObj = weatherList.location;
    let forecastArr = weatherList.forecast.forecastday;
    let weatherContainer = `
        <!--^ today -->
        <div class="col-lg-4">
            <div class="forecast today rounded rounded-3">
                <div id="today" class="forecast-header px-3 d-flex justify-content-between">
                    <div class="day fw-semibold">${handleDay(locationObj.localtime)}</div>
                    <div class="date text-light">${new Date(locationObj.localtime.split(' ')[0]).getDate()} ${handleMonth(locationObj.localtime.split(' ')[0])}</div>
                </div>
                <div id="current" class="forecast-content px-3">
                    <div class="location fs-4">${locationObj.country}, ${locationObj.name}</div>
                    <div class="time me-auto">update: ${locationObj.localtime.split(' ')[1]}</div>
                    <div class="degree d-flex justify-content-between mt-2">
                        <div class="num">${currentObj.temp_c}<sup>o</sup>C</div>
                        <div class="forecast-icon align-self-end">
                            <img src="https:${currentObj.condition.icon}" alt="weather icon" width="90">

                        </div>
                    </div>
                    <p class="custom fs-5">${currentObj.condition.text}</p>
                    <div class="mt-4 d-flex justify-content-between">
                        <span class="fs-5"><img class="me-2" src="./imgs/icon-umberella.png" alt="">${currentObj.wind_degree}%</span>
                        <span class="fs-5"><img class="me-2" src="./imgs/icon-wind.png" alt="">${currentObj.wind_kph}km/h</span>
                        <span class="fs-5"><img class="me-2" src="./imgs/icon-compass.png" alt="">${currentObj.wind_dir}</span>
                    </div>
                </div>
            </div>
        </div>
        <!--^ tomorrow -->
        <div id="tomorrow" class="col-lg-4 mt-3 mt-lg-0">
            <div class="text-center h-100 rounded-2 forecast tomorrow">
                <div class="forecast-header fw-semibold px-3">
                    <div class="day">${handleDay(forecastArr[1].date)}</div>
                </div>
                <div class="forecast-content px-3">
                    <div class="forecast-icon">
                       <img src="https:${forecastArr[1].day.condition.icon}" alt="weather icon" width="90">

                    </div>
                    <div class="degree fs-2">${forecastArr[1].day.maxtemp_c}<sup>o</sup>C</div>
                    <p class="fs-5 mb-0">${forecastArr[1].day.mintemp_c}<sup>o</sup></p>
                    <p class="custom fs-5">${forecastArr[1].day.condition.text}</p>
                </div>
            </div>
        </div>
        <!--^ afterTomorrow -->
        <div id="afterTomorrow" class="col-lg-4 mt-3 mt-lg-0">
            <div class="text-center h-100 rounded-2 forecast">
                <div class="forecast-header fw-semibold px-3">
                    <div class="day">${handleDay(forecastArr[2].date)}</div>
                </div>
                <div class="forecast-content px-3">
                    <div class="forecast-icon">
                       <img src="https:${forecastArr[1].day.condition.icon}" alt="weather icon" width="90">
                    </div>
                    <div class="degree fs-2">${forecastArr[2].day.maxtemp_c}<sup>o</sup>C</div>
                    <p class="fs-5 mb-0">${forecastArr[2].day.mintemp_c}<sup>o</sup></p>
                    <p class="custom fs-5">${forecastArr[2].day.condition.text}</p>
                </div>
            </div>
        </div>
    `;
    forecast.innerHTML = weatherContainer;
}

// &=============== EVENTS ===============
navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
        handleActiveNavLink(navLinks, e.target.parentNode);
    });
});

if (btnFind) {
    btnFind.addEventListener('click', (e) => {
        e.preventDefault();
        if (findInput.value) {
            searchLocation = findInput.value;
            displayWeather();
        }
    });
}

if (findInput) {
    let debounceTimeout;
    findInput.addEventListener('keyup', (e) => {
        clearTimeout(debounceTimeout);
        debounceTimeout = setTimeout(() => {
            if (findInput.value) {
                searchLocation = findInput.value;
                displayWeather();
            }
        }, 500);
    });
}

                                                   /*dark mode*/ 
document.getElementById("toggleMode").addEventListener("click", () => {
    document.body.classList.toggle("light-mode");
  });
  