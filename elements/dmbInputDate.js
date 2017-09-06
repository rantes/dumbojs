/**
 * Renders a calendar to select a date in an input.
 * @name dmbInputDate
 * @kind class
 * @param {string} [validate=''] comma separated list of validations. Accepted values are: required and date.
 * @todo everything
 */

(function($) {
    'use strict';

    dumbo.parser('dmbInputDate', [
        'dmbEvents'
    ], Builder);

    function Builder(dmbEvents) {
        var _errorInputClass = '_error',
            validations = {
            /**
             * Checks every required field, adds an error class and retun true or false.
             * @kind function
             * @memberof dmbInputDate
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
            _date: function (value) {
                var response = {
                        valid: true,
                        error: null
                    },
                    re = /^(0?[1-9]|[12][0-9]|3[01])\/(0?[1-9]|1[012])\/(\d{4})$/g;

                    if (value.length && !re.test(value)) {
                        response.valid = false;
                        response.error = 'Este campo debe ser en formato dd/mm/yyyy';
                    }

                    return response;
            }
        },
        template = '<div class="form-group input-date">' +
                        '<label>{{label}}</label>' +
                        '<input type="text" name="{{name}}" placeholder="mm/dd/yyyy" validate="date,{{validate}}" id="{{id}}" value="{{value}}" />' +
                        '<div class="calendar">' +
                            '<div class="calendar-selectors">' +
                                '<div class="month">' +
                                    '<select class="months">' +
                                    '</select>' +
                                '</div>' +
                                '<div class="year">' +
                                    '<select class="years">' +
                                    '</select>' +
                                '</div>' +
                            '</div>' +
                            '<div class="calendar-container"></div>' +
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

        function calendar(dom, year, month, date) {
            var labelDays = ['Dom', 'Lun', 'Mar', 'Mie', 'Jue', 'Vie', 'Sab'],
                labelMonths = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'],
                currentDate = new Date(year, month, date),
                currentYear = currentDate.getFullYear(),
                currentMonth = currentDate.getMonth(),
                firstDayCurrentMonth = new Date(currentYear, currentMonth, 1).getDay(),
                lastDateCurrentMonth = new Date(currentYear, currentMonth + 1, 0).getDate(),
                $weekLabel = $('<th class="day-week"></th>'),
                $headerCal = $('<thead></thead>'),
                $day = $('<td class="day" datelocale=""></td>'),
                $week = $('<tr class="week"></tr>'),
                $month = $('<tbody class="month"></tbody>'),
                $monthContainer = $('<table class="calendar-month"></table>'),
                i = 0,
                j = 0,
                day = 1,
                buildDate = function(day) {
                    var date = new Date(currentYear, currentMonth, day);
                    return (1 * date.getMonth() + 1) + '/' + date.getDate() + '/' + date.getFullYear();
                },
                option = null;
                for (i = 0; i < 12; i++) {
                    option = $('<option></option>', {
                        value: i,
                        html: labelMonths[i]
                    });

                    if (i === currentDate.getMonth()) {
                        option.prop('selected',true);
                    }

                    dom.find('.calendar-selectors .months').append(option);
                }

                for (i = currentYear - 10; i < currentYear + 10; i++) {
                    option = $('<option></option>', {
                        value: i,
                        html: i
                    });

                    if (i === currentYear) {
                        option.prop('selected',true);
                    }

                    dom.find('.calendar-selectors .years').append(option);
                }
                //Build the labels for week days
                for (i = 0; i < 7; i++) {
                    $weekLabel.html(labelDays[i]).clone().appendTo($week);
                }

                $week.clone().appendTo($headerCal);
                $week.html('');
                $headerCal.appendTo($monthContainer);

                for (i = 0; i < firstDayCurrentMonth; i++) {
                    $day.html('').clone().addClass('empty').appendTo($week);
                }

                for (i = firstDayCurrentMonth; i < 7; i++) {
                    $day.removeClass('selected');

                    if (day === currentDate.getDate()) {
                        $day.addClass('selected');
                    }

                    $day.attr('date', buildDate(day)).html(day).clone().appendTo($week);
                    day++;
                }

                $week.clone().appendTo($month);
                $week.html('');

                for (i = day; i <= lastDateCurrentMonth; i++) {
                    $day.removeClass('selected');
                    if (i === currentDate.getDate()) {
                        $day.addClass('selected');
                    }
                    $day.attr('date', buildDate(i)).html(i).clone().appendTo($week);
                    j++;
                    if (j === 7) {
                        $week.clone().appendTo($month);
                        $week.html('');
                        j = 0;
                    }
                }

                if (i >= lastDateCurrentMonth) {
                    $week.clone().appendTo($month);
                }

                $month.appendTo($monthContainer);
                dom.find('.calendar-container').html($monthContainer);
        }

        function clickOnDay(e) {
            var $this = $(e.target);

            $this.parent().parent('.month').find('.selected').removeClass('selected');
            $this.addClass('selected');
            e.data.input.val($this.attr('date'));
            e.data.input.removeClass('activate');
        }

        return {
            scope: {
                id: '@',
                label: '@',
                name: '@',
                validate: '@',
                value: '@'
            },
            build: function(dom, scope) {
                var $input = dom.find('input'),
                    validators = [],
                    now = new Date();

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
                    now = new Date($input.val());
                }

                function buildCalendar() {
                    calendar(dom, now.getFullYear(), now.getMonth(), now.getDate());
                    dom.find('.day').on('click', {input: $input}, clickOnDay);
                }

                dom.on('click',function(e) {
                    e.stopPropagation();
                });

                dom.find('.calendar-selectors .months').on('change', function(e) {
                    var $this = $(e.target);

                    now = new Date(now.getFullYear(), $this.val());
                    buildCalendar();
                });

                dom.find('.calendar-selectors .years').on('change', function(e) {
                    var $this = $(e.target);

                    now = new Date($this.val(), now.getMonth());
                    buildCalendar();
                });

                buildCalendar();

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
            },
            template: template
        };
    }
})(jQuery);
