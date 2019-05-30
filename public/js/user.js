apos.define('shooting-star', {
    afterConstruct: function (self) {
        self.addFieldRatingType();
    },
    construct: function (self, options) {

        self.star = options.star;

        self.name = self.__meta.name;;

        self.addFieldRatingType = function () {
            apos.schemas.addFieldType({
                name: 'shooting-star',
                populate: self.populate,
                convert: self.convert
            });
        };

        // To avoid using lodash _.has
        self.has = function (object, path) {
            var curObj = object;
            var pathArr = path.match(/([^\.\[\]]+)/g);
            for (var p in pathArr) {
                if (curObj === undefined || curObj === null) return curObj; // should probably test for object/array instead
                curObj = curObj[pathArr[p]];
            }
            return curObj;
        }

        self.css = function (fieldName, starOptions, size) {
            return `
                fieldset[data-rating] {
                    border: none;
                    float: left;
                }

                fieldset[data-rating] > input[name='rating-${fieldName.toLowerCase()}'] {
                    display: none;
                }

                fieldset[data-rating] > label:before {
                    margin: 5px;
                    font-family: FontAwesome;
                    display: inline-block;
                    content: "\\f005";
                }

                fieldset[data-rating] > .half:before {
                    content: "\\f089";
                    position: absolute;
                }

                fieldset[data-rating] > label.${fieldName.toLowerCase()} {
                    color: ${(starOptions.color) ? starOptions.color : "#ddd"};
                    float: right;
                    position: relative;
                }

                fieldset[data-rating] > input[name='rating-${fieldName.toLowerCase()}']:checked ~ label , 
                fieldset[data-rating] > input[name='rating-${fieldName.toLowerCase()}']:disabled:checked ~ label, /* show gold star when clicked */
                fieldset[data-rating]:not(:checked) > label.${fieldName.toLowerCase()}:hover, /* hover current star */
                fieldset[data-rating]:not(:checked) > label:hover ~ label.${fieldName.toLowerCase()}
                { 
                    color: ${(starOptions.highlightColor) ? starOptions.highlightColor : "#FFD700"};  
                    cursor: pointer;
                } /* hover previous stars in list */

                fieldset[data-rating] > input[name='rating-${fieldName.toLowerCase()}']:checked + label:hover , 
                fieldset[data-rating] > input[name='rating-${fieldName.toLowerCase()}']:disabled:checked + label:hover, /* hover current star when changing rating */
                fieldset[data-rating] > input[name='rating-${fieldName.toLowerCase()}']:checked ~ label:hover , 
                fieldset[data-rating] > input[name='rating-${fieldName.toLowerCase()}']:disabled:checked ~ label:hover,
                fieldset[data-rating] > label:hover ~ input[name='rating-${fieldName.toLowerCase()}']:checked ~ label,
                fieldset[data-rating] > label:hover ~ input[name='rating-${fieldName.toLowerCase()}']:disabled:checked ~ label /* lighten current selection */
                fieldset[data-rating] > input[name='rating-${fieldName.toLowerCase()}']:checked , 
                fieldset[data-rating] > input[name='rating-${fieldName.toLowerCase()}']:disabled:checked , 
                input[name='rating-${fieldName.toLowerCase()}']:checked ~ label:hover ~ label
                input[name='rating-${fieldName.toLowerCase()}']:disabled:checked ~ label:hover ~ label
                { 
                    color: ${(starOptions.hoverColor) ? starOptions.hoverColor : "#FFED85"};  
                    cursor : pointer;
                } 
                fieldset[data-rating] > label.${fieldName.toLowerCase()}:before {
                    font-size: ${(size) ? (typeof size === "number") ? size + "px" : size : "30px"};
                }
                `;
        }

        self.radioCache = function (allRadio) {
            if (allRadio) {
                if (self.cache) {
                    Array.prototype.slice.call(allRadio, 0).forEach(function (value, index) {
                        if (self.cache[index] === value) return;
                        self.cache.push(value);
                    });
                }
                self.cache = [];
                Array.prototype.slice.call(allRadio, 0).forEach(function (value, i) {
                    self.cache.push(value);
                });
            }
            return self.cache;
        }

        // Before Set Radio event method
        self.beforeSetRadio = function (getFieldset, object, name, $field, $el, field, status) {
            Array.prototype.slice.call(self.allRadio.apply(self, shiftArray(Array.prototype.slice.call(arguments), undefined))).forEach(function (value, i) {
                value.checked = false;
            })
            return;
        }

        // After Set Radio event method
        self.afterSetRadio = function (getFieldset, object, name, $field, $el, field, status) {
            // Make opacity half set on live draft
            if (status === "draft") {
                $($el.find("fieldset.rating-" + name).get(getFieldset)).css("opacity", 0.5);
            }
            return;
        }

        // Return all radio in array from fieldset
        self.allRadio = function (getFieldset, object, name, $field, $el, field, callback) {
            return $($el.find('fieldset.rating-' + name).get(typeof getFieldset === "number" ? getFieldset : null)).find("input[name='rating-" + name.toLowerCase() + "']");
        }

        // Shift Array and Unshift Array method
        var shiftArray = function (arr, item) {
            arr.shift();
            arr.unshift(item);
            return arr;
        }

        // Set Radio Method begins with parameter of select.
        // Select parameter will be only available if workflow enabled in apostrophe.
        self.setRadio = function (total, object, name, select) {
            // Renormalize arguments on the last argument to an array
            var args = Array.prototype.slice.call(arguments, arguments.length - 1).reduce((init, next) => init.concat(next), [undefined])

            // Apply to cache , useful if you wish to remove children in DOM and reset them back by using this cache
            self.radioCache(self.allRadio.apply(self, args));

            // Apply event on before setting radio. Useful for styling
            self.beforeSetRadio.apply(self, args);

            var totalRadio = self.allRadio.apply(self, args).length;

            // select tag onchange event begins if available
            if (select.length > 0) {
                select.get(0).onchange = function (e) {
                    var status = $('option:selected', this).attr('value');
                    var changeRadio = -1;
                    var argsX = args.pop() && (args.push(status), args);
                    self.beforeSetRadio.apply(self, argsX);
                    for (var i = 0; i <= total; i += 0.5)(function (i) {
                        var inc = i > self[name].star.total ? i - self[name].star.total : i;
                        if (object[name].value === inc) {
                            shiftArray(args, status === "draft" ? 1 : 0);
                            // Since the change event does synchronous. We can avoid using $el , instead use native document.querySelector
                            var arrays = Array.prototype.slice.call(document.querySelectorAll("fieldset.rating-" + name)).map((value, outIndex) => (outIndex === (status === "draft" ? 1 : 0)) ? Array.prototype.slice.call(value.querySelectorAll("input[name='rating-" + name.toLowerCase() + "']"), 0) : []).reduce((init, next) => init.concat(next), [])

                            // Apply it
                            arrays.reverse()
                                .forEach((value, i) => (i === changeRadio) ? value.checked = true : null)
                        }
                        changeRadio++;
                    })(i);
                    self.afterSetRadio.apply(self, argsX);
                }
            }

            // Set Radio initialize
            for (var i = 0; i <= total; i += 0.5) {
                var inc = i > self[name].star.total ? i - self[name].star.total : i;
                if (object[name].value === inc) {
                    $(self.allRadio.apply(self, args).get(totalRadio)).prop("checked", true);
                }
                totalRadio--;
            };

            // Apply event on after setting radio. Useful for styling
            self.afterSetRadio.apply(self, args);
            return;
        }

        // Begin display rating widget with options
        self.populate = function (object, name, $field, $el, field, callback) {
            var $fieldSet = apos.schemas.findFieldset($el, name);
            var $rating = $fieldSet.find("[data-rating]");

            // Get Specific Data
            if (self.has(field, "star")) {
                var star = field.star;
            } else {
                var star = self.star;
            }

            // Pass value to self based on field name
            self[name] = {
                star: field.star || self.star,
                object: object[name]
            }

            // Create stars
            var tooltipLength = (self.has(field, "star.tooltip")) ? field.star.tooltip.length : self.star.tooltip.length;
            var tooltip = (self.has(field, "star.tooltip")) ? field.star.tooltip : self.star.tooltip;
            var total = (self.has(field, "star.total")) ? field.star.total : self.star.total;
            var gap = total / tooltipLength;
            var id = tooltipLength - 1;
            var full = true;
            for (var i = total; i > 0; i -= 0.5)(function (i) {
                // Create Elements for Radio & Label
                var radio = $("<input type='radio' />")
                var label = $("<label />")

                // Make attributes & tied them
                radio.get(0).id = "star" + i;
                $(label.get(0)).attr("for", "star" + i)
                $(radio.get(0)).attr("name", "rating-" + name.toLowerCase());
                $(label.get(0)).addClass(name.toLowerCase());


                // Make radio button a value to get the value from
                $(radio.get(0)).attr("value", i)

                // Append them
                $(radio).appendTo($rating)
                $(label).appendTo($rating)

                // If the star value has its own minimum 3 rates
                if (tooltipLength >= 3) {
                    if (i <= total - gap) {
                        gap = total - gap;
                        $(label.get(0)).attr("title", (tooltip[id]) ? tooltip[id].value.replace("$", i) : tooltip[0].value.replace("$", i))
                        $(radio.get(0)).attr("data-rate", (tooltip[id]) ? tooltip[id].rate : tooltip[0].rate)
                        id--;
                    } else {
                        $(label.get(0)).attr("title", tooltip[id].value.replace("$", i))
                        $(radio.get(0)).attr("data-rate", tooltip[id].rate)
                    }
                }

                // Make class for `full` or half for hidden star behind the star ;)
                if (full) {
                    $(label.get(0)).addClass("full")
                    full = false;
                } else {
                    $(label.get(0)).addClass("half")
                    full = true;
                }
            })(i);

            // Find Total Fieldset to append stylesheets
            var totalFieldset = $el.find("fieldset.rating-" + name).length;

            // Get Size
            var size = (self.has(field, "star.size") && field.name === name) ? field.star.size : self.star.size;

            // Inject CSS
            for (var i = 0; i < totalFieldset; i++) {
                $($fieldSet.find("fieldset.rating-" + name).get(i)).prepend("<style type='text/css'>" + self.css(name, star, size) + "</style>");
            }

            // If this field got two in same modal , run click event
            if ($el.find("fieldset.rating-" + name).length > 1) {
                $($rating.find("label." + name.toLowerCase())).click(function () {
                    // Immitate color click to override css
                    $(this).parent().find("label." + name.toLowerCase()).css({
                        "color": star.color.toString()
                    });
                    $(this).css({
                        "color": star.highlightColor.toString()
                    });
                    $(this).nextAll().css({
                        "color": star.highlightColor.toString()
                    });
                    $(this).prev("input[name='rating-" + name.toLowerCase() + "']").prop("checked", true)
                    // Clean All Multiple Checked Attribute if click other radio button
                    $(this).nextAll().not($(this).prev("input[name='rating-" + name.toLowerCase() + "']")).removeAttr("checked");
                    // Clean All Multiple Checked Attribute if click other radio button
                    $(this).prevAll().not($(this).prev("input[name='rating-" + name.toLowerCase() + "']")).removeAttr("checked");

                    // Prevent Bubbling to other radio button.
                    return false;
                });
            }

            // Highlight star if exists
            if (object[name]) {
                var totalFieldset = $el.find("fieldset.rating-" + name).length;
                total = totalFieldset > 1 ? total * totalFieldset : total;
                // If EDGE browser detected , running setTimeout. Seems like Edge Browser has its own delay when 
                // apostrophecms trigger reload to open manageModal view. - Amin
                if (!( /*@cc_on!@*/ false || !!document.documentMode) && !!window.StyleMedia) {
                    setTimeout(() => {
                        for (var i = 0; i <= totalFieldset; i++)(function (i) {
                            self.setRadio.call(self, total, object, name, $fieldSet.find('[data-apos-workflow-field-state-control]'), Array.prototype.slice.call(arguments))
                        })(i)
                    }, 1000);
                } else {
                    for (var i = 0; i <= totalFieldset; i++) {
                        self.setRadio.call(self, total, object, name, $fieldSet.find('[data-apos-workflow-field-state-control]'), Array.prototype.slice.call(arguments))
                    }
                }
            }

            $fieldSet.data("star", $rating);

            return setImmediate(callback);
        }

        // On Submit to Server convert , reject if unacceptable
        self.convert = function (object, name, $field, $el, field, callback) {
            var $fieldset = apos.schemas.findFieldset($el, name);

            var $rating = $fieldset.data("star");

            object[name] = {
                priority: $rating.find("input[name='rating-" + name.toLowerCase() + "']:checked").attr("data-rate"),
                value: parseFloat($rating.find("input[name='rating-" + name.toLowerCase() + "']:checked").val())
            }
            if (field.required && (!object[name])) {
                return setImmediate(_.partial(callback, 'required'));
            }
            return setImmediate(callback);
        }

        apos.shootingStar = self;
    }
})