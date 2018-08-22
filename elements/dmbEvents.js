/**
 * @property {resetValidation}
 * @property {validate}
 */
(function() {
    'use strict';

    dumbo.factory('dmbEvents', [], Factory);

    function Factory() {

        return {
            resetValidation: 'dmb-validation.validate',
            validate: 'dmb-validation.validate'
        };
    }
})();
