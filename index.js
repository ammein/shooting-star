const path = require("path");
const _ = require("lodash");
const fs = require("fs");
module.exports = {
    name : 'shooting-star',
    alias : 'shootingStar',
    beforeConstruct : function(self,options){
        options.star = _.defaults(options.star , {
            total : 5,
            size: "",
            highlightColor: "#FFD700",
            hoverColor: "#FFED85",
            color: "#ddd",
            tooltip : []
        })

        options.stylesheets = _.defaults(options.stylesheets , {
            files : [],
            acceptFiles : []
        })

        options.scripts = _.defaults(options.scripts , {
            files : [],
            acceptFiles : []
        })

        var originalTooltip = [
            {
                rate: "low",
                value: "Low - $ Star"
            }, {
                rate: "medium",
                value: "Medium - $ Star"
            }, {
                rate: "high",
                value: "High - $ Star"
            }
        ];

        var userTooltip = options.star.tooltip;

        options.star.tooltip = _.values(_.merge(_.keyBy(originalTooltip , "rate"), _.keyBy(userTooltip , "rate")));

        options.pathLib = __dirname + "/lib";

        // stylesheets
        options.stylesheets.files = [
            {
                name : "star",
                when : 'user'
            }
        ].concat(options.stylesheets.files || []);

        options.scripts.files = [
            {
                name : 'user',
                when : 'user'
            }
        ].concat(options.scripts.files || []);

        options.stylesheets.acceptFiles = [
            "css" , 
            "min.css" , 
            "less"]
            .concat(options.stylesheets.acceptFiles || []);

        options.scripts.acceptFiles = [
            "js" , 
            "min.js"]
            .concat(options.scripts.acceptFiles || []);
    },
    afterConstruct : function(self){
        self.addFieldRatingType();
        self.pushAssets();
        self.pushCreateSingleton();
    },
    construct: function(self, options) {
        self.pathLib = options.pathLib;
        self.name = options.name;
        self.star = options.star;
        // Read Lib files
        fs.readdirSync(self.pathLib).filter((file)=>{
            require(path.resolve(self.pathLib , file))(self,options);
        })
    }        
};