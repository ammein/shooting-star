const _ = require("lodash");
module.exports = function (self, options) {
    self.addFieldRatingType = function () {
        self.apos.schemas.addFieldType({
            name: self.name,
            partial: self.fieldTypePartial,
            converters: {
                rating: function (req, data, name, object, field, callback) {

                    if (!data[name]) {
                        if (field.required) {
                            return callback('required');
                        }
                        object[name] = null;
                        return setImmediate(callback);
                    }

                    // Filter To make sure that the name is correct match to field name. Just to be sure ;) - Amin
                    if(name === field.name){
                        object[name] = {
                            priority: self.apos.launder.string(data[name].priority),
                            value: self.apos.launder.float(data[name].value, 0, (field.name === name && _.has(field, "star.total")) ? field.star.total - field.star.total : self.star.total - self.star.total, (field.name === name && _.has(field, "star.total")) ? field.star.total : self.star.total)
                        };
                    }
                    
                    return setImmediate(callback);
                },
                form: 'rating'
            }
        });
    };

    self.fieldTypePartial = function (data) {
        return self.partial('rating', data);
    };
}