var weatherController = (function( modelCtrl, viewCtrl ){

    var DOMStrings = viewCtrl.getDOMStrings(); //Get all DOM elements from the view Ctrl

    var getMostFrequent = function(arr){
            
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
    };

    var clearInput = function (input){
        $(input).on('focus', viewCtrl.clearInput); // On focus clear the serch input
    }; 

    var showSearch = function (){
        $(DOMStrings.curWeatherInput).on('keyup', viewCtrl.showSearch ); // Show the search submit button on keyup if there is text in the search iinput
    };

    var animatePlaceHolder =  function() {
        viewCtrl.placeholderAnimate( DOMStrings.curWeatherInput , 'Type City'); // Animate input placeholder text
    };

    // Function for converting single digit numbers to two digits ( eg. 1 to 01 )
    // Takes an int and adds a O to the start. The last two characters are then sliced and returned
    // Note this returns a String not and Int
    var convert2Dig = function(int){
        return ("0" + int).slice(-2);
    }

    // Function takes a luxon date object and returns the time as an Int without date info
    var getTime = function(time){
        var arr, hr, min, sec, mil, string;

        string = '';
        arr = [];

        // Push time elements to an array
        arr.push( time.hour );
        arr.push( time.minute );
        arr.push( time.second );
        arr.push( time.millisecond );

        // Convert arr elements to two digit strings and concat together
        arr.forEach( el => string += convert2Dig(el) );

        // Parse as Int and return
        return parseInt(string);
    }

    // Uses luxon to return a Date time object in the a specific timezone
    // Takes a timestamp and timezone as arguments
    var getLocalTime = function(time, timeZone){
        return DateTime.fromMillis( time, { zone: timeZone } );
    }

    // Updates the text UI elements for current weather
    var updateCurWeatherUI = function(temp, desc){
        viewCtrl.displayTemp(temp);
        viewCtrl.displayDesc(desc);
    }

    // Updates the imagery UI elements for current weather
    var updateWeatherImage = function(weatherIcon, isNight){

        if( isNight ) {
            viewCtrl.addNightClass(); // add the night class to the background
            weatherIcon += 'n'; // concatinate the night suffix to the icon name
            
        } else {
            viewCtrl.removeNightClass();
            weatherIcon += 'd'; // concatinate the day suffix to the icon name
        }

        $.get('weather/' + weatherIcon + '.html', viewCtrl.addWeatherUI ); // get the weather svg ad add it to the page
        viewCtrl.addWeatherClass(weatherIcon); // add the weather icon class

    }

    // Function for returning the appropriate weather icon code.
    // Takes the weather id nd loops over the weather conditions map to return the corresponding weather icon code 
    var getWeatherAttr = function(id, type){
        let weatherConditions = modelCtrl.getWeatherConditions();
        let result = null;
        for (var [key, value] of weatherConditions){
            if(key.indexOf(id) !== -1){
                if(type === 'icon'){
                    result = value[0]; // iterate over the weather conditions map element and set the weather icon to its value
                } else if(type === 'desc') {
                    result = value[1];
                }
            }
        }
        return result; // returns weather icon code if found else returns null
    }

    // Updates the UI in the days navigation
    // Takes the data response object from the forecast api request, current day and the timezone
    var updateDaysNav = function(data, currentDay, timeZone){
    
        let day, curDay, time, temp, weather, weatherDay, icon;
        let days = [];
        let tempArr = [];
        let weatherArr = [];

        // loop over data list elements which are a forecast of 3 hour intervals
        data.list.forEach(function(el, i){

            temp = el.main.temp;
            weather = el.weather[0].id;
            time = DateTime.fromMillis( el.dt * 1000 );
            time = getLocalTime(time, timeZone);
            day = time.weekdayShort;
            
            if(curDay !== day){ // if curDay and day are not equal reset temp and weather arrs
                tempArr = [];
                weatherArr = [];
            }

            // Push new values to the arrs
            tempArr.push(temp);
            weatherArr.push(weather);

            if(curDay !== day){ // if curDay and daya are not equal create new weatherDay object
                weatherDay = modelCtrl.addWeatherDay( day, weatherArr, tempArr );
            } else { // else update the current weatherDay object
                weatherDay.temp = tempArr;
                weatherDay.weather = weatherArr; 
            }

            curDay = day;
        });

        let weatherDays = modelCtrl.getWeatherDays();

        weatherDays.forEach(function(el, i){
            if(el.day === currentDay){
                icon = getWeatherAttr( modelCtrl.getWeather().weather[0].id, 'icon' );
            } else {
                icon = el.getMostFrequentWeather()[0];
            }
            viewCtrl.updateNavDays(i, el, icon);
        });

    }

    

    var ctrlAddCityWeather = function(){
        var city, input, keys;

        input = viewCtrl.getInput();
        city = input.city;
        keys = modelCtrl.getKeys();
        
    
        if( city !== '' ){

            $.get( `http://api.openweathermap.org/data/2.5/weather?q=${ city }&units=metric&APPID=${ keys.openWeather }`, function( data ) {
    
                let lon, lat, timestamp, currentTimeStamp, temp, sunrise, sunset, desc, weatherID, weatherIcon;

                console.log(data);
                modelCtrl.setWeather(data);


                temp = data.main.temp;
                desc = data.weather[0].description;

                viewCtrl.displayCity(city);
                updateCurWeatherUI(temp, desc);
                viewCtrl.hideShowCurWeather();

    
                lon = data.coord.lon;
                lat = data.coord.lat;
                timestamp = data.dt;
                
                currentTimeStamp = data.dt * 1000; // Multiply by 1000 to get current time
                
    
                $.get(`https://maps.googleapis.com/maps/api/timezone/json?location=${ lat },${ lon }&timestamp=${ timestamp }&key=${ keys.google }`, function( data ){
                
                    // checking timezone of searched location to load the appropriate time in the UI

                    let timeZone, localTime, locationTime, currentWeather, isNight;

                    isNight = false;
                    
                    timeZone = data.timeZoneId;
    
                    localTime = getLocalTime( currentTimeStamp, timeZone );


                    currentWeather = modelCtrl.getWeather();
                    sunrise = getLocalTime( currentWeather.sys.sunrise * 1000, timeZone );
                    sunset = getLocalTime( currentWeather.sys.sunset * 1000, timeZone );


                    weatherID = currentWeather.weather[0].id;
                    weatherIcon = getWeatherAttr(weatherID, 'icon');
                    
                    if(weatherIcon === null){
                        weatherIcon = currentWeather.weather[0].icon.slice(2);
                    }

                    if( getTime(localTime) < getTime(sunrise) || getTime(localTime) > getTime(sunset) ) {
                        isNight = true;
                    }

                    modelCtrl.updateIsNight(isNight);

                    locationTime = localTime.toLocaleString(DateTime.TIME_SIMPLE);

                    //viewCtrl.displayTime(locationTime);

                    $.get( `http://api.openweathermap.org/data/2.5/forecast?q=${ city }&units=metric&APPID=${ keys.openWeather }`, function( data ) {
                        console.log(data);
                        updateDaysNav(data, localTime.weekdayShort, timeZone);
                        viewCtrl.showDaysNav();

                        updateWeatherImage(weatherIcon, isNight);
                        
        
                    }).fail(function(){
                        viewCtrl.displayError();
                    });

    
                }).fail(function(){
                    viewCtrl.displayError();
                });

            }).fail(function(){
                viewCtrl.displayError();
            });
        }
    };

    var weatherDayClick = function(){
        let dayID, weather, icon, desc, temp, isNight;
        dayID = viewCtrl.addActiveClassToDaysNavDay($(this));

        if(dayID === 0){
            weather = modelCtrl.getWeather();
            icon = getWeatherAttr( weather.weather[0].id, 'icon' );
            temp = weather.main.temp;
            isNight = weather.isNight;
            desc = weather.weather[0].description;

            
        } else {
            weather = modelCtrl.getWeatherDays()[dayID];
            console.log(weather);
            icon = weather.getMostFrequentWeather()[0];
            temp = weather.getMaxTemp();
            isNight = false;
            desc = weather.getMostFrequentWeather()[1];

        }
        updateCurWeatherUI(temp, desc);
        updateWeatherImage(icon, isNight);
    }

    var setupEventListeners = function(){
        $( DOMStrings.curWeatherBtn ).on( 'click', ctrlAddCityWeather ); // Add event listener for the city search submit button
        $(window).scroll( viewCtrl.setWindowScrollAnimation ); // Add listener to animate background on scroll
        $(DOMStrings.daysNavDay).on('click', weatherDayClick);

        clearInput(DOMStrings.curWeatherInput); // Add event listener for to clear the search input on focus
        showSearch(); //Add event listener to show the search submit button
    };

    return {
        init: function(){
            setupEventListeners();
            animatePlaceHolder();

        }
    }

})( weatherModelController, weatherViewController );