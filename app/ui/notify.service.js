/**
 * @typedef {Object} NotifyConfig
 * @property {string} [key] - The key of a notification.
 * If the property `allowMultiple: false` is false then only one notification with same key can be visible
 * @property {boolean} [allowMultiple] - Shows only one notification with the same key at the same time (helps to prevent spam of the same notification calls)
 * @property {string}   [title] - The title of a notification
 * @property {string}   [message] - The message of a notification
 * @property {number}   [delay] - The time in ms the notification is showing before start fading out
 * @property {number}   [startTop]    - Vertical padding between notifications and vertical border of the browser
 * @property {number}   [startRight]  - Horizontal padding between notifications and horizontal border of the browser
 * @property {number}   [verticalSpacing]   - Vertical spacing between notifications
 * @property {number}   [horizontalSpacing] - Horizontal spacing between notifications
 * @property {'right' | 'left' | 'center' } [positionX] - Horizontal position of the notification
 * @property {'top' | 'bottom' }            [positionY] - Vertical position of the notification
 * @property {boolean}  [replaceMessage] - If true every next appearing notification replace old notifications
 * @property {string}   [templateUrl]    - Custom template filename (URL)
 * @property {function} [onClose]        - Callback to execute when a notification element is closed. Callback receives the element as its argument.
 * @property {boolean}  [closeOnClick]   - If true, notifications are closed on click
 * @property {number}   [maxCount]       - Show only [maxCount] last notifications. Old notifications will be killed. 0 - do not kill
 * @property {number}   [priority]       - The highier the priority is, the higher the notification will be
 * */

(function () {
    'use strict';
    
    angular.module('app.ui')
           .config(['NotificationProvider', NotificationConfig])
    .factory('Notify', ['Notification', NotifyService]);
    
    function NotifyService(Notification) {
    
        let activeNotifications = [];
        
        /**
         * @param {function} notificationFn
         * @param {NotifyConfig} params*/
        
        function notify(notificationFn, params) {
    
            console.debug('debug : activeNotifications : notify call', 'allowMultiple: '+params.allowMultiple, params.key);
            
            if(params.allowMultiple === false && params.key !== undefined) {
                const sameNotifications = activeNotifications.filter((item) => {
                   return (item.key === params.key);
                });
                
                if(sameNotifications.length)
                    return false;
            }
            
            const notificationId = (new Date()).toString() + (Math.random()).toString();
            
            const notification = {
                key: params.key,
                id: notificationId
            };
            
            activeNotifications.push(notification);
    
            return notificationFn.call(Notification, {
                ...params,
                onClose: () => {
                    // call the original callback first
                    if(params.onClose)
                        params.onClose();

                    // remove a notification from active
                    activeNotifications = activeNotifications.filter((notification) => {
                       return notification.id !== notificationId;
                    });

                    console.debug('debug : activeNotifications : remove old one', notificationId, notification, activeNotifications)
                }
            });
            
        }
        
        function ClearAll(notificationFn) {
            notificationFn();
        }
        
        return {
            /** @param {NotifyConfig} params */
            primary: function (params) {
                return notify(Notification.primary, params)
            },
            
            /** @param {NotifyConfig} params */
            info: function (params) {
                return notify(Notification.info, params)
            },
            
            /** @param {NotifyConfig} params */
            success: function (params) {
                return notify(Notification.success, params)
            },
            
            /** @param {NotifyConfig} params */
            warning: function (params) {
                return notify(Notification.warning, params)
            },
            
            /** @param {NotifyConfig} params */
            error: function (params) {
                return notify(Notification.error, params)
            },
            
            /** @param {NotifyConfig} params */
            clearAll: () => ClearAll(Notification.clearAll, params),
        };
    }
    
    function NotificationConfig(NotificationProvider) {
        
        /** @type {NotifyConfig} */
        const config = {
            delay: 10000,
            startTop: 20,
            startRight: 10,
            verticalSpacing: 20,
            horizontalSpacing: 20,
            positionX: 'right',
            positionY: 'top',
        };
        
        NotificationProvider.setOptions(config);
    }
    
    
})();
