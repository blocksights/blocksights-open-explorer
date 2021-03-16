(function () {
    'use strict';

    angular.module('app').filter('translateWithLinks', ['$filter', translateWithLinks]);

    function translateWithLinks($filter) {
        return function (translation, params = []) {
            const translationParameters = {};

            if (translation == "Asset Link" && typeof params === 'string') {
                params = {
                    assetLink: {
                        text: params,
                        href: `/#/assets/${params}`
                    }
                }
            }

            angular.forEach(params, (param, translationKey) => {
                if (typeof param === 'string') {
                    translationParameters[translationKey] = param;
                }

                if (!param.text && !param.translate) {
                    return false;
                }

                const linkAttributes = [];

                Object.keys(param).map((attributeName) => {
                    if(attributeName === 'translate' || attributeName === 'text')
                        return;

                    const attributeValue = param[attributeName];

                    linkAttributes.push(`${attributeName}="${attributeValue}"`)
                });

                const linkText = param.translate ? $filter('translate')(param.translate) : param.text;

                translationParameters[translationKey] = `<a ${linkAttributes.join(' ')}>${linkText}</a>`;
            });

            return $filter('translate')(translation, translationParameters);
        }
    }

})();
