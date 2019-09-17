const _ = require("lodash");
const assert = require('assert');
const expect = require('expect');

describe("Shooting Star : Schema Compose & Convert", function() {
    var apos;

    this.timeout(50000);

    after(function(done) {
        try {
            require("apostrophe/test-lib/util").destroy(apos,done);
        } catch (e) {
            console.warn("Old Apostrophe Version does not support destroy database. Use Destroy Database Directly");
            apos.db.dropDatabase();
            setTimeout(done,1000)
        }
    })

    it('should create an apos object', function(done) {
        apos = require("apostrophe")({
            root : process.platform === "win32" && !process.env.TRAVIS ? module : undefined,
            baseUrl : "http://localhost:7000",
            testModule : true,
            modules : {
                'apostrophe-express' : {
                    port : 7000
                },
                'shooting-star' : {}
            },
            afterInit : function(callback){
                assert(apos.schemas);
                assert(apos.modules["shooting-star"]);
                return callback(null);
            },
            afterListen : function(err){
                assert(!err, "Unable to Initiate Apostrophe");
                done();
            }
        });
    });

    it('should have all the default options', function() {
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
        expect(apos.shootingStar.star).toMatchObject({
            tooltip : originalTooltip,
            total : 5,
            size : "",
            highlightColor : "#FFD700",
            hoverColor : "#FFED85",
            color : "#ddd"
        })
    });

    it('should submit empty schema without error', function(done) {
        var req = apos.tasks.getReq();
        var schema = apos.schemas.compose({
            addFields : [
                {
                    name : "myStar",
                    label : "Rate Your Picture",
                    type : "shooting-star"
                }
            ]
        });

        var output = {}

        apos.schemas.convert(req, schema, 'form', {}, output, function(err){
            assert(!err)
            expect(output).toMatchObject({});
            done();
        })
    });

    it('should submit both value and return both value', function(done) {
        var req = apos.tasks.getReq();

        var schema = apos.schemas.compose({
            addFields : [
                {
                    name : "myStar",
                    label : "Rate Your Picture",
                    type : "shooting-star"
                }
            ]
        });

        var output = {}

        apos.schemas.convert(req, schema, 'form', {
            myStar : { 
                priority : "low",
                value : 1
            }
        }, output , function(err) {
            assert(!err)
            expect(output).toMatchObject({
                myStar: {
                    priority: "low",
                    value: 1
                }
            });
            expect(Object.keys(output.myStar).length).toBe(2);
            done();
        });
    });

    it('should return error if the field is required', function(done) {
        var req = apos.tasks.getReq();

        var schema = apos.schemas.compose({
            addFields : [
                {
                    name : 'myStar',
                    label : "Rate Your Picture",
                    type : "shooting-star",
                    required : true
                }
            ]
        });

        var output = {};

        apos.schemas.convert(req, schema, 'form', {}, output, function(err){
            assert(err);
            expect(output).toMatchObject({});
            done();
        });
    });

    it('should submit the value with field required', function(done) {
        var req = apos.tasks.getReq();

        var schema = apos.schemas.compose({
            addFields : [
                {
                    name : "myStar",
                    label : "Rate Your Picture",
                    type : "shooting-star"
                }
            ]
        });

        var output = {};

        apos.schemas.convert(req, schema, 'form', {
            myStar : {
                priority : "high",
                value : 5
            }
        }, output, function(err) {
            assert(!err);
            expect(output.myStar).toMatchObject({
                priority : "high",
                value : 5
            });
            expect(Object.keys(output.myStar).length).toBe(2);
            done();
        })
    })
})