(function () {
    'use strict';
    
    angular.module('app.ui')
    .service('OperationsService', ['utilities', 'appConfig', '$filter', '$http', OperationsService]);
    
    function OperationsService(utilities, appConfig, $filter, $http) {
        
        function getOperationsHistory({ poolId = undefined, creditOfferId = undefined, limit = 20, offset = 0, date_from = undefined, date_to = undefined, assetId = undefined, operationType = undefined, accountId = undefined }) {
            
            function filterOperationDuplicates(v, i, a) {
                return a.findIndex(t=>(t.operation_id_num === v.operation_id_num))===i
            }
            
            function operationMapperToAppFormat(op) {
                let operation = {};
                
                operation.block_num = op.block_data.block_num;
                operation.operation_id = op.account_history.operation_id;
                operation.operation_id_num = op.operation_id_num;
                operation.time = op.block_data.block_time;
                operation.witness = op.witness;
                operation.sequence = op.account_history.sequence;

                let parsed_op = op.operation_history.op_object;
                
                if (parsed_op === undefined) {
                    parsed_op = JSON.parse(op.operation_history.op)[1];
                }
                
                if (parsed_op.amount) {
                    parsed_op.amount_ = parsed_op.amount;
                }
                
                const _with_result = {...parsed_op, result: op.operation_history.operation_result};
                
                if (typeof _with_result.result === "string") {
                    _with_result.result = JSON.parse(op.operation_history.operation_result);
                }
                
                utilities.opText(appConfig, $http, op.operation_type, _with_result, function(returnData) {
                    operation.operation_text = returnData;
                });

                const type_res =  utilities.operationType(op.operation_type);
                operation.type = type_res[0];
                operation.color = type_res[1];
                
                return operation;
            }
            
            const MAGIC_NUMBER = 1000000;
            
            return $http.get(appConfig.urls.elasticsearch_wrapper() + "/history", {
                    params: {
                        "limit": limit + 1, // fetch a one more item to define is there a next page
                        "offset": offset,
                        "from_date": date_from ? date_from : (offset < MAGIC_NUMBER ? "now-1M" : "2015-10-10"),
                        "to_date": date_to,
                        "asset_id": assetId ? assetId : undefined,
                        "operation_type": Number(operationType) === -1 ? undefined : operationType,
                        "account_id": accountId ? accountId : undefined,
                        "creditoffer_id": creditOfferId ? creditOfferId : undefined,
                        "pool_id": poolId ? poolId : undefined
                    }
                }).then(response => {
                    if(response && response.data && (response.data.asset_not_found || response.data.account_not_found)) {
                        return response.data
                    }

                    const operations = response.data.filter(filterOperationDuplicates).map(operationMapperToAppFormat);
                    
                    return operations;
                });
        }
        
        const COLUMNS = {
            OPERATION_TEXT: {
                title: $filter('translate')('Operation'),
                index: 'operation_text',
            },
            OPERATION_ID: {
                title: $filter('translate')('ID'),
                index: 'operation_id',
            },
            DATETIME: {
                title: $filter('translate')('Date and time'),
                index: 'time',
                hidden: ['xs']
            },
            BLOCK: {
                title: $filter('translate')('Block'),
                index: 'block_num',
                hidden: ['xs', 'sm']
            },
            TYPE: {
                title: $filter('translate')('Type'),
                index: 'type',
                hidden: ['xs', 'sm', 'md']
            }
        }
        
        return {
            columns: COLUMNS,
            getOperationsHistory
        }
    }
    
    
})();
