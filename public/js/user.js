apos.define('shooting-star',{
    afterConstruct : function(self){
        self.addFieldRatingType();
    },
    construct:function(self,options){

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

        self.css = function(fieldName , starOptions , size){
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

                fieldset[data-rating] > input[name='rating-${fieldName.toLowerCase()}']:checked ~ label, /* show gold star when clicked */
                fieldset[data-rating]:not(:checked) > label.${fieldName.toLowerCase()}:hover, /* hover current star */
                fieldset[data-rating]:not(:checked) > label:hover ~ label.${fieldName.toLowerCase()}
                { 
                    color: ${(starOptions.highlightColor) ? starOptions.highlightColor : "#FFD700"};  
                    cursor: pointer;
                } /* hover previous stars in list */

                fieldset[data-rating] > input[name='rating-${fieldName.toLowerCase()}']:checked + label:hover, /* hover current star when changing rating */
                fieldset[data-rating] > input[name='rating-${fieldName.toLowerCase()}']:checked ~ label:hover,
                fieldset[data-rating] > label:hover ~ input[name='rating-${fieldName.toLowerCase()}']:checked ~ label, /* lighten current selection */
                fieldset[data-rating] > input[name='rating-${fieldName.toLowerCase()}']:checked ~ label:hover ~ label
                { 
                    color: ${(starOptions.hoverColor) ? starOptions.hoverColor : "#FFED85"};  
                    cursor : pointer;
                } 
                fieldset[data-rating] > label.${fieldName.toLowerCase()}:before {
                    font-size: ${(size) ? size : "30px"};
                }
                `;
        }

        // Begin display rating widget with options
        self.populate = function (object, name, $field, $el, field, callback) {
            var $fieldSet = apos.schemas.findFieldset($el , name);
            var $rating = $fieldSet.find("[data-rating]");

            // Get Specific Data
            if(self.has(field , "star")){
                var star = field.star;
                self[name] = {
                    star: field.star
                }
            }else{
                var star = self.star;
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
                $(label.get(0)).attr("for" , "star" + i)
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
                    }else{
                        $(label.get(0)).attr("title", tooltip[id].value.replace("$", i))
                        $(radio.get(0)).attr("data-rate", tooltip[id].rate)
                    }
                }

                // Make class for `full` or half for hidden star behind the star ;)
                if(full){
                    $(label.get(0)).addClass("full")
                    full = false;
                }else{
                    $(label.get(0)).addClass("half")
                    full = true;
                }
            })(i);

            // Find Total Fieldset to append stylesheets
            var totalFieldset = $el.find("fieldset.rating").length;

            // Get Size
            var size = (self.has(field, "star.size") && field.name === name) ? field.star.size : self.star.size;

            for (var i = 0; i < totalFieldset; i++) {
                $($fieldSet.find("fieldset.rating").get(i)).prepend("<style type='text/css'>" + self.css(name, star, size) + "</style>");
            }

            // Inject CSS for schema control more than 1 or just 1
            if($el.find("fieldset.rating").length > 1){
                $($el.find("label." + name.toLowerCase())).click(function () {
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
                    $(this).prev("input[name='rating-"+name.toLowerCase()+"']").attr("checked", "");
                    // Clean All Multiple Checked Attribute if click other radio button
                    $(this).nextAll().not($(this).prev("input[name='rating-"+name.toLowerCase()+"']")).removeAttr("checked");
                    // Clean All Multiple Checked Attribute if click other radio button
                    $(this).prevAll().not($(this).prev("input[name='rating-"+name.toLowerCase()+"']")).removeAttr("checked");

                    // Prevent Bubbling to other radio button.
                    return false;
                });
            }

            // Highlight star if exists
            if(object[name]){
                var totalFieldset = $el.find("fieldset.rating").length;
                var allRadio = $rating.find("input[name='rating-" + name.toLowerCase() + "']");
                var totalRadio = allRadio.length;
                for (var i = 0; i <= total; i += 0.5)(function (i) {
                    if (object[name].value === i) {
                        // jQuery made a fallback for Edge Browser. Therefore , use old school `.checked` on it
                        if (!(/*@cc_on!@*/ false || !!document.documentMode) && !!window.StyleMedia) {
                            $(allRadio.get(totalRadio)).checked = true;
                        }else{
                            $(allRadio.get(totalRadio)).attr("checked", "");
                        }
                    }
                    totalRadio--;
                })(i);
            }

            $fieldSet.data("star" , $rating);

            return setImmediate(callback);
        }

        // On Submit to Server convert , reject if unacceptable
        self.convert = function (object, name, $field, $el, field, callback) {
            var $fieldset = apos.schemas.findFieldset($el, name);

            var $rating = $fieldset.data("star");
            // If schema in a single UI got two same fields
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