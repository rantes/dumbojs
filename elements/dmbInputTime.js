(function($) {
    'use strict';

    dumbo.parser('dmbInputTime', [
        'dmbEvents'
    ], Builder);

    function Builder(dmbEvents) {
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
            _time: function (value) {
                var response = {
                        valid: true,
                        error: null
                    },
                    re = /^(0?[1-9]|[1][0-9]|2[0-4])\:(0?[1-9]|[1-5][0-9])$/g;

                    if (value.length && !re.test(value)) {
                        response.valid = false;
                        response.error = 'Este campo debe ser en formato HH:mm';
                    }

                    return response;
            }
        },
        template = '<div class="form-group input-time">' +
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

        function setTime(e) {
            var hour = e.data.hours.val(),
                min = e.data.mins.val();

            e.preventDefault();

            if (hour.length && min.length) {
                e.data.input.val(hour + ':' + min);
                e.data.input.removeClass('activate');
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
                var $input = dom.find('input'),
                    validators = [],
                    hours = dom.find('.hour'),
                    minutes = dom.find('.minute'),
                    $option = $('<option value=""></option>'),
                    i = 0,
                    pad = '00',
                    padded = '',
                    current = [];

                for (i = 0; i < 24; i++) {
                    padded = (pad + i).slice(-pad.length);
                    $option.clone().text(padded).val(padded).appendTo(hours);
                }

                for (i = 0; i < 60; i++) {
                    padded = (pad + i).slice(-pad.length);
                    $option.clone().text(padded).val(padded).appendTo(minutes);
                }

                if (scope.validate) {
                    validators = buildValidators($input);

                    $input.on('blur', function() {
                        _runValidators($input, validators);
                    });

                    $('body').on(dmbEvents.validate, function() {
                        _runValidators($input, validators);
                    });

                    $('body').on(dmbEvents.resetValidation, function() {
                        dom.find(_errorInputClass).removeClass(_errorInputClass);
                    });
                }

                if ($input.val().length) {
                    current = $input.val().split(':');
                    hours.val(current[0]);
                    minutes.val(current[1]);
                }

                dom.on('click',function(e) {
                    e.stopPropagation();
                });

                $input.on('focusin click', function(e) {
                    var $this = $(e.target);

                    $this.addClass('activate');
                });

                $('body').on('keyup', function(e) {
                    var char = e.keyCode;

                    if (char === 27) {
                        $input.removeClass('activate');
                    }
                });

                $(document).on('click', function() {
                    $input.removeClass('activate');
                });

                $input.on('keypress', function(e) {
                    var char = e.which || e.keyCode;

                    if (char === 27) {
                        $input.removeClass('activate');
                    } else {
                        return false;
                    }
                });

                dom.find('.set-time').on('click', {input: $input, hours: hours, mins: minutes}, setTime);
            },
            template: template
        };
    }
})(jQuery);
