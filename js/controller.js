var weatherController = (function( modelCtrl, viewCtrl ){

    var DOMStrings = viewCtrl.getDOMStrings(); //Get all DOM elements from the view Ctrl

    var arrLoop = function(fn, arr){
        let el = null;
        for(var i=0; i<arr.length; i++){
            el = fn(arr[i]);
        }
        return el;
    }

    // Loop over an arr of objs and return the obj with matching property and value
    // if not found return -1
    var getObjInArr = function(arr, prop, val){
        let i = arr.findIndex(el => el[prop] === val);
        if(i === -1){
            return -1;
        } else {
            return arr[i];
        } 
    }

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

    var clearInput = function (input){
        $(input).on('focus', viewCtrl.clearInput); // On focus clear the serch input
    };

    var setSettingsUnitsUI = function(){
        const settings = modelCtrl.getSettings();
        let theme = modelCtrl.getSettings().theme;
        
        for(var p in settings){
            if(settings.hasOwnProperty(p)){
                $(`#${p}__${settings[p]}`).prop("checked", true);
            }
        }
        viewCtrl.setTheme(theme);

    };

    var animatePlaceHolder =  function() {
        viewCtrl.placeholderAnimate( DOMStrings.curWeatherInput , 'Type City'); // Animate input placeholder text
    };

    var animateMainMenu = function(){
        viewCtrl.toggleMenu($(this));
    };

    var showSubMenu = function(){
        viewCtrl.showSubMenu($(this));
    }

    var hideSubMenu = function(){
        viewCtrl.hideSubMenu($(this));
    }

    var onRadioChange = function(){

        const prop = $(this).attr('name');
        let val = $( `${DOMStrings.radioInput}[name=${prop}]:checked`).val();
        modelCtrl.setSettings(prop, val);

        console.log(modelCtrl.getSettings());

        if(prop === 'theme'){
            viewCtrl.setTheme(val);
        }
        
        if(modelCtrl.getWeather() !== undefined){
            ctrlAddCityWeather();
        }
    }



    var addNewCity = function(){
        //clear the city input
        viewCtrl.clearInputVal(DOMStrings.curWeatherInput);

        //animate the placeholder
        animatePlaceHolder();

        //remove current weather
        $(DOMStrings.curWeatherAnimation).html('');

        //hide Day weather forecast
        viewCtrl.removeClassActive(DOMStrings.daysNav);

        //hide weather info
        viewCtrl.removeClassActive(DOMStrings.curWeatherWrap);

        //show search bar
        viewCtrl.addClassActive(DOMStrings.curWeatherSearchWrap);
    }

   

    // Updates the text UI elements for current weather
    var updateCurWeatherUI = function(temp, desc){
        const units = modelCtrl.getSettings().units;
        viewCtrl.displayTemp(temp, units);
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

        // Reset the weather days arr to an empty arr
        modelCtrl.resetWeatherDays();
        
        // reset the current day highlighted in the days nav to the first nav
        viewCtrl.resetDaysNavActive();

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
        //console.log(weatherDays);
        weatherDays.forEach(function(el, i){
            if(el.day === currentDay){
                icon = getWeatherAttr( modelCtrl.getWeather().weather[0].id, 'icon' );
                //console.log(icon);
            } else {
                icon = el.getMostFrequentWeather()[0];
            }
            //console.log(`icon: ${icon}`);
            //console.log(`day: ${i}`);
            viewCtrl.updateNavDays(i, el, icon);
        });

    }

    var getCity = function(){
        let input = document.querySelector('.current-weather__input'); //select the city search input
        let autocomplete = new google.maps.places.Autocomplete(input); //add new Autocomplete object and ssign to search input
        autocomplete.addListener('place_changed', cityAutocomplete); // add event listener for when city is selected

        function cityAutocomplete(){
            let place = autocomplete.getPlace(); //Get the place object

            if(place.address_components){
                viewCtrl.hideError();

                let city, lon, lat;
                city = place.address_components[0].long_name;
                lon = place.geometry.location.lng();
                lat = place.geometry.location.lat();
                id = place.id;

                let newCity = modelCtrl.addCity(id, city, lon, lat); // Create new city obj and assign id(google place id), city(short name), lon and lat
                
                modelCtrl.setCurrentCity(id); //set current city to 'current'

                viewCtrl.showSearch($(this)); // Show the search submit button
            } else {
                let showError = viewCtrl.displayError('city');
                showError();
            }
        }
    }

    // var onSearchType = function(){
    //     viewCtrl.showSearch($(this)); // Show the search submit button on keyup if there is text in the search input
    // }

    var addCitiesToMenu = function(){
        
        let cities = modelCtrl.getAllCities(); // get all cities

        viewCtrl.addCitiesToMenu(cities); // add all the cities to the menu UI
  
    }

    var menuCityLoadWeather = function(){
        let id, cities;
        //Get the id from the clicked item
        id = viewCtrl.getCityId($(this));

        // Update the current city in cities arr
        modelCtrl.setCurrentCity(id); //set current city to 'current'

        // load the new weather
        ctrlAddCityWeather();
    }

    var ctrlAddCityWeather = function(){
        viewCtrl.hideError();

        var city, name, lon, lat, input, keys, unit;

        input = viewCtrl.getInput();
        city = getObjInArr(modelCtrl.getAllCities(), 'isCurrent', true); // Get the city obj which has it's isCurrent status set to true
        name = city.name;
        lat = city.lat;
        lon = city.lon;

        keys = modelCtrl.getKeys();
        units = modelCtrl.getSettings().units;

        addCitiesToMenu();

        if( city ){

            $.get( `http://api.openweathermap.org/data/2.5/weather?lat=${ lat }&lon=${ lon }&units=${units}&APPID=${ keys.openWeather }`, function( data ) {
                
                modelCtrl.setWeather(data);
                
                let timestamp, currentTimeStamp, temp, sunrise, sunset, desc, weatherID, weatherIcon;
                
                temp = data.main.temp;
                desc = data.weather[0].description;

                viewCtrl.displayCity(name);
                updateCurWeatherUI(temp, desc);
                viewCtrl.hideShowCurWeather();

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

                    $.get( `http://api.openweathermap.org/data/2.5/forecast?lat=${ lat }&lon=${ lon }&units=${units}&APPID=${ keys.openWeather }`, function( data ) {
                   
                        updateDaysNav(data, localTime.weekdayShort, timeZone);
                        viewCtrl.showDaysNav();

                        updateWeatherImage(weatherIcon, isNight);

                        let weatherDays = modelCtrl.getWeatherDays();
        
                    }).fail( viewCtrl.displayError() );
    
                }).fail( viewCtrl.displayError() );

            }).fail( viewCtrl.displayError() );
        }
    };

    var onGetWeather = function(){
        ctrlAddCityWeather();
    }

    var weatherDayClick = function(){
        let dayID, weather, icon, desc, temp, isNight;
        dayID = viewCtrl.addActiveClassToDaysNavDay($(this));

        if(dayID === 0){ // if current day get weather data from current weather
            weather = modelCtrl.getWeather();
            icon = getWeatherAttr( weather.weather[0].id, 'icon' );
            temp = weather.main.temp;
            isNight = weather.isNight;
            desc = weather.weather[0].description;

        } else { // get weather from forecast
            weather = modelCtrl.getWeatherDays()[dayID];
            icon = weather.getMostFrequentWeather()[0];
            temp = weather.getMaxTemp();
            isNight = false;
            desc = weather.getMostFrequentWeather()[1];

        }
        updateCurWeatherUI(temp, desc);
        updateWeatherImage(icon, isNight);
    };


    // var plotMinMaxTemp = function(data){

    //     var stats = ['temp', 'pressure', 'humidity'];
            

    //     // set the dimensions and margins of the graph
    //     var margin = {top: 20, right: 20, bottom: 30, left: 50},
    //     width = 375 - margin.left - margin.right,
    //     height = 150 - margin.top - margin.bottom;

    //     // set the ranges
    //     var x = d3.scaleTime().range([0, width]);
    //     var y = d3.scaleLinear().range([height, 0]);

    //     // define the line
    //     var statline = d3.line()
    //     .curve(d3.curveCardinal)
    //     .x(function(d) { return x(d.date); })
    //     .y(function(d) { return y(d.stat); });

    //     // define the area
    //     var area = d3.area()
    //     .curve(d3.curveCardinal)
    //     .x( function(d){ return x(d.date) } )
    //     .y1( function(d){ return y(d.stat) } )
    //     .y0(height);
 

    //     function draw(data, stat) {
    //         //console.log(data);
        
  
    //         // format the data
    //         data.forEach(function(d, i) {
    //             d.date = d.dt * 1000;
    //             d.stat = d.main[stat];
    //         });

    //         // append the svg obgect to the .weather-forecast__charts element
    //         // appends a 'group' element to 'svg'
    //         // moves the 'group' element to the top left margin
    //         var svg = d3.select(".weather-forecast__charts").append("svg")
    //         .attr("width", width + margin.left + margin.right)
    //         .attr("height", height + margin.top + margin.bottom)
    //         .append("g")
    //         .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    //         // Scale the range of the data
    //         x.domain(d3.extent(data, function(d) { return d.date; }));
    //         y.domain([d3.min(data, function(d) { return Math.min(d.stat) - (Math.min(d.stat) * .05) }), d3.max(data, function(d) { return Math.max(d.stat) + (Math.max(d.stat) * .05) })]);

    //         var xAxis = d3.axisBottom(x).ticks(5).tickFormat(d3.timeFormat("%a"));
    //         var yAxis = d3.axisLeft(y).ticks(5);

    //         // Add the valueline path.
    //         svg.append("path")
    //         .data([data])
    //         .attr("class", "line " + stat)
    //         .attr("d", statline);

    //         // append the area
    //         svg.append("path")
    //         .data([data])
    //         .attr("class", "area " + stat)
    //         .attr("d", area);
    
    //         // Add the X Axis
    //         svg.append("g")
    //         .attr("transform", "translate(0," + height + ")")
    //         .call(xAxis);

    //         // Add the Y Axis
    //         svg.append("g")
    //         .call(yAxis);
    //     }

    //     stats.forEach(el => draw(data, el));

    // };



    var setupEventListeners = function(){
        $( DOMStrings.curWeatherBtn ).on( 'click', onGetWeather ); // Add event listener for the city search submit button
        //$(window).scroll( viewCtrl.setWindowScrollAnimation ); // Add listener to animate background on scroll
        $(DOMStrings.daysNavDay).on('click', weatherDayClick);

        clearInput(DOMStrings.curWeatherInput); // Add event listener for to clear the search input on focus
        //showSearch(); //Add event listener to show the search submit button

        //$(DOMStrings.curWeatherInput).on('keyup', onSearchType);
        getCity();

        $(DOMStrings.mainMenuBtn).on('click', animateMainMenu);
        $(DOMStrings.mainMenuListItem).on('click', showSubMenu);
        $(DOMStrings.menuItemBack).on('click', hideSubMenu);
        $(DOMStrings.radioInput).on('change', onRadioChange);
        $(DOMStrings.addCityBtn).on('click', addNewCity);
        $(DOMStrings.menuCitiesList).on('click', DOMStrings.menuCitiesCity, menuCityLoadWeather);
    };

    

    return {
        init: function(){
            setupEventListeners();
            animatePlaceHolder();
            setSettingsUnitsUI();

        }
    }

})( weatherModelController, weatherViewController );