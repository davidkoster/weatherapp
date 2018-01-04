var weatherModelController = (function(){

    let currentWeather, weatherConditions;

    var weatherCond = {
        clear: [800],
        scattered: [801, 802],
        broken: [803],
        overcast: [804],
        drizzle: [300, 301, 302, 310, 311, 312, 313, 314, 321, 520, 521, 522, 531],
        rain: [500, 501, 502, 503, 504],
        thunderstorm: [200, 201, 202, 210, 211, 212, 221, 230, 231, 232],
        snow: [511, 600, 601, 602, 611, 612, 615, 616, 620, 621, 622],
        mist: [701, 711, 721, 731, 741, 751, 761, 762, 771, 781]
    }

    weatherConditions = new Map();

    weatherConditions.set(weatherCond.clear, '01');
    weatherConditions.set(weatherCond.scattered, '02');
    weatherConditions.set(weatherCond.broken, '03');
    weatherConditions.set(weatherCond.overcast, '04');
    weatherConditions.set(weatherCond.drizzle, '09');
    weatherConditions.set(weatherCond.rain, '10');
    weatherConditions.set(weatherCond.thunderstorm , '11');
    weatherConditions.set(weatherCond.snow, '13');
    weatherConditions.set(weatherCond.mist, '50');

    



    let weatherDays = [];


    class WeatherDay {
        constructor(day, weather, temp){
            this.day = day;
            this.weather = weather;
            this.temp = temp;
        }

        getMaxTemp(){
            return Math.max(...this.temp);
        }
        getMinTemp(){
            return Math.min(...this.temp);
        }

        getMostFrequent(arr){
            
            let maxCount = 0; // Counter of max element
            let freqObj = {}; // Frequency object to store key(name of element in arr) value(occurences of element in arr) pairs
            let freqEl; // Store the element that occurs most frequently

            // Loop over arr
            for( let i = 0, len = arr.length; i < len; i++ ){

                let el =  arr[i];

                if(freqObj[el] === undefined){ // if the element does not exist in the object
                    freqObj[el] = 1; // then add it and set its value to 1 
                } else {
                    freqObj[el] ++; // else increase the value by 1
                }

                if(freqObj[el] > maxCount){ // if the value of the current element is greater than the current maxCount 
                    maxCount = freqObj[el]; // then set the maxCount to the value of the current element
                    freqEl = el; // and set the most frequent element to the current element
                }

            }
            // return the hight occuring element
            return freqEl;
        }

    }

    return {
        addWeatherDay: function(day, temp, weather){
            let weatherDay = new WeatherDay(day, temp, weather);
            weatherDays.push(weatherDay);

            return weatherDay;
        },

        getWeatherDays: function(){
            return weatherDays;
        },

        getKeys: function(){
            return keys;
        },

        getWeather: function(){
            return currentWeather;
        },

        setWeather: function(weather){
            currentWeather = weather;
        },

        getWeatherConditions: function(){
            return weatherConditions;
        }

    }

})();