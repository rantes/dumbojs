(function($) {
    'use strict';

    dumbo.parser('dmbSelect', [], Builder);

    function Builder() {
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
            }
        },
        template = '<div class="form-group">' +
                        '<label>{{label}}</label>' +
                        '<select name="{{name}}" id="{{id}}" validate="{{validate}}">' +
                            '<option value="">Seleccione...</option>' +
                        '</select>' +
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
                id: '@',
                label: '@',
                dmbSelected: '@',
                name: '@',
                validate: '@',
                values: '=',
            },
            build: function(dom, scope) {
                var $select = dom.find('select'),
                    validators = [];

                if (scope.validate) {
                    validators = buildValidators($select);

                    $select.on('blur', function(element) {
                        _runValidators(element, validators);
                    });
                }

                if (typeof scope.dmbSelected !== 'undefined') {
                    scope.dmbSelected = scope.dmbSelected.trim();
                } else {
                    scope.dmbSelected = '';
                }

                for (var i in scope.values) {
                    var option = $('<option></option>', {
                        value: scope.values[i].value,
                        html: scope.values[i].label
                    });

                    if (scope.dmbSelected.length && scope.values[i].value == scope.dmbSelected) {
                        option.attr('selected','selected');
                    }

                    option.appendTo($select);
                }
            },
            template: template
        };
    }
})(jQuery);
