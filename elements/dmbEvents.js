/**
 * @property {resetValidation}
 * @property {validate}
 */
(function() {
    'use strict';

    dumbo.factory('dmbEvents', [], Builder);

    function Builder() {

        return {
            resetValidation: 'dmb-validation.validate',
            validate: 'dmb-validation.validate'
        };
    }
})();
