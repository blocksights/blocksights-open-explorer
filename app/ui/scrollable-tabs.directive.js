(function () {
    'use strict';
    
    angular.module('app.ui').directive('scrollableTabs', ['$timeout', scrollableTabsDirective]);
    
    function scrollableTabsDirective($timeout) {
        return {
            restrict: 'AEC',
            link: (scope, element) => {
                
                let isLeftShadowVisible = false;
                let isRightShadowVisible = false;
                
                element.ready(() => {
                    // use timeout for android issue
                    $timeout(init);
                });
                
                function init() {
                    let elem;
                    
                    elem = element;
                    
                    if(!element.hasClass('nav-tabs')) {
                        elem = element.find('ul.nav-tabs');
                    }
                    
                    if(!elem.hasClass('scrollable-tabs')) {
                        elem.addClass('scrollable-tabs');
                    }
                    
                    const showLeftShadow = () => {
                        if(!isLeftShadowVisible) {
                            elem.addClass('scrollable-tabs-shadow-left');
                            isLeftShadowVisible = true;
                        }
                    };
                    
                    const showRightShadow = () => {
                        if(!isRightShadowVisible) {
                            elem.addClass('scrollable-tabs-shadow-right');
                            isRightShadowVisible = true;
                        }
                    };
                    
                    const hideLeftShadow = () => {
                        if(isLeftShadowVisible) {
                            elem.removeClass('scrollable-tabs-shadow-left');
                            isLeftShadowVisible = false;
                        }
                    };
                    
                    const hideRightShadow = () => {
                        if(isRightShadowVisible) {
                            elem.removeClass('scrollable-tabs-shadow-right');
                            isRightShadowVisible = false;
                        }
                    };
                    
                    const checkShadows = () => {
                        
                        const width = elem.width();
                        const scrollLeft = elem.scrollLeft();
                        const innerWidth = elem[0].scrollWidth;
                        
                        const hideOnMargin = 5; // 5 additional pixes to fix the issues
                        
                        if(scrollLeft > hideOnMargin) {
                            showLeftShadow();
                        } else {
                            hideLeftShadow();
                        }
                        
                        if((width + scrollLeft + hideOnMargin) > innerWidth) {
                            hideRightShadow();
                        } else {
                            showRightShadow();
                        }
                        
                    };
                    
                    checkShadows();
                    
                    elem[0].addEventListener('scroll', checkShadows, {passive: true});
                    
                    window.onresize = () => {
                        checkShadows();
                    };
                }
                
            }
        }
    }
    
})();
