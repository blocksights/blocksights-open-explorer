/** Responsive Table directive
 * =======================
 * ========= API =========
 * =======================
 *
 * <responsive-table columns={columns[]} data={data[]} loading={boolean} loading-error={boolean} loading-error-message={string} no-data-text={string}></responsive-table>
 *
 * columns               {array}   (required)       - see the Columns API
 * data                  {array}   (required)       - see the Data API
 * filter                {string|object|function}   - this value applies as expression for angular default filter - https://docs.angularjs.org/api/ng/filter/filter
 *
 * loading               {boolean} (optional) - if true the responsive-table will show loading indicator
 * loading-error         {boolean} (optional) - if true the responsive-table will show loading error message
 * loading-error-message {string}  (optional) - the message that will be shown in case of loading-error=true
 * no-data-text          {string}  (optional) - the message that will be shown in case of data.length = 0
 *
 * =======================
 * ===== Columns API =====
 * =======================
 *
 * columns[].title  {string} - the title of column
 *
 * columns[].index  {string} - the key of value in DataSet for this column `data[].[index]`. By default column will
 *                            render the field with corresponding "index" in DataSet.
 *                            For e.g.: columns[].index = "name" and data[].name = "Steve" will render the "Steve" in a
 *                            cell because its index is a "name" and the value of "data[].name" is Steve.
 *
 *                            Pay attention that index DOES NOT SUPPORT nesting levels. It is impossible to do the following:
 *                            columns[].index = "asset.symbol"
 *
 * columns[].html   {function} (optional) - this is a custom render function. You can change render of a cell up to you.
 *
 * columns[].hidden {Array} (xs|sm|md|lg) - specify the breakpoints to hide the column in collapsible (breakpoints value defined by bootstrap.
 *                                          This directive doesn't track the screen size. It uses bootstrap's css classes like - "hidden-lg", "visible-xs" etc.
 *
 * columns[].sort {function | boolean}   - if you want for a specific column to be sortable you can set the boolean = true or put the custom compare function
 *
 * columns[].sortReverse {boolean}       - Reverse the sorting when user sort the column
 * columns[].sortByDefault {boolean}     - Turns on the sorting for the column when page loads
 * ===================
 * ===== Data API ====
 * ===================
 *
 * data[].[fieldName] {any} - data is an array of values for table. By default, the cell will render the data by specific "index".
 *
 * ==================
 * ==== Examples ====
 * ==================
 * $scope.columns = [{
 *     title: 'Name',
 *     index: 'name',
 * }, {
 *     title: 'Income in EUR',
 *     index: 'incomeUSD',
 *     html: (value) => $filter('number')(value * 0.89) + ' EUR'
 * }, {
 *     title: 'Phone',
 *     index: 'phone',
 *     hidden: ['xs', 'sm']
 * }]
 *
 * $scope.data = [{
 *     name: 'Steve',
 *     incomeUSD: 1000,
 *     phone: '+1 123 123 123'
 * }, {
 *     name: 'Bob',
 *     incomeUSD: 500,
 *     phone: '+2 234 234 234'
 * }]
 *
 * This will render the following table:
 * -----------------------------------------
 * | Name  | Income in EUR | Phone          |
 * -----------------------------------------
 * | Steve | 890 EUR       | +1 123 123 123 |
 * | Bob   | 445 EUR       | +2 234 234 234 |
 * ------------------------------------------
 * P.S. the "Phone" will be hidden at "xs" and "sm" breakpoints. To see breakpoints size please take a look
 * bootstrap website - https://getbootstrap.com/docs/3.4/css/#responsive-utilities-classes
 * (At the moment of writing this doc we use bootstrap 3.4.1)
 * */

(function (){

    angular.module('app.ui')
        .directive('responsiveTable', responsiveTable);

    function responsiveTable() {
        return {
            restrict: 'E',
            scope: {
                'loading': '=',
                'loadingError': '=',
                'loadingErrorMessage': '=',
                'noDataText': '=',
                'template': '@',
                'columns': '=',
                'data': '=',
                'filter': '=',
                'class': '@'
            },
            templateUrl: `html/responsive-table.html`,
            controller: ['$scope', ($scope) => {

                // prefixes for bootstrap's breakpoints
                const VISIBLE_BOOTSTRAP_CLASSNAME_PREFIX = 'visible-';
                const HIDDEN_BOOTSTRAP_CLASSNAME_PREFIX = 'hidden-';

                $scope.rowsState = {};

                $scope.sortingParameter = false;
                $scope.sortingOrder = false;
                $scope.sortingCompareFunc = false;

                $scope.$watch('columns', () => {
                    // if columns updated during the runtime we should update classes
                   updateClasses();
                   updateSorting();
                });

                $scope.$watch('data', () => {
                    // when user selects the next page of a table - a new data comes.
                    // to display a new page correctly we should remove the states of previous page
                    $scope.rowsState = {};
                });

                $scope.toggleRow = (index) => {
                    // when user clicks on a [+] or [-] on specific row we should toggle the row state
                    $scope.rowsState[index] = !$scope.rowsState[index];
                };

                $scope.getRowToggleAllState = () => {
                    // find any opened row
                    let open = false;
                    angular.forEach($scope.rowsState, (value) => {
                        if(value) {
                            open = true;
                        }
                    });

                    return open;
                };

                $scope.toggleAllRows = () => {
                    // when user clicks on a [+] or [-] on table header we should hide/show all rows
                    // depending on row already opened or not
                    const isAnyRowOpen = $scope.getRowToggleAllState();
                    $scope.data.map((item, index) => {
                        if(isAnyRowOpen) {
                            $scope.rowsState[index] = false;
                        } else {
                            $scope.rowsState[index] = true;
                        }
                    });
                };

                $scope.sort = (column) => {

                    // if user click for this cell to sort for the first time
                    if (column.sort && $scope.sortingParameter !== column.index) {

                        $scope.sortingParameter = column.index;
                        $scope.sortingOrder = column.sortReverse === undefined ? false : !!column.sortReverse;

                        if (typeof column.sort === 'function') {
                            $scope.sortingCompareFunc = column.sort;
                        }

                    // if user already clicked on this cell to sort and it doesn't have a default sorting order - we should reverse the sorting
                    } else if (column.sort && $scope.sortingParameter === column.index && (column.sortReverse === undefined && !$scope.sortingOrder)) {
                        $scope.sortingOrder = true;
                    // if user already clicked on this cell to sort and it has the default sorting order - we should reverse the sorting
                    } else if (column.sort && $scope.sortingParameter === column.index && (column.sortReverse !== undefined && $scope.sortingOrder === column.sortReverse)) {
                        $scope.sortingOrder = !column.sortReverse;
                    // if user already clicked on this cell for the third time we should disable sorting at all
                    } else if (column.sort) {
                        $scope.sortingParameter = false;
                        $scope.sortingOrder = false;
                        $scope.sortingCompareFunc = false;
                    }

                };

                function updateSorting()  {
                    $scope.sortingParameter = false;
                    $scope.sortingOrder = false;
                    $scope.sortingCompareFunc = false;

                    if(Array.isArray($scope.columns) && $scope.columns.length) {
                        $scope.columns.forEach((column) => {
                            if(column.sortByDefault) {
                                $scope.sort(column);
                            }
                        });
                    }
                }

                function updateClasses() {
                    // this function specifies the bootstrap classes for table columns, table collapse etc.
                    $scope.columnClass = {};
                    $scope.mobileColumnClass = {};
                    $scope.mobileSectionClass = {};

                    if(Array.isArray($scope.columns) && $scope.columns.length) {
                        $scope.columns.forEach((column) => {
                            $scope.columnClass[column.title] = getClass(column);

                            $scope.mobileColumnClass[column.title] = getClassForMobile(column);

                        });
                        $scope.mobileSectionClass = getMobileRowClass($scope.columns);
                    }
                }

                function getClass(column) {
                    // returns the classes for table desktop columns
                    const classNames = [];

                    classNames.push(generateClasses(column.hidden, HIDDEN_BOOTSTRAP_CLASSNAME_PREFIX));

                    return classNames.join(' ');
                }

                function getClassForMobile(column) {
                    // returns the classes for mobile table columns which are hidden for desktop
                    const classNames = [];

                    if(!column.hidden) {
                        return 'hidden-lg hidden-md hidden-sm hidden-xs'
                    }

                    classNames.push(generateClasses(column.hidden, VISIBLE_BOOTSTRAP_CLASSNAME_PREFIX));

                    return classNames.join(' ');
                }

                function getMobileRowClass(columns) {
                    // returns the classes for mobile table block
                    const classes1 = columns.map((item) => getClassForMobile(item)).join(' ').split(' ');

                    const classes2  = classes1.filter((value, index, self) => self.indexOf(value) === index).join(' ');

                    return classes2;
                }

                function generateClasses(list, prefix) {
                    // generates classes based on list of breakpoints and prefix.
                    const classNames = [];

                    if (Array.isArray(list)) {
                        classNames.push(
                            list.map((item) => prefix + item).join(' ')
                        )
                    } else if(list !== undefined) {
                        classNames.push(prefix + list);
                    }

                    return classNames.join(' ');
                }
            }]
        };
    }

})();
