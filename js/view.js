var weatherViewController = (function(){
    var DOMStrings = {

        curWeather: '.current-weather',
        curWeatherAnimation: '.animation__weather',

        curWeatherSearchWrap: '.current-weather__search',
        curWeatherBtn: '.current-weather__button',
        curWeatherInput: '.current-weather__input',

        curWeatherWrap: '.current-weather__text',
        curTempText: '.current-weather__text .heading-primary',
        curCityText: '.current-weather__text .heading-secondary',
        curTimeText: '.current-weather__text .heading-tertiary',

        ErrorBlock: '.current-weather__error',

        curWeatherBackground: '.animation__background',
        curWeatherDet: '.current-weather-details',

        daysNavDay: '.day-navigation__day',
        daysNavDayText: '.day-navigation__text',
        daysNavDayIcon: '.day-navigation__icon',



    }

    var generateRandomNumberInRange = function (min, max){
        return Math.floor( Math.random() * (max-min+1) + min );
    };
    
    var addNextLetter = function (string, currString, currCnt, input){
    
        // get current string and add the next letter in the full string;
        var nextLetter = string.charAt(currCnt);
        var newString = currString + nextLetter;
    
        currCnt ++;
    
        $(input).attr('placeholder', newString);
    
        setTimeout(function(){
    
            if( currCnt < string.length ){
    
                addNextLetter(string, newString, currCnt, input);
    
            }
    
        }, generateRandomNumberInRange(100, 200) );

    };

 

    return {

        getInput: function(){
            return {
                city: $(DOMStrings.curWeatherInput).val()  //Get the city value from the input
            }
        },

        getDOMStrings: function(){
            return DOMStrings;
        },

        displayCity: function(city){
            $(DOMStrings.curCityText).text(city);
        },

        displayTemp: function(temp){
            $(DOMStrings.curTempText).html( Math.round(temp) + '&deg;c' );
        },

        displayDesc: function(desc){
            $(DOMStrings.curTimeText).text( desc );
        },

        displayError: function(){
            // Hide input
            $(DOMStrings.curWeatherSearchWrap).addClass('active');

            // Display content below
            $(DOMStrings.curWeatherWrap).removeClass('active');
            $(DOMStrings.curWeatherDet).hide();

            $(DOMStrings.ErrorBlock).show();
        },

        setWindowScrollAnimation: function(){

            var scrollVal, screenHeight;
        
            scrollVal = $(window).scrollTop();
            screenHeight = $(window).innerHeight();
            scrollPercent = Math.round((scrollVal / screenHeight) * 20); // Get the percentage of the viewport height scrolled
        
            // console.log(scrollVal);
            // console.log(screenHeight);
            // console.log(scrollPercent);


            $(DOMStrings.curWeatherWrap).css('filter', 'blur(' + scrollPercent + 'px)'); // Increase or decrease blur
        
        },
        
        placeholderAnimate: function (input, text){
            var currCnt, currString;
        
            currCnt = 0;
            currString = '';
        
            addNextLetter(text, currString, currCnt, input);
        
        },

        showSearch: function(){
            if($(this).val() !== ''){
                $(DOMStrings.curWeatherBtn).addClass('active');
            } else {
                $(DOMStrings.curWeatherBtn).removeClass('active');
            }
        },

        clearInput: function(){
            $(this).attr('placeholder', '');
        },

        hideShowCurWeather: function(){
            // Hide input
            $(DOMStrings.curWeatherSearchWrap).removeClass('active');

            // Display content below
            $(DOMStrings.curWeatherWrap).addClass('active');
            $(DOMStrings.curWeatherDet).show();
        },

        addBackgroundUI: function(data){
            $(DOMStrings.curWeatherBackground).html(data);
        },

        addNightClass: function(){
            $(DOMStrings.curWeather).addClass('night');
        },

        addWeatherUI: function(data){
            $(DOMStrings.curWeatherAnimation).html(data);
        },

        addWeatherClass: function(weatherIcon){
            $(DOMStrings.curWeatherAnimation).addClass( 'animation__weather--' + weatherIcon );
        },

        updateNavDays: function(i, el, icon){
            $(DOMStrings.daysNavDay + ':nth-child('+ (i + 1) +') ' + DOMStrings.daysNavDayText).text(el.day);
            $(DOMStrings.daysNavDay + ':nth-child('+ (i + 1) +') ' + DOMStrings.daysNavDayIcon).addClass('day-navigation__icon--' + icon );
        }
        

    }

})();