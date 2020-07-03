/** Responsive Table directive
 * =======================
 * ========= API =========
 * =======================
 *
 * <responsive-table columns={columns[]} data={data[]} loading={boolean} loading-error={boolean} loading-error-message={string} no-data-text={string}></responsive-table>
 *
 * columns               {array}   (required) - see the Columns API
 * data                  {array}   (required) - see the Data API
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
                'columns': '=',
                'data': '=',
            },
            templateUrl: `html/responsive-table.html`,
            controller: ['$scope', ($scope) => {
                
                // prefixes for bootstrap's breakpoints
                const VISIBLE_BOOTSTRAP_CLASSNAME_PREFIX = 'visible-';
                const HIDDEN_BOOTSTRAP_CLASSNAME_PREFIX = 'hidden-';
                
                $scope.rowsState = {};
                
                $scope.$watch('columns', () => {
                    // if columns updated during the runtime we should update classes
                   updateClasses();
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
                
                function updateClasses() {
                    // this function specifies the bootstrap classes for table columns, table collapse etc.
                    $scope.columnClass = {};
                    $scope.mobileColumnClass = {};
                    $scope.mobileSectionClass = {};
                    
                    $scope.columns.forEach((column) => {
                        $scope.columnClass[column.title] = getClass(column);
                        
                        $scope.mobileColumnClass[column.title] = getClassForMobile(column);
                        
                    });
                    
                    $scope.mobileSectionClass = getMobileRowClass($scope.columns);
                }
                
                function getClass(column) {
                    // returns the classes for table desktop columns
                    const classNames = [];
                    
                    classNames.push(generateClasses(column.hidden, HIDDEN_BOOTSTRAP_CLASSNAME_PREFIX));
                    
                    return classNames.join(' ');
                }
                
                function getClassForMobile(column, hiddenByDefault = true) {
                    // returns the classes for mobile table columns which are hidden for desktop
                    const classNames = [];
                    
                    if(hiddenByDefault && !column.hidden) {
                        return 'hidden-lg hidden-md hidden-sm hidden-xs'
                    }
                    
                    classNames.push(generateClasses(column.hidden, VISIBLE_BOOTSTRAP_CLASSNAME_PREFIX));
                    
                    return classNames.join(' ');
                }
                
                function getMobileRowClass(columns) {
                    // returns the classes for mobile table block
                    const classes1 = columns.map((item) => getClassForMobile(item, false)).join(' ').split(' ');
                    
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
