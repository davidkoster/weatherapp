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

    weatherConditions.set(weatherCond.clear, ['01', 'Clear']);
    weatherConditions.set(weatherCond.scattered, ['02', 'Cloudy']);
    weatherConditions.set(weatherCond.broken, ['03', 'Cloudy']);
    weatherConditions.set(weatherCond.overcast, ['04', 'Cloudy']);
    weatherConditions.set(weatherCond.drizzle, ['09', 'Drizzle']);
    weatherConditions.set(weatherCond.rain, ['10', 'Rain']);
    weatherConditions.set(weatherCond.thunderstorm , ['11', 'Thunderstorms']);
    weatherConditions.set(weatherCond.snow, ['13', 'Snow']);
    weatherConditions.set(weatherCond.mist, ['50', 'Mist']);

    

    const keys = {
        openWeather: 'b34e9c1fd875ac948d81551fd8bc6c02',
        google: 'AIzaSyCxRruRUdKgB4lFtfkq-hUHM6YeFoTOQ6U',
    }

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

        getMostFrequentWeather(){

            //let result = null;

            
            let maxCount = 0; // Counter of max element
            let freqObj = {}; // Frequency object to store key(name of element in arr) value(occurences of element in arr) pairs
            let freqEl; // Store the element that occurs most frequently

            // Loop over arr
            for( let i = 0, len = this.weather.length; i < len; i++ ){

                let el =  this.weather[i];

                for (var [key, value] of weatherConditions){
                    if(key.indexOf(el) !== -1){
                        el = [value[0], value[1]]; // iterate over the weather conditions map element and set the weather icon to its value
                        if(el[0] === '02' || el === '03' || el === '04' ){
                            el[0] = '03';
                        }
                    }
                }

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
            console.log(freqEl);
            return freqEl;


            // var getWeatherAttr = function(id, type){
            //     let weatherConditions = modelCtrl.getWeatherConditions();
            //     let result = null;
            //     for (var [key, value] of weatherConditions){
            //         if(key.indexOf(id) !== -1){
            //             if(type === 'icon'){
            //                 result = value[0]; // iterate over the weather conditions map element and set the weather icon to its value
            //             } else if(type === 'desc') {
            //                 result = value[1];
            //             }
            //         }
            //     }
            //     return result; // returns weather icon code if found else returns null
            // }
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

        updateIsNight: function(isNight){
            currentWeather['isNight'] = isNight; 
        },

        getWeatherConditions: function(){
            return weatherConditions;
        }

    }

})();