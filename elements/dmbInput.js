/**
 * @name dmb-input
 */
(function() {
    'use strict';

    dumbo.directive('dmbInput', [
        'dmbEvents'
    ], Directive);

    function Directive(dmbEvents) {
        var _errorInputClass = '_error',
            validations = {
            /**
             * Checks every required field, adds an error class and retun true or false.
             * @param  {jQuery DOM} $form The form to check required fields
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
            },
            /**
             * Checks every email field, adds an error class and retun true or false.
             * @param  {jQuery DOM} $form The form to check email fields
             * @return {boolean} true if there is no any error
             */
            _email: function (value) {
                var response = {
                        valid: true,
                        error: null
                    };

                    var re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
                    if (value && !re.test(value)) {
                        response.valid = false;
                        response.error = 'No es una direcci&oacute;n de email v&aacute;lido';
                    }

                    return response;
            },
            /**
             * Checks every required field, adds an error class and retun true or false.
             * @param  {jQuery DOM} $form The form to check required fields
             * @return {boolean} true if there is no any error
             */
            _numeric: function (value) {
                var response = {
                        valid: true,
                        error: null
                    },
                    re = /^[0-9]\d*$/;

                if (value && !re.test(value)) {
                    response.valid = false;
                    response.error = 'Este campo debe ser solo num&eacute;rico';
                }

                return response;
            },
            _min: function(value, param) {
                var response = {
                        valid: true,
                        error: null
                    };

                if (value && value.length < param) {
                    response.valid = false;
                    response.error = 'Este campo debe ser de ' + param + ' caracteres m&iacute;nimo';
                }

                return response;
            },
            _max: function(value, param) {
                var response = {
                        valid: true,
                        error: null
                    };

                if (value && value.length > param) {
                    response.valid = false;
                    response.error = 'Este campo debe ser de ' + param + ' caracteres m&aacute;ximo';
                }

                return response;
            }
        },
        template = '<div class="dmb-input">' +
                        '<label>{{label}}</label>' +
                        '<input aria-label="{{label}}" masked="{{masked}}" autocomplete="{{autocomplete}}" type="{{type}}" class="{{dmbClass}}" name="{{name}}" validate="{{validate}}" id="{{id}}" value="{{value}}" placeholder="{{label}}" />' +
                        '<span class="error-container"></span>' +
                    '</div>';

        function maskInputUppercase(e) {
            var value = $(e.target).val();

            $(e.target).val(value.toUpperCase());
        }

        function maskInputAlpha(e) {
            var char = e.which || e.keyCode;

            if ((char < 65 || char > 90) && (char < 97 || char > 122)) {
                return false;
            }
        }

        function maskInputNumeric(e) {
            var char = e.which || e.keyCode;

            if (char < 48 || char > 57) {
                return false;
            }
        }

        function _runValidators(element, validators) {
            var unknownValidator = function() {
                    return {valid: false, error: 'Unknown validator type: "' + (validator || {}).key + '"'};
                },
                $element = $(element.target || element),
                content = $element.val().trim(),
                valid = true,
                validator= null,
                func = null,
                result = null,
                message = null;

            $element.val(content);
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
                $element.parent().removeClass(_errorInputClass);
                $element.parent().find('.error-container').html('');
            } else {
                $element.parent().addClass(_errorInputClass);
                $element.parent().find('.error-container').html(message);
            }
            $element.data('valid', valid);
        }

        function buildValidators(element) {
            var $this = $(element.target || element),
                validators = [],
                validatorList = ($this.attr('validate') || '').split(',');

            for (var i = 0, len = validatorList.length; i < len; i++) {
                var keyParam = validatorList[i].split(':');

                if (keyParam[0]) {
                    validators.push({
                        key: keyParam[0],
                        param: keyParam.length === 2 ? keyParam[1] : null
                    });

                    if (keyParam[0] === 'required') {
                        $this.parent().addClass('required');
                        $this.attr('required',true);
                    }
                }
            }

            return validators;
        }

        return {
            scope: {
                autocomplete: '@',
                id: '@',
                dmbClass: '@',
                label: '@',
                masked: '@',
                name: '@',
                placeholder: '@',
                type: '@',
                validate: '@',
                value: '@'
            },
            build: function(dom, scope) {
                var input = dom.getElementsByTagName('input'),
                    validators = [],
                    body = document.getElementsByTagName('body');

                if (scope.placeholder) {
                    input.prop('placeholder', scope.placeholder);
                }

                if (!scope.id) {
                    scope.id = Math.random().toString(36).replace(/[^a-z]+/g, '').substr(0, 5);
                    input.attr('id', scope.id);
                }

                if (scope.validate) {
                    validators = buildValidators(input);

                    input.on('blur', function(element) {
                        _runValidators(element, validators);
                    });

                    body.addEventListener(dmbEvents.validate, () => {
                        _runValidators(input, validators);
                    });

                    body.addEventListener(dmbEvents.resetValidation, () => {
                        let elements = dom.getElementsByClassName(_errorInputClass);

                        for (let i = 0; elements.length; i++) {
                            elements.item(0).classList.remove(_errorInputClass);
                        }
                    });
                }

                if (scope.masked) {
                    switch (scope.masked) {
                        case 'alpha':
                            $input.on('keypress', maskInputAlpha);
                        break;
                        case 'numeric':
                            $input.on('keypress', maskInputNumeric);
                        break;
                        case 'uppercase':
                            $input.on('input', maskInputUppercase);
                        break;
                    }
                }

            },
            template: template
        };
    }
})();
