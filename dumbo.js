(() => {
'use strict';

    var completeRequires = null,
        isReadyToReplace = null,
        avaliable = null,
        setScope = null,
        IsJsonString = null,
        validateCompleteLoad = null,
        validateCompleteRender = null,
        replaceDom = null,
        vDom = document.cloneNode(true),
        rendering = false,
        MutationObserver = window.MutationObserver || window.WebKitMutationObserver || window.MozMutationObserver,
        observer = new MutationObserver(function(mutations) {
            mutations.forEach(function(mutation) {
                if (mutation.type === 'childList' && !rendering && mutation.addedNodes.length > 0) {
                    replaceDom(mutation.target);
                };
            });
        }),
        config = { attributes: false, childList: true, characterData: false, subtree: true };

    Element.prototype.innerScope = {};
    Element.prototype.scope = function (scope) {
        if (typeof this.innerScope === 'undefined') {
            this.innerScope = {};
        }

        if (scope && typeof scope === 'object') {
            this.innerScope = scope;
        }

        return this.innerScope;
    };

    avaliable = (libs) => {
        var counts = 0,
            interval = null,
            defer = new Promise((resolve) => {
                interval = setInterval(() => {
                    if (counts < libs.length) {
                        counts = 0;
                        for (var i = 0; i < libs.length; i++) {
                            if (typeof window.dumbo.factories[libs[i]] === 'object') {
                                counts = counts + 1;
                            }
                        }
                    }

                    if (counts >= libs.length) {
                        resolve();
                        clearInterval(interval);
                    }
                }, 0);
            });

        return defer;
    };

    completeRequires = (required, object, element) => {
        var includes = [],
            defer = new Promise((resolve) => {
                avaliable(required).then(() => {
                    var requiredCount = required.length;

                    for (let i = 0; i < requiredCount; i++) {
                        includes.push(window.dumbo.factories[required[i]]);
                    }
                    resolve({requires: includes, object, element});
                });
            });

        return defer;
    };

    isReadyToReplace = function(tag, dom) {

        return new Promise((resolve) => {
            var interval = setInterval(() => {
                    var tagValidated = tag,
                        oldDom = dom;

                    if (typeof window.dumbo.directives[tag] === 'object') {
                        clearInterval(interval);
                        resolve({oldDom: oldDom, theTag: tagValidated});
                    }
                }, 1);
            });
    };

    IsJsonString = (str) => {
        try {
            JSON.parse(str);
        } catch (e) {
            return false;
        }
        return true;
    };

    setScope = (attrs, scope, parentScope) => {
        var attr = '',
            newScope = Object.assign({}, parentScope),
            flatAttrs = {};

        for (let i = 0; i < attrs.length; i++) {
            flatAttrs[attrs[i].name] = attrs[i].value;
        }

        for (let i in scope) {
            attr = '' + i;
            attr = attr.replace(/([A-Z])/g, '-$1').toLowerCase();

            newScope[i] = undefined;

            if (typeof parentScope !== 'undefined' && !!parentScope[flatAttrs[attr]]) {
                newScope[i] = parentScope[flatAttrs[attr]];
            }

            switch (scope[i]) {
                case '@':
                    newScope[i] = flatAttrs[attr];
                break;
                case '=':
                    if (typeof newScope[i] === 'undefined' && typeof flatAttrs[attr] !== 'undefined' && IsJsonString(flatAttrs[attr])) {
                        newScope[i] = JSON.parse(flatAttrs[attr]);
                    } else if (typeof newScope[i] === 'undefined' && typeof flatAttrs[attr] !== 'undefined') {
                        newScope[i] = flatAttrs[attr];
                    }
                break;
                case '&':
                    if (typeof flatAttrs[attr] === 'function') {
                        newScope[i] = flatAttrs[attr];
                    } else if (parentScope[i] && typeof parentScope[i] === 'function') {
                        newScope[i] = parentScope[i];
                    }
                break;
            }
        }
        return newScope;
    };

    validateCompleteLoad = () => {
        var timer = null;

        return new Promise((resolve) => {
            timer = setInterval(function() {
                var fCounter = 0,
                    eCounter = 0,
                    i = 0;

                for (i in dumbo.directives) {
                    if (typeof dumbo.directives[i] === 'object') {
                        eCounter++;
                    }
                }

                for (i in dumbo.factories) {
                    fCounter++;
                }

                if (eCounter === window.dumbo.elementsCounter && fCounter === window.dumbo.factoriesCounter) {
                    clearInterval(timer);
                    resolve([fCounter, eCounter]);
                }
            }, 0);
        });
    };

    validateCompleteRender = () => {
        var timer = null,
            defer = new Promise((resolve) => {
                timer = setInterval(function() {
                    var cont = 0;

                    if (vDom.firstChild) {
                        for (var el in window.dumbo.directives) {
                            cont = cont + vDom.body.getElementsByTagName(el).length;
                        }
                    }

                    if (cont === 0) {
                        clearInterval(timer);
                        resolve(true);
                    }
                }, 0);
            });

        return defer;
    };

    Window.prototype.dumbo = {
        config: {prefixes: []},
        directives: {},
        factories: {},
        elementsCounter: 0,
        factoriesCounter: 0,
        factoriesBuilt: [],
        pendingForLoad: [],
        pendingForRender: [],
        compile: (object, element, params, fn) => {
            if (!fn) {
                throw 'Insuficient params';
            }

            if (window.dumbo[object][element]) {
                throw element + ' Is already defined.';
            }

            window.dumbo[object][element] = true;
            completeRequires(params, object, element).then((resolved) => {
                window.dumbo[resolved.object][resolved.element] = fn.apply(null, resolved.requires);
                if (resolved.object === 'directives') {
                    document.registerElement(resolved.element, {
                        prototype: Object.create(HTMLDivElement.prototype),
                        extends: 'div'
                    });
                }
            });
        },
        factory: (factory, params, fn) => {
            window.dumbo.compile('factories', factory, params, fn);
            window.dumbo.factoriesCounter++;
        },
        directive: (directive, params, fn) => {
            var selector = directive.replace(/([A-Z])/g, '-$1').toLowerCase();

            window.dumbo.compile('directives', selector, params, fn);
            window.dumbo.elementsCounter++;
        },
        renderElement: (el) => {
            var transclude = null,
                attrs = {},
                content = '',
                element = el.tagName.toLowerCase(),
                dom = null,
                parentScope = null,
                scope = {},
                elementScope = (window.dumbo.directives[element] && window.dumbo.directives[element].scope) || {},
                template = '',
                parser = new DOMParser();

            for (let i = 0; i < el.attributes.length; i++) {
                attrs[el.attributes[i].name] = el.attributes[i].value;
            }

            parentScope = (el.closest('.dmb-scope') && el.closest('.dmb-scope').scope()) || {};
            scope = setScope(el.attributes, elementScope, parentScope);

            if (typeof window.dumbo.directives[element] != 'undefined' && typeof window.dumbo.directives[element].template !== 'undefined') {

                if (typeof window.dumbo.directives[element] !== 'undefined' && typeof window.dumbo.directives[element].pre === 'function') {
                    window.dumbo.directives[element].pre(scope, attrs);
                }

                template = window.dumbo.directives[element].template.replace(/{{([\w]+)}}/gm, (x, y) => {
                    return scope[y] || '';
                });

                template = template.replace(/<transclude><\/transclude>/i, el.innerHTML);
                dom = parser.parseFromString(template, 'text/html').getElementsByTagName('body').item(0).firstChild;

                dom.classList.add('dmb-scope');
                el.parentNode.replaceChild(dom, el);
                dom.scope(scope);

                if (typeof window.dumbo.directives[element] !== 'undefined' && typeof window.dumbo.directives[element].build === 'function') {
                    window.dumbo.directives[element].build(dom, scope, attrs);
                    dom.scope(scope);
                }
            } else {
                el.parentNode.removeChild(el);
            }

            rendering = false;

            return false;
        }
    };

    function isFree(element) {
        var allTags = Object.keys(window.dumbo.directives);

        for (let i = 0; i < allTags.length; i++) {
            if (!!element.closest(allTags[i]) && element.closest(allTags[i]) !== element) {
                return false;
            }
        }

        return true;
    }

    replaceDom = (toReplace) => {
        var dom = null,
            tag = '',
            elements = null,
            allTags = Object.keys(window.dumbo.directives),
            allTagsJoined = allTags.map((value) => {return `${value}:not(.rendering)`}).join(', '),
            totalElements = 0,
            root = !!toReplace ? toReplace : vDom.body;

        if (allTagsJoined.length) {
            elements = root.querySelectorAll(allTagsJoined);
            totalElements = elements.length;
        }

        if (totalElements) {
            for (let i = 0; i < totalElements; i++) {
                dom = elements[i];
                tag = dom.tagName.toLowerCase();

                if (isFree(dom)) {
                    rendering = true;
                    dom.classList.add('rendering');
                    isReadyToReplace(tag, dom).then((data) => {
                        dumbo.renderElement(data.oldDom, data.theTag);

                        if (root.querySelectorAll(allTagsJoined).length) {
                            replaceDom(toReplace);
                        }
                    });
                }
            }
        }

        return false;
    };

    document.addEventListener('DOMContentLoaded', () => {
        validateCompleteLoad().then(() => {

                if (!rendering) {
                    replaceDom();

                    validateCompleteRender().then(() => {
                        let completeRenderEvent = new Event('dmbCompleteRender'),
                            oldBody = document.getElementsByTagName('body')[0],
                            n = vDom.getElementsByTagName('body')[0];

                        observer.observe(n, config);
                        oldBody.parentNode.replaceChild(n, oldBody);
                        document.dispatchEvent(completeRenderEvent);

                        return false;
                    });

                }
                return true;
        });
    });
})();
