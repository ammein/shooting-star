const _ = require("lodash");
module.exports = function (self, options) {
    self.addFieldRatingType = function () {
        self.apos.schemas.addFieldType({
            name: self.name,
            partial: self.fieldTypePartial,
            converters: {
                form: function (req, data, name, object, field, callback) {

                    if (!data[name]) {
                        if (field.required) {
                            return callback('required');
                        }
                        object[name] = null;
                        return setImmediate(callback);
                    }

                    object[name] = {
                        priority: self.apos.launder.string(data[name].priority),
                        value: self.apos.launder.float(data[name].value, 0, (field.name === name && _.has(field, "star.total")) ? field.star.total - field.star.total : self.star.total - self.star.total, (field.name === name && _.has(field, "star.total")) ? field.star.total : self.star.total)
                    };

                    return setImmediate(callback);
                }
            }
        });
    };

    self.fieldTypePartial = function (data) {
        return self.partial('rating', data);
    };
}