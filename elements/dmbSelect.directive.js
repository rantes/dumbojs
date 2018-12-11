(function() {
    'use strict';

    dumbo.directive('dmbSelect', ['dmbEvents'], Directive);

    function Directive(dmbEvents) {
        var _errorInputClass = '_error',
            validations = {
            /**
             * Checks every required field, adds an error class and retun true or false.
             * @param  {jQuery DOM} form The form to check required fields
             * @return {boolean} true if there is no any error
             */
            _required: function (value) {
                var response = {
                        valid: true,
                        error: null
                    };

                    if (typeof value === 'undefined' || value === null || value === '') {
                        response.valid = false;
                        response.error = 'Este campo es obligatorio';
                    }

                    return response;
            }
        },
        template = '<div class="dmb-select">' +
                        '<label>{{label}}</label>' +
                        '<select name="{{name}}" class="{{dmbClass}}" id="{{id}}" validate="{{validate}}">' +
                            '<transclude></transclude>' +
                        '</select>' +
                        '<span class="error-container"></span>' +
                    '</div>';

        function _runValidators(element, validators) {
            var unknownValidator = function() {
                    return {valid: false, error: 'Unknown validator type: "' + (validator || {}).key + '"'};
                },
                content = (element.value || '').trim(),
                valid = true,
                validator= null,
                func = null,
                result = null,
                message = null;

            element.value = content;
            for (var i = 0, len = validators.length; i < len; i++) {
                validator = validators[i];
                func = validations['_' + validator.key] || unknownValidator;

                result = func(content, validator.param);
                if (result.valid !== true) {
                    valid = false;
                    message = result.error;
                    break;
                }
            }

            if (valid === true) {
                element.parentNode.classList.remove(_errorInputClass);
                element.parentNode.querySelectorAll('.error-container').item(0).innerHTML = '';
            } else {
                element.parentNode.classList.add(_errorInputClass);
                element.parentNode.querySelectorAll('.error-container').item(0).innerHTML = message;
            }
            element.dataset.valid = valid;
        }

        function buildValidators(element, scope) {
            var validators = [],
                validatorList = (scope.validate || '').split(',');

            for (var i = 0, len = validatorList.length; i < len; i++) {
                var keyParam = validatorList[i].split(':');

                if (keyParam[0]) {
                    validators.push({
                        key: keyParam[0],
                        param: keyParam.length === 2 ? keyParam[1] : null
                    });

                    if (keyParam[0] === 'required') {
                        element.parentNode.classList.add('required');
                        element.setAttribute('required',true);
                    }
                }
            }

            return validators;
        }

        return {
            scope: {
                id: '@',
                label: '@',
                dmbSelected: '@',
                dmbClass: '@',
                name: '@',
                validate: '@',
                values: '=',
            },
            build: function(dom, scope) {
                var select = dom.querySelector('select'),
                    validators = [],
                    option = null;

                if (!scope.id) {
                    scope.id = Math.random().toString(36).replace(/[^a-z]+/g, '').substr(0, 5);
                    select.id = scope.id;
                }
                if (scope.validate) {
                    validators = buildValidators(select, scope);

                    select.addEventListener('blur', (e) => {
                        _runValidators(e.target, validators);
                    }, true);

                    document.addEventListener(dmbEvents.validate.listener, () => {
                        _runValidators(select, validators);
                    }, true);

                    document.addEventListener(dmbEvents.resetValidation.listener, () => {
                        let elements = dom.getElementsByClassName(_errorInputClass);

                        for (let i = 0; elements.length; i++) {
                            elements.item(0).classList.remove(_errorInputClass);
                        }
                    }, true);
                }

                if (typeof scope.dmbSelected !== 'undefined') {
                    scope.dmbSelected = scope.dmbSelected.trim();
                } else {
                    scope.dmbSelected = '';
                }

                if (scope.values) {
                    select.innerHTML = '';
                    option = document.createElement('option');
                    option.innerHTML = 'Seleccione...';
                    option.value = '';
                    select.append(option);

                    for (let i in scope.values) {
                        option = document.createElement('option');
                        option.innerHTML = scope.values[i].label;
                        option.value = scope.values[i].value;

                        if (scope.dmbSelected.length && scope.values[i].value == scope.dmbSelected) {
                            option.selected = 'selected';
                        }

                        select.append(option);
                    }
                }

                if (scope.dmbSelected.length) {
                    select.dispatchEvent(new Event('change'));
                }
            },
            template: template
        };
    }
})();
