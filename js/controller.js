var weatherController = (function( modelCtrl, viewCtrl ){

    var DOMStrings = viewCtrl.getDOMStrings();


    var clearInput = function (input){
        $(input).on('focus', viewCtrl.clearInput);
    };
    

    var showSearch = function (){
        $(DOMStrings.curWeatherInput).on('keyup', viewCtrl.showSearch );
    };


    var setupEventListeners = function(){
        $( DOMStrings.curWeatherBtn ).on( 'click', ctrlAddCityWeather );
        $(window).scroll( viewCtrl.setWindowScrollAnimation );

        clearInput(DOMStrings.curWeatherInput);
        showSearch();
    };


    var animatePlaceHolder =  function() {
        weatherViewController.placeholderAnimate( DOMStrings.curWeatherInput , 'Type City');
    };


    var convert2Dig = function(int){
        return ("0" + int).slice(-2);
    }


    var getTime = function(time){
        var arr, hr, min, sec, mil, string;

        string = '';
        arr = [];

        arr.push( time.hour );
        arr.push( time.minute );
        arr.push( time.second );
        arr.push( time.millisecond );

        arr.forEach( el => string += convert2Dig(el) );

        return parseInt(string);
    }

    var getLocalTime = function(time, timeZone){
        return DateTime.fromMillis( time, { zone: timeZone } );
    }

    var updateCurWeatherUI = function(city, temp, desc){
        viewCtrl.displayCity(city);
        viewCtrl.displayTemp(temp);
        viewCtrl.displayDesc(desc);
    }


    var getWeatherIconCode = function(id){
        let weatherConditions = modelCtrl.getWeatherConditions();
        let icon = null;
        for (var [key, value] of weatherConditions){
            if(key.indexOf(id) !== -1){
                icon = value; // iterate over the weather conditions map element and set the weather icon to its value
            }
        }
        return icon;
    }


    var updateDaysNav = function(data, currentDay, timeZone){
    
        let day, curDay, time, temp, weather, weatherDay;
        let days = [];
        let tempArr = [];
        let weatherArr = [];

        // loop over data
        // add day as key and arr of temp and value
        data.list.forEach(function(el, i){

            temp = el.main.temp;
            weather = el.weather[0].id;
            time = DateTime.fromMillis( el.dt * 1000 );
            time = getLocalTime(time, timeZone);
            day = time.weekdayShort;
            
            if(curDay !== day){
                tempArr = [];
                weatherArr = [];
            }

            tempArr.push(temp);
            weatherArr.push(weather);

            if(curDay !== day){
                weatherDay = modelCtrl.addWeatherDay( day, weatherArr, tempArr );
            } else {
                weatherDay.temp = tempArr;
                weatherDay.weather = weatherArr; 
            }

            curDay = day;

            console.log(day);
            
        });


        let weatherDays = modelCtrl.getWeatherDays();

        console.log(weatherDays);

        weatherDays.forEach(function(el, i){
            if(el.day !== 'currentDay'){
                let icon = getWeatherIconCode( el.getMostFrequent(el.weather));
                viewCtrl.updateNavDays(i, el, icon);
            }
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
                updateCurWeatherUI(city, temp, desc);
                viewCtrl.hideShowCurWeather();

    
                lon = data.coord.lon;
                lat = data.coord.lat;
                timestamp = data.dt;
                
                currentTimeStamp = data.dt * 1000; // Multiply by 1000 to get current time
                
    
                $.get(`https://maps.googleapis.com/maps/api/timezone/json?location=${ lat },${ lon }&timestamp=${ timestamp }&key=${ keys.google }`, function( data ){
                
                    // checking timezone of searched location to load the appropriate time in the UI

                    let timeZone, localTime, locationTime, days, currentWeather;
                    
                    timeZone = data.timeZoneId;
    
                    localTime = getLocalTime( currentTimeStamp, timeZone );



                    currentWeather = modelCtrl.getWeather();
                    sunrise = getLocalTime( currentWeather.sys.sunrise * 1000, timeZone );
                    sunset = getLocalTime( currentWeather.sys.sunset * 1000, timeZone );


                    weatherID = currentWeather.weather[0].id;
                    weatherIcon = getWeatherIconCode(weatherID);
                    
                    if(weatherIcon === null){
                        weatherIcon = currentWeather.weather[0].icon;
                    }

    
                    if( getTime(localTime) < getTime(sunrise) || getTime(localTime) > getTime(sunset) ) {
                        // if current time is night then
                        viewCtrl.addNightClass(); // add the night class to the background
                        $.get('weather/houseandmountain-n.html', viewCtrl.addBackgroundUI ); // get the night background image and replace the current svg

                        if(weatherIcon){
                            weatherIcon += 'n'; // concatinate the night suffix to the icon name
                        } else {
                            weatherIcon = currentWeather.weather[0].icon; // if it wasn't in the map object then load the default icon from the current weather object;
                        }
                        
                    } else {
                        // do the last steps from above but for daytime
                        if(weatherIcon){
                            weatherIcon += 'd';
                        } else {
                            weatherIcon = currentWeather.weather[0].icon;
                        }
                    }



                    days = [];
                    for(let i = 0; i < 5; i++){
                        days.push(localTime.plus({days: i}).weekdayShort);
                    }

                    //viewCtrl.addDaysToNav(days);

                    locationTime = localTime.toLocaleString(DateTime.TIME_SIMPLE);

                    //viewCtrl.displayTime(locationTime);

                    $.get( `http://api.openweathermap.org/data/2.5/forecast?q=${ city }&units=metric&APPID=${ keys.openWeather }`, function( data ) {

                        updateDaysNav(data, days[0], timeZone);

                        viewCtrl.addWeatherClass(weatherIcon); // add the weathe icon class

                        $.get('weather/' + weatherIcon + '.html', viewCtrl.addWeatherUI ); // get the weather svg ad add it to the page
        
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

    return {
        init: function(){
            setupEventListeners();
            animatePlaceHolder();

        }
    }

})( weatherModelController, weatherViewController );