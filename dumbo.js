(function(window, $) {
'use strict';

window.dumbo = {};

dumbo.elements = [];
dumbo.factories = [];
dumbo.elementsCounter = 0;
dumbo.factoriesCounter = 0;
dumbo.factoriesBuilt = [];

$.extend(HTMLElement.prototype, {
    innerScope: {}
});

$.fn.extend({
    scope: function(scope) {
        if (typeof this.prop('innerScope') === 'undefined') {
            this.prop('innerScope', {});
        }

        if (scope) {
            this.prop('innerScope', scope);
        }

        return this.prop('innerScope');
    }
});

dumbo.compile = function(object, element, params, fn) {
    var requires = [],
        dom = $(),
        build = {
            template: '',
            build: function() {},
            transclude: false,
            scope: {}
        };

    if (!fn) {
        throw 'Insuficient params';
    }

    $.when(completeRequires(params)).then(function(requires) {
        dumbo[object][element] = $.extend(build, fn.apply(build, requires));

        $(document).trigger('dmbReady');
    });
};

dumbo.factory = function(factory, params, fn) {
    dumbo.compile('factories', factory, params, fn);
    dumbo.factoriesCounter++;
    dumbo.factoriesBuilt.push(factory);
}

dumbo.parser = function(directive, params, fn) {
    var selector = directive.replace(/([A-Z])/g, '-$1').toLowerCase();

    dumbo.compile('elements', selector, params, fn);
    dumbo.elementsCounter++;
};

dumbo.renderElement = function (el) {
    var transclude = $(),
        attrs = {},
        content = '',
        element = el.prop('tagName').toLowerCase(),
        dom = $(),
        parentScope = el.closest('.dmb-scope').scope(),
        scope = {},
        template = '',
        defer = $.Deferred();

    if (typeof dumbo.elements[element] !== 'undefined' && typeof dumbo.elements[element].scope !== 'undefined') {
        scope = setScope(el[0].attributes, dumbo.elements[element].scope, parentScope);
    }

    for (var i = 0; i < el[0].attributes.length; i++) {
        attrs[el[0].attributes[i].name] = el[0].attributes[i].value;
    }

    if (typeof dumbo.elements[element] != 'undefined' && typeof dumbo.elements[element].template !== 'undefined') {
        template = dumbo.elements[element].template.replace(/{{([\w]+)}}/gm, function (x, y) {
            return scope[y] || '';
        });
        dom = $(template);
        transclude = dom.find('transclude');
        if (transclude.length > 0) {
            content = el.html();
            transclude.replaceWith(content);
        }
    }

    dom.addClass('dmb-scope');

    if (typeof dumbo.elements[element] !== 'undefined' && typeof dumbo.elements[element].build === 'function') {
        dumbo.elements[element].build(dom, scope, attrs);
    }

    dom.scope(scope);

    for (var el in dumbo.elements) {
        dom.find(el).each(function() {
            var cont = dumbo.renderElement($(this));
            $(this).replaceWith(cont);
        });
    }

    return dom;
}

dumbo.buildFactory = function(element) {
    var dom = $();

    if (typeof dumbo.factories[element].template !== 'undefined') {
        dom = $(dumbo.factories[element].template);
        for (var el in dumbo.elements) {
            dom.find(el).each(function() {
                var cont = dumbo.renderElement($(this));
                $(this).html(cont);
            });
        }
    }

    dumbo.factories[element].build(dom, dumbo.factories[element].scope);
};

$(document).on('dmbReady', function() {
    for (var el in dumbo.factories) {
        if (dumbo.factoriesBuilt.indexOf(el) < 0) {
            dumbo.buildFactory(el);
        }
    }
    for (var el in dumbo.elements) {
        $(el).each(function() {
            var cont = dumbo.renderElement($(this));
            $(this).replaceWith(cont);
        });
    }

});

/**
 *
 * @todo scope attributes validations
 * @todo scope funtion to pass with &
 * @param scope
 * @param tag
 * @returns
 */
function setScope(attrs, scope, parentScope) {
    var attr = '',
        newScope = {},
        flatAttrs = {};

    for (var i = 0; i < attrs.length; i++) {
        flatAttrs[attrs[i].name] = attrs[i].value;
    }

    for (var i in scope) {
        attr = '' + i;
        attr = attr.replace(/([A-Z])/g, '-$1').toLowerCase();

        switch (scope[i]) {
            case '@':
                newScope[i] = flatAttrs[attr];
            break;
            case '=':
                if (typeof flatAttrs[attr] === 'undefined' || typeof parentScope[flatAttrs[attr]] === 'undefined') {
                    newScope[i] = undefined;
                } else {
                    newScope[i] = parentScope[flatAttrs[attr]];
                }
            break;
//            case '&':
//                if (typeof flatAttrs[attr] === 'undefined' || typeof parentScope[flatAttrs[attr]] === 'undefined') {
//                    newScope[i] = undefined;
//                } else {
//                    newScope[i] = parentScope[flatAttrs[attr]]();
//                }
//            break;
            default:
                newScope[i] = undefined;
            break;
        }
    }

    return newScope;
}

function available(libs) {
    var defer = $.Deferred(),
        counts = 0,
        interval = null;

    for (var i = 0; i < libs.length; i++) {
        if (typeof dumbo.factories[libs[i]] !== 'undefined') {
            counts = counts + 1;
        }
    }

    interval = setInterval(function() {
        if (counts < libs.length) {
            counts = 0;
            for (var i = 0; i < libs.length; i++) {
                if (typeof dumbo.factories[libs[i]] !== 'undefined') {
                    counts = counts + 1;
                } else {
                    throw 'Undefined required: ' + libs[i];
                }
            }
        }

        if (counts >= libs.length) {
            defer.resolve();
            clearInterval(interval);
        }
    }, 2);

    return defer.promise();
}

function completeRequires(required) {
    var defer = $.Deferred(),
        includes = [];

    if (required.length == 0) {
        defer.resolve(includes);
    } else {
        $.when(available(required)).then(function() {
            for (var i = 0; i < required.length; i++) {
                includes.push(dumbo.factories[required[i]]);
            }
            defer.resolve(includes);
        });
    }
    return defer.promise();
}

function validateCompleteLoad() {
    var $defer = $.Deferred(),
        timer = null,
        cont = 0;

    timer = setInterval(function() {
        cont = cont + 10;
        var fCounter = 0,
            eCounter = 0,
            i = 0;

        for (i in dumbo.elements) {
            eCounter++;
        }

        for (i in dumbo.factories) {
            fCounter++;
        }

        if (eCounter === dumbo.elementsCounter && fCounter === dumbo.factoriesCounter) {
            clearInterval(timer);
            $defer.resolve([fCounter, eCounter]);
        }
    }, 10);

    return $defer.promise();
}


function validateCompleteRender() {
    var $defer = $.Deferred(),
        timer = null;

    timer = setInterval(function() {
        var cont = 0;
        for (var el in dumbo.elements) {
            $(el).each(function() {
                cont++;
            });
        }

        if (cont === 0) {
            clearInterval(timer);
            $defer.resolve();
        }
    }, 10);

    return $defer.promise();
}

$(window).on('load', function() {
    validateCompleteRender().then(function() {
        $(document).trigger('dmbCompleteRender');
    });

    validateCompleteLoad().then(function(counters) {
        $(window).trigger('dmbLoaded');
    });
});

})(window, jQuery);
