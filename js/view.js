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
        ErrorMessage: '.current-weather__error-message',

        curWeatherBackground: '.animation__background',
        curWeatherDet: '.weather-forecast',

        daysNav: '.day-navigation',
        daysNavDay: '.day-navigation__day',
        daysNavDayText: '.day-navigation__text',
        daysNavDayIcon: '.day-navigation__icon',

        mainMenu: '.main-menu',
        mainMenuList: '.main-menu__list',
        mainMenuItem: '.main-menu__item',
        mainMenuBtn: '.top-nav__menu-button',
        mainMenuListItem: '.main-menu__main-list >.main-menu__item',
        menuItemBack: '.main-menu__item-back',
        menuCitiesList: '.main-menu__city-list',
        menuCitiesListItem: '.main-menu__city-list .main-menu__item',
        menuCitiesCity: '.main-menu__item-city',
        menuNoCitiesItem: '.main-menu__item-no-cities',

        addCityBtn: '.top-nav__add-button',
        topNavBtns: '.top-nav__button',
 
        radioBox: '.radio__box',
        radioLabel: '.radio__label',
        radioInput: '.radio__input',

        unitsInput: 'input[name=units]',

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

    var removeFirstChar = function(string){
        return string.slice(1, string.length);
    }

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

        displayTemp: function(temp, units){
            let symbol = 'c';
            if(units === 'imperial'){
                symbol = 'f';
            }
            $(DOMStrings.curTempText).html( Math.round(temp) + '&deg;' + symbol );
        },

        displayDesc: function(desc){
            $(DOMStrings.curTimeText).text( desc );
        },

        displayError: function(type = 'general'){
            return function(){
                // Hide input
                $(DOMStrings.curWeatherSearchWrap).addClass('active');

                // Display content below
                $(DOMStrings.curWeatherWrap).removeClass('active');
                $(DOMStrings.curWeatherDet).hide();

                $(DOMStrings.ErrorBlock).addClass(removeFirstChar(`${DOMStrings.ErrorBlock}--active`));
                
                $(DOMStrings.ErrorMessage).removeClass(removeFirstChar(`${DOMStrings.ErrorMessage}--active`));
                $(`${DOMStrings.ErrorMessage}--${type}`).addClass(removeFirstChar(`${DOMStrings.ErrorMessage}--active`));
            }    
        },

        hideError: function(){
            $(DOMStrings.ErrorBlock).removeClass(removeFirstChar(`${DOMStrings.ErrorBlock}--active`));         
            $(DOMStrings.ErrorMessage).removeClass(removeFirstChar(`${DOMStrings.ErrorMessage}--active`));
        },

        setWindowScrollAnimation: function(){

            var scrollVal, screenHeight;
        
            scrollVal = $(window).scrollTop();
            screenHeight = $(window).innerHeight();
            scrollPercent = Math.round((scrollVal / screenHeight) * 20); // Get the percentage of the viewport height scrolled

            $(DOMStrings.curWeatherWrap).css('filter', 'blur(' + scrollPercent + 'px)'); // Increase or decrease blur
        
        },
        
        placeholderAnimate: function (input, text){
            var currCnt, currString;
        
            currCnt = 0;
            currString = '';
        
            addNextLetter(text, currString, currCnt, input);
        
        },

        showSearch: function(){
            $(DOMStrings.curWeatherBtn).addClass('active');
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
            $(DOMStrings.curWeatherBackground).addClass( removeFirstChar(DOMStrings.curWeatherBackground) + '--night');
            $(DOMStrings.topNavBtns).addClass( removeFirstChar(DOMStrings.topNavBtns) + '--night' );
        },

        removeNightClass: function(){
            $(DOMStrings.curWeather).removeClass('night');
            $(DOMStrings.curWeatherBackground).removeClass( removeFirstChar(DOMStrings.curWeatherBackground) + '--night');
            $(DOMStrings.topNavBtns).removeClass( removeFirstChar(DOMStrings.topNavBtns) + '--night' );
        },

        addWeatherUI: function(data){
            $(DOMStrings.curWeatherAnimation).html(data);
        },

        addWeatherClass: function(weatherIcon){
            $(DOMStrings.curWeatherAnimation).alterClass( removeFirstChar(DOMStrings.curWeatherAnimation)  + '--animate-*', removeFirstChar(DOMStrings.curWeatherAnimation) + '--animate-' + weatherIcon );
            //$(DOMStrings.curWeatherAnimation).addClass( 'animation__weather--animate-' + weatherIcon );
        },

        resetDaysNavActive: function(){
            $(DOMStrings.daysNavDay).removeClass(removeFirstChar(DOMStrings.daysNavDay) + '--current');
            $(DOMStrings.daysNavDay + ':first-child').addClass(removeFirstChar(DOMStrings.daysNavDay) + '--current');
        },

        updateNavDays: function(i, el, icon){
            let $curDayUI = $(DOMStrings.daysNavDay + ':nth-child('+ (i + 1) +')');
            $curDayUI.children(DOMStrings.daysNavDayText).text(el.day);
            $curDayUI.children(DOMStrings.daysNavDayIcon).alterClass( removeFirstChar(DOMStrings.daysNavDayIcon) + '--*', removeFirstChar(DOMStrings.daysNavDayIcon) + '--' + icon );
            $curDayUI.data('id', i);
        },

        showDaysNav: function(){
            $(DOMStrings.daysNav).addClass('active');
        },

        addActiveClassToDaysNavDay: function(el){
            $(DOMStrings.daysNavDay).removeClass( removeFirstChar(DOMStrings.daysNavDay) + '--current' );
            $(el).addClass( removeFirstChar(DOMStrings.daysNavDay) + '--current' );
            return el.data('id');
        },

        toggleMenu: function(el){
            $(DOMStrings.mainMenu).toggleClass( removeFirstChar(DOMStrings.mainMenu) + '--active' );
            el.toggleClass( removeFirstChar(DOMStrings.mainMenuBtn) + '--active' );
            $(DOMStrings.curWeather).toggleClass( removeFirstChar(DOMStrings.curWeather) + '--active' )
        },

        showSubMenu: function(el){
            var list = el.data("list");

            $(DOMStrings.mainMenu + '__main-list').addClass( removeFirstChar(DOMStrings.mainMenuList) + '--left' );
            $(DOMStrings.mainMenu + '__' + list + '-list').removeClass( removeFirstChar(DOMStrings.mainMenuList) + '--right' );
        },

        hideSubMenu: function(el){
            var list = el.parent().data("list");
           
            $(DOMStrings.mainMenu + '__main-list').removeClass( removeFirstChar(DOMStrings.mainMenuList) + '--left' );
            $(DOMStrings.mainMenu + '__' + list + '-list').addClass( removeFirstChar(DOMStrings.mainMenuList) + '--right' );
        },

        addClassActive: function(el){
            $(el).addClass('active');
        },

        removeClassActive: function(el){
            $(el).removeClass('active');
        },

        clearInputVal: function(input){
            $(input).val('');
        },

        addCitiesToMenu: function(cities){
            let html = '';

            $(`${DOMStrings.menuCitiesListItem}:not(:first-child)`).remove();
    
            cities.forEach(function(city){
                html += `<li class="${removeFirstChar(DOMStrings.mainMenuItem)} ${removeFirstChar(DOMStrings.menuCitiesCity)}" data-id="${city.id}">${city.name}</li>`;
            });
    
            $(DOMStrings.menuCitiesList).append(html);
        },

        getCityId: function(el){
            return el.data('id');
        },

        setTheme: function(theme){
            $(DOMStrings.curWeatherBackground).alterClass(removeFirstChar(`${DOMStrings.curWeatherBackground}--bg-*`), removeFirstChar(`${DOMStrings.curWeatherBackground}--bg-${theme}`));
        }

        

    }

})();