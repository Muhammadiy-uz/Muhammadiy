/*
 * jquery-asSwitch
 * https://github.com/amazingSurge/jquery-asSwitch
 *
 * Copyright (c) 2014 amazingSurge
 * Licensed under the GPL license.
 */
(function($, document, window, undefined) {
    "use strict";

    var AsSwitcher = $.asSwitch = function(element, options) {
        this.$element = $(element).wrap('<div></div>');
        this.$wrap = this.$element.parent();

        var meta = {
            disabled: this.$element.prop('disabled'),
            checked: this.$element.prop('checked')
        };

        this.options = $.extend({}, AsSwitcher.defaults, options, meta, this.$element.data());
        this.namespace = this.options.namespace;
        this.classes = {
            skin: this.namespace + '_' + this.options.skin,
            on: this.namespace + '_on',
            off: this.namespace + '_off',
            disabled: this.namespace + '_disabled'
        };

        this.$wrap.addClass(this.namespace);

        if (this.options.skin) {
            this.$wrap.addClass(this.classes.skin);
        }

        this.checked = this.options.checked;
        this.disabled = this.options.disabled;
        this.initialized = false;

        // flag
        this._click = true;
        this._trigger('init');
        this.init();
    };

    AsSwitcher.prototype = {
        constuctor: AsSwitcher,
        init: function() {
            var opts = this.options;

            this.$inner = $('<div class="' + this.namespace + '-inner"></div>');
            this.$innerBox = $('<div class="' + this.namespace + '-inner-box"></div>');
            this.$on = $('<div class="' + this.namespace + '-on">' + opts.onText + '</div>');
            this.$off = $('<div class="' + this.namespace + '-off">' + opts.offText + '</div>');
            this.$handle = $('<div class="' + this.namespace + '-handle"></div>');

            this.$innerBox.append(this.$on, this.$off);
            this.$inner.append(this.$innerBox);
            this.$wrap.append(this.$inner, this.$handle);

            // get components width
            var w = this.$on.width();
            var h = this.$handle.width();

            this.distance = w - h / 2;

            if (this.options.clickable === true) {
                this.$wrap.on('click.asSwitch touchstart.asSwitch', $.proxy(this.click, this));
            }

            if (this.options.dragable === true) {
                this.$handle.on('mousedown.asSwitch touchstart.asSwitch', $.proxy(this.mousedown, this));
                this.$handle.on('click.asSwitch', function() {
                    return false;
                });
            }

            this.set(this.checked, false);
            this.initialized = true;

            this._trigger('ready');

            if (this.disabled) {
                this.disable();
            }
        },
        _trigger: function(eventType) {
            var method_arguments = Array.prototype.slice.call(arguments, 1),
                data = [this].concat(method_arguments.concat);

            // event
            this.$element.trigger('asSwitch::' + eventType, data);

            // callback
            eventType = eventType.replace(/\b\w+\b/g, function(word) {
                return word.substring(0, 1).toUpperCase() + word.substring(1);
            });
            var onFunction = 'on' + eventType;
            if (typeof this.options[onFunction] === 'function') {
                this.options[onFunction].apply(this, method_arguments);
            }
        },
        animate: function(pos, callback) {
            // prevent animate when first load
            if (this.initialized === false) {
                this.$innerBox.css({
                    marginLeft: pos
                });

                this.$handle.css({
                    left: this.distance + pos
                });

                if (typeof callback === 'function') {
                    callback();
                }
                return false;
            }

            this.$innerBox.stop().animate({
                marginLeft: pos
            }, {
                duration: this.options.animation,
                complete: callback
            });

            this.$handle.stop().animate({
                left: this.distance + pos
            }, {
                duration: this.options.animation
            });
        },
        getDragPos: function(e) {
            return e.pageX || ((e.originalEvent.changedTouches) ? e.originalEvent.changedTouches[0].pageX : 0);
        },
        move: function(pos) {
            pos = Math.max(-this.distance, Math.min(pos, 0));

            this.$innerBox.css({
                marginLeft: pos
            });

            this.$handle.css({
                left: this.distance + pos
            });
        },
        click: function() {
            if (!this._click) {
                this._click = true;
                return false;
            }

            if (this.disabled) {
                return;
            }

            if (this.checked) {
                this.set(false);
            } else {
                this.set(true);
            }

            return false;
        },
        mousedown: function(e) {
            var dragDistance,
                self = this,
                startX = this.getDragPos(e);

            if (this.disabled) {
                return;
            }

            this.mousemove = function(e) {
                var current = this.getDragPos(e);
                if (this.checked) {
                    dragDistance = current - startX > 0 ? 0 : (current - startX < -this.distance ? -this.distance : current - startX);
                } else {
                    dragDistance = current - startX < 0 ? -this.distance : (current - startX > this.distance ? 0 : -this.distance + current - startX);
                }

                this.move(dragDistance);
                this.$handle.off('mouseup.asSwitch');
                return false;
            };
            this.mouseup = function() {
                var currPos = parseInt(this.$innerBox.css('margin-left'), 10);
                if (Math.abs(currPos) >= this.distance / 2) {
                    this.set(false);
                }
                if (Math.abs(currPos) < this.distance / 2) {
                    this.set(true);
                }

                $(document).off('.asSwitch');
                this.$handle.off('mouseup.asSwitch');
                return false;
            };

            $(document).on({
                'mousemove.asSwitch': $.proxy(this.mousemove, this),
                'mouseup.asSwitch': $.proxy(this.mouseup, this),
                'touchmove.asSwitch': $.proxy(this.mousemove, this),
                'touchend.asSwitch': $.proxy(this.mouseup, this)
            });

            if (this.options.clickable) {
                this.$handle.one('mouseup.asSwitch touchend.asSwitch', function() {
                    if (self.checked) {
                        self.set(false);
                    } else {
                        self.set(true);
                    }
                    $(document).off('.asSwitch');
                });
            }

            return false;
        },
        check: function() {
            if (this.checked !== true) {
                this.set(true);
            }

            return this;
        },
        uncheck: function() {
            if (this.checked !== false) {
                this.set(false);
            }

            return this;
        },
        set: function(value, update) {
            var self = this;

            this.checked = value;

            if (value === true) {
                this.animate(0, function() {
                    self.$wrap.removeClass(self.classes.off).addClass(self.classes.on);
                });
            } else {
                this.animate(-this.distance, function() {
                    self.$wrap.removeClass(self.classes.on).addClass(self.classes.off);
                });
            }

            if (update !== false) {
                this.$element.prop('checked', value);
                this.$element.trigger('change');
                this._trigger('change', value, this.options.name, 'asSwitch');
            }

            return this;
        },
        get: function() {
            return this.$element.prop('checked');
        },
        val: function(value) {
            if (value) {
                this.set(value);
            } else {
                return this.get();
            }
        },
        enable: function() {
            this.disabled = false;
            this.$element.prop('disabled', false);
            this.$wrap.removeClass(this.classes.disabled);
            return this;
        },
        disable: function() {
            this.disabled = true;
            this.$element.prop('disabled', true);
            this.$wrap.addClass(this.classes.disabled);
            return this;
        },
        destroy: function() {
            this.$wrap.off('.asSwitch');
            this.$handle.off('.asSwitch');
        }
    };

    AsSwitcher.defaults = {
        namespace: 'asSwitch',
        skin: null,

        dragable: true,
        clickable: true,
        disabled: false,

        onText: 'ON',
        offText: 'OFF',

        checked: true,
        animation: 200
    };

    $.fn.asSwitch = function(options) {
        if (typeof options === 'string') {
            var method = options;
            var method_arguments = Array.prototype.slice.call(arguments, 1);

            if (/^\_/.test(method)) {
                return false;
            } else if ((/^(get)$/.test(method)) || (method === 'val' && method_arguments.length === 0)) {
                var api = this.first().data('asSwitch');
                if (api && typeof api[method] === 'function') {
                    return api[method].apply(api, method_arguments);
                }
            } else {
                return this.each(function() {
                    var api = $.data(this, 'asSwitch');
                    if (api && typeof api[method] === 'function') {
                        api[method].apply(api, method_arguments);
                    }
                });
            }
        } else {
            return this.each(function() {
                if (!$.data(this, 'asSwitch')) {
                    $.data(this, 'asSwitch', new AsSwitcher(this, options));
                }
            });
        }
    };
})(jQuery, document, window);
