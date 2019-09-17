const _ = require("lodash");
const assert = require('assert');
const expect = require('expect');

describe("Shooting Star : Override Star", function () {
    var apos;
    var overrideStar = {
        star: 10,
        highlightColor: "#e1e1e1",
        color: "#000000",
    }

    this.timeout(50000);

    after(function (done) {
        try {
            require("apostrophe/test-lib/util").destroy(apos, done);
        } catch (e) {
            console.warn("Old Apostrophe Version does not support destroy database. Use Destroy Database Directly");
            apos.db.dropDatabase();
            setTimeout(done, 1000)
        }
    })

    it('should create an apos object', function (done) {
        apos = require("apostrophe")({
            root: process.platform === "win32" && !process.env.TRAVIS ? module : undefined,
            baseUrl: "http://localhost:7000",
            testModule: true,
            modules: {
                'apostrophe-express': {
                    port: 7000
                },
                'shooting-star': {
                    star: overrideStar
                }
            },
            afterInit: function (callback) {
                assert(apos.schemas);
                assert(apos.modules["shooting-star"]);
                return callback(null);
            },
            afterListen: function (err) {
                assert(!err, "Unable to Initiate Apostrophe");
                done();
            }
        });
    });

    it('should get all the override options', function(){
        var clone = {};
        var override = _.cloneDeep(_.assign(clone, apos.shootingStar.star , overrideStar));
        override.tooltip = apos.shootingStar.star.tooltip;
        expect(apos.shootingStar.star).toMatchObject(override);
    })
});