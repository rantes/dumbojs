/**
 * Renders a calendar to select a date in an input.
 * @name dmbInputDate
 * @kind class
 * @param {string} [validate=''] comma separated list of validations. Accepted values are: required and date.
 * @todo everything
 */

(function() {
    'use strict';

    dumbo.directive('dmbInputDate', [
        'dmbEvents'
    ], Directive);

    function Directive(dmbEvents) {
        var _errorInputClass = '_error',
            validations = {
            /**
             * Checks every required field, adds an error class and retun true or false.
             * @kind function
             * @memberof dmbInputDate
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
            _date: function (value) {
                var response = {
                        valid: true,
                        error: null
                    },
                    re = /^(0?[1-9]|[12][0-9]|3[01])\/(0?[1-9]|1[012])\/(\d{4})/g;

                    if (value.length && !re.test(value)) {
                        response.valid = false;
                        response.error = 'Este campo debe ser en formato dd/mm/yyyy';
                    }

                    return response;
            }
        },
        template = '<div class="form-group dmb-input-date">' +
                        '<label>{{label}}</label>' +
                        '<input type="text" name="{{name}}" placeholder="mm/dd/yyyy" validate="date,{{validate}}" id="{{id}}" value="{{value}}" />' +
                        '<div class="calendar">' +
                            '<div class="calendar-selectors">' +
                                '<div class="month">' +
                                    '<select class="months"></select>' +
                                '</div>' +
                                '<div class="year">' +
                                    '<select class="years"></select>' +
                                '</div>' +
                            '</div>' +
                            '<div class="calendar-container"></div>' +
                        '</div>' +
                        '<span class="error-container"></span>' +
                    '</div>',
        clickOnDay = function(e) {
            let selected = e.target.parentNode.parentNode.getElementsByClassName('selected');

            for (let i = 0; i < selected.length; i++) {
                selected.item(i).classList.remove('selected');
            }

            e.target.classList.add('selected');
            e.target.inputTo.value = e.target.getAttribute('date');
            e.target.inputTo.classList.remove('activate');
        };

        function _runValidators(element, validators) {
            var unknownValidator = function() {
                    return {valid: false, error: 'Unknown validator type: "' + (validator || {}).key + '"'};
                },
                content = element.value.trim(),
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
                element.parentNode.removeClass(_errorInputClass);
                element.parentNode.querySelector('.error-container').innerHTML = '';
            } else {
                element.parentNode.classList.add(_errorInputClass);
                element.parentNode.querySelector('.error-container').innerHTML = message;
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

        function calendar(dom, year, month, date) {
            var labelDays = ['Dom', 'Lun', 'Mar', 'Mie', 'Jue', 'Vie', 'Sab'],
                labelMonths = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'],
                currentDate = new Date(year, month, date),
                currentYear = currentDate.getFullYear(),
                currentMonth = currentDate.getMonth(),
                firstDayCurrentMonth = new Date(currentYear, currentMonth, 1).getDay(),
                lastDateCurrentMonth = new Date(currentYear, currentMonth + 1, 0).getDate(),
                parser = new DOMParser(),
                headerCal = parser.parseFromString('<thead></thead>', 'text/xml').documentElement,
                week = document.createElement('tr'),
                monthTable = parser.parseFromString('<tbody class="month"></tbody>', 'text/xml').documentElement,
                monthContainer = parser.parseFromString('<table class="calendar-month"></table>', 'text/html').getElementsByTagName('body').item(0).firstChild,
                i = 0,
                j = 0,
                day = 1,
                buildDate = function(day) {
                    var date = new Date(currentYear, currentMonth, day);
                    return (1 * date.getMonth() + 1) + '/' + date.getDate() + '/' + date.getFullYear();
                },
                option = null,
                input = dom.getElementsByTagName('input').item(0),
                weekN = 0;

                monthContainer.appendChild(monthTable);
                for (i = 0; i < 12; i++) {
                    option = parser.parseFromString(`<option value="${i}">${labelMonths[i]}</option>`, 'text/html').getElementsByTagName('body').item(0).firstChild;

                    if (i === currentDate.getMonth()) {
                        option.setAttribute('selected',true);
                    }

                    dom.querySelector('.calendar-selectors .months').appendChild(option);
                }

                for (i = currentYear - 10; i < currentYear + 10; i++) {
                    option = parser.parseFromString(`<option value="${i}">${i}</option>`, 'text/html').getElementsByTagName('body').item(0).firstChild;

                    if (i === currentYear) {
                        option.setAttribute('selected',true);
                    }

                    dom.querySelector('.calendar-selectors .years').appendChild(option);
                }

                //Build the labels for week days
                week.classList.add('week');
                for (i = 0; i < 7; i++) {
                    week.appendChild(parser.parseFromString(`<th class="day-week">${labelDays[i]}</th>`, 'text/xml').documentElement);
                }

                headerCal.appendChild(week.cloneNode(true));
                monthContainer.appendChild(headerCal);
                week = monthContainer.insertRow(weekN);
                weekN++;

                for (i = 0; i < firstDayCurrentMonth; i++) {
                    let eDay = week.insertCell(i);

                    eDay.classList.add('day');
                    eDay.classList.add('empty');
                }

                for (i = firstDayCurrentMonth; i < 7; i++) {
                    let fullDate = buildDate(day),
                        eDay = week.insertCell(i);

                    eDay.classList.add('day');
                    eDay.setAttribute('date', fullDate);
                    eDay.innerHTML = day;
                    eDay.inputTo = input;
                    eDay.addEventListener('click', clickOnDay);

                    if (day === currentDate.getDate()) {
                        eDay.classList.add('selected');
                    }

                    day++;
                }

                week = monthContainer.insertRow(weekN);
                weekN++;

                for (i = day; i <= lastDateCurrentMonth; i++) {
                    let fullDate = buildDate(i),
                        eDay = week.insertCell(j);

                    eDay.classList.add('day');
                    eDay.innerHTML = i;
                    eDay.setAttribute('date', fullDate);
                    eDay.inputTo = input;
                    eDay.addEventListener('click', clickOnDay);

                    if (i === currentDate.getDate()) {
                        eDay.classList.add('selected');
                    }

                    j++;

                    if (j === 7) {
                        week = monthContainer.insertRow(weekN);
                        weekN++;
                        j = 0;
                    }
                }

                if (j < 7 && j > 0) {
                    for (let x = j; x < 7; x++) {
                        let eDay = week.insertCell(j);

                        eDay.classList.add('day');
                        eDay.classList.add('empty');
                    }
                }
                dom.querySelector('.calendar-container').innerHTML = '';
                dom.querySelector('.calendar-container').appendChild(monthContainer);
        }

        return {
            scope: {
                id: '@',
                label: '@',
                name: '@',
                placeholder: '@',
                validate: '@',
                value: '@'
            },
            build: function(dom, scope) {
                var input = dom.getElementsByTagName('input').item(0),
                    validators = [],
                    now = new Date(),
                    buildCalendar = (dom, now) => {
                        calendar(dom, now.getFullYear(), now.getMonth(), now.getDate());
                    };

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

                if (input.value && input.value.length) {
                    now = new Date(input.value);
                }

                dom.getElementsByClassName('months').item(0).addEventListener('change', (e) => {
                    now = new Date(now.getFullYear(), e.target.value);
                    buildCalendar(dom, now);
                }, false);

                dom.getElementsByClassName('years').item(0).addEventListener('change', (e) => {
                    now = new Date(e.target.value, now.getMonth());
                    buildCalendar(dom, now);
                }, false);

                buildCalendar(dom, now);

                input.addEventListener('focusin', e => {
                    e.target.classList.add('activate');
                });

                document.addEventListener('keyup', e => {
                    var char = e.keyCode;

                    if (char === 27) {
                        input.classList.add('activate');
                    }
                });

                document.addEventListener('click', e => {
                    let sYears = dom.querySelector('.calendar-selectors .years'),
                        sMonths = dom.querySelector('.calendar-selectors .months');

                    if (e.target != input && e.target != sYears && e.target != sMonths) {
                        input.classList.remove('activate');
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
            },
            template: template
        };
    }
})();
