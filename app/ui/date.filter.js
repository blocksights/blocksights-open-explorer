(function () {
  'use strict';

  angular.module('app.ui').filter('dateFilter', ['appConfig', '$filter', dateFilter]);

  function dateFilter(appConfig, $filter) {

    return (input) => {
      // New date is needed because some time come in format "date, time"
      // and angularjs filter work not correctly because of ","
      return $filter('date')(new Date(input), appConfig.dateFormat);
    }
  }
})();