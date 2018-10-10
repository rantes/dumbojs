(function() {
    'use strict';

    dumbo.directive('dmbInputTime', [
        'dmbEvents'
    ], Directive);

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
            },
            _time: function (value) {
                var response = {
                        valid: true,
                        error: null
                    },
                    re = /^(0?[1-9]|[1][0-9]|2[0-4])\:(0?[1-9]|[1-5][0-9])/g;

                    if (value.length && !re.test(value)) {
                        response.valid = false;
                        response.error = 'Este campo debe ser en formato HH:mm';
                    }

                    return response;
            }
        },
        template = '<div class="form-group dmb-input-time">' +
                        '<label>{{label}}</label>' +
                        '<input type="text" name="{{name}}" placeholder="hh:mm" validate="time,{{validate}}" id="{{id}}" value="{{value}}" />' +
                        '<div class="clock">' +
                            '<select class="hour">' +
                                '<option value="">Hora</option>' +
                            '</select>' +
                            '<select class="minute">' +
                                '<option value="">Min</option>' +
                            '</select>' +
                            '<button class="set-time">Set</button>' +
                        '</div>' +
                        '<span class="error-container"></span>' +
                    '</div>';

        function _runValidators(element, validators) {
            var unknownValidator = function() {
                    return {valid: false, error: 'Unknown validator type: "' + (validator || {}).key + '"'};
                },
                content = element.val().trim(),
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
                element.parent().removeClass(_errorInputClass);
                element.parent().find('.error-container').html('');
            } else {
                element.parent().addClass(_errorInputClass);
                element.parent().find('.error-container').html(message);
            }
            element.data('valid', valid);
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

        function setTime(e) {
            var hour = e.target.hours.value,
                min = e.target.mins.value,
                input = e.target.input;

            e.preventDefault();

            if (hour.length && min.length) {
                input.value = hour + ':' + min;
                input.classList.remove('activate');
            }
        }

        return {
            scope: {
                id: '@',
                label: '@',
                validate: '@',
                name: '@',
                value: '@'
            },
            build: function(dom, scope) {
                var input = dom.getElementsByTagName('input').item(0),
                    validators = [],
                    hours = dom.getElementsByClassName('hour').item(0),
                    minutes = dom.getElementsByClassName('minute').item(0),
                    i = 0,
                    pad = '00',
                    padded = '',
                    current = [],
                    parser = new DOMParser(),
                    option = parser.parseFromString(`<option value=""></option>`, 'text/html').getElementsByTagName('body').item(0).firstChild,
                    setTimeb = dom.getElementsByClassName('set-time').item(0);

                for (i = 0; i < 24; i++) {
                    padded = (pad + i).slice(-pad.length);
                    option.innerHTML = padded;
                    option.value = padded;
                    hours.append(option.cloneNode(true));
                }

                for (i = 0; i < 60; i++) {
                    padded = (pad + i).slice(-pad.length);
                    option.innerHTML = padded;
                    option.value = padded;
                    minutes.append(option.cloneNode(true));
                }

                if (scope.placeholder) {
                    input.setAttribute('placeholder', scope.placeholder);
                }

                if (!scope.id) {
                    scope.id = Math.random().toString(36).replace(/[^a-z]+/g, '').substr(0, 5);
                    input.setAttribute('id', scope.id);
                }

                if (scope.validate) {
                    validators = buildValidators(input, scope);

                    input.addEventListener('blur', (e) => {
                        _runValidators(e.target, validators);
                    }, true);

                    document.addEventListener(dmbEvents.validate.listener, () => {
                        _runValidators(input, validators);
                    }, true);

                    document.addEventListener(dmbEvents.resetValidation.listener, () => {
                        let elements = dom.getElementsByClassName(_errorInputClass);

                        for (let i = 0; elements.length; i++) {
                            elements.item(0).classList.remove(_errorInputClass);
                        }
                    }, true);
                }

                if (input.value || input.value.length) {
                    current = input.value.split(':');
                    hours.value = current[0];
                    minutes.value = current[1];
                }

                input.addEventListener('focusin', e => {
                    e.target.classList.add('activate');
                });

                document.addEventListener('keyup', e => {
                    var char = e.keyCode;

                    if (char === 27) {
                        input.classList.add('activate');
                    }
                });

                input.addEventListener('keypress', e => {
                    let char = e.which || e.keyCode;

                    if (char === 27) {
                        input.classList.remove('activate');
                    } else {
                        return false;
                    }
                });

                document.addEventListener('click', e => {
                    let sHour = dom.querySelector('.clock .hour'),
                        sMinute = dom.querySelector('.clock .minute');

                    if (e.target != input && e.target != sHour && e.target != sMinute) {
                        input.classList.remove('activate');
                    }
                });

                setTimeb.input = input;
                setTimeb.hours = hours;
                setTimeb.mins = minutes;

                setTimeb.addEventListener('click', setTime);
            },
            template: template
        };
    }
})();
