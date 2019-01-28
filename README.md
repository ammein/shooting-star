# Shooting-Star ApostropheCMS Schema :star2: :star2: :star2: :star: :star:
An ApostropheCMS Custom Schema for your own shooting star (Rating) field. 

![Shooting Star Example](https://media.giphy.com/media/3osDlgXJgpDjwqX2uh/giphy.gif)

# Install
From within your apostrophe project `npm install --save shooting-star`

Include in app.js:
```javascript
// In app.js
  modules: {
    'shooting-star': {},
    // ... other modules
}
```


# Enable Code Editor Schema
Simple :
```javascript
addFields : [
    {
        type : 'shooting-star',
        name : 'rating',
        label : 'Rate Your Picture'
    }
]
```

### Widget.html Get `shooting-star` Value
This shooting-star schema returns an object. 
```javascript
{
    priority : '<low|medium|high>',
    value : '<float value>'
}
```

> Priority is a string value either `low` , `medium` or `high`. You can use this value to group your elements later. Thank me later :wink:

If you did an example above , in `widget.html` you can simply get an object like this :

```twig
{{ data.widget.rating.priority }}
{{ data.widget.rating.value }}
```

or you can simply use `apos.log()` to see what's available on `shooting-star` objects :

```twig
{{ apos.log(data.widget.rating) }}
```

# Shooting Star Options Available

```javascript
// in lib/modules/shooting-star/index.js
module.exports = {
    star : {
        size : "<Number or String>", // Star Size - Default : 30px
        color : "<String>", // Star Base Color - Default : #ddd
        highlightColor : "<String>", // Star Color when Click - Default : #FFD700
        hoverColor : "<String>" // Star Color when Hover - Default : #FFED85
        total : "<Number>" // Total Number Of Stars - Default : 5
    }
}
```

# How to Override/Change Existing Rate Tooltip ?
Easy , make sure the name of the rate is similar to default rate. Here is the default rate & tooltip(Mouse Hover Tooltip) :

```javascript
module.exports = {
    star : {
        tooltip : [
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
        ]
    }
}
```
> Once Hover your mouse on stars , you will see the tooltip :smile:

### What is '$' sign available in tooltip.value ?
That is my friend , is a value of star replace with that dollar sign . When ever you hover on each stars available , the number will be shown on that tooltip. If not, it will not show the number when hover. :wink:


# Specific Field Customization
What if I want to customize differently on each fields ? I don't want every styles apply TO ALL. How can I make different number of stars on each field ? Well , I figured you might say that. Here's the override technique . Let say you want your second field to have `10` stars available instead of default `5` :

```javascript
addFields : [
    // Output default options
    {
        type : 'shooting-star',
        name : 'firstStar',
        label : "Rate your first star"
    },
    // Output additional options and merge with default
    {
        type : 'shooting-star',
        name : 'secondStar',
        label : "Rate your second customized star",
        star : {
            total : 10,
            size : "50px"
        }
    }
]
```

> Your `secondStar` will produce 10 stars and 50px size of that star instead of 5 stars and 30px size. Awesome right ? No need to scratch your head :laughing:

# How To Insert My Stylesheets/Scripts Files ?
I provide a simple object for you. Behold !

### Stylesheets inside `public/css/<all css files>`
```javascript
ace : {
    // All ace options
},
stylesheets : {
    files : [
        {
            name : 'parentFolder/style', // This will get style.css inside parentFolder
            when : 'user'
        }
    ],
    acceptFiles : ["css" , "sass" , "less" , "min.css"] // List of all accept files (Less , CSS and SASS are push by default)
}
```

> Default `acceptFiles` : `css` , `sass` and `less`

### Scripts inside `public/js/<all js files>`
How about javascripts files ? Same as above example :

```javascript
ace : {
    // All ace options
},
scripts : {
    files : [
        {
            name : 'parentFolder/myScript', // This will get myScript.js inside parentFolder
            when : 'user'
        }
    ],
    acceptFiles : ["js" , "min.js"] // List of all accept files (js and min.js are push by default)
}
```

> Default `acceptFiles` : `js` and `min.js`.

### Error on pushing file assets
If you receive an error while pushing files assets to browser , please make sure your directory is in correct path without extension name and accept any files extension name by your own modified extension names. For example

```javascript
ace : {
    // All ace options
},
scripts : {
    files : [
        {
            // If got subfolder inside parentFolder
            // Include it too
            name : 'parentFolder/subFolder/index', 
            when : 'user'
        },
        {
            // Or you can manually get custom.js inside parentFolder for specific js file
            name : 'parentFolder/custom',
            when : 'user'
        },
        {
            name : 'index', // get index.js
            when : 'user'
        }
    ]
    acceptFiles : ["con.min.js"] // and other prefix extension file names available
}
```

> NOTE : You don't have to include `'js/filedirectory'` or `'css/filedirectory'` in it. APOSTROPHECMS will push based on `self.pushAsset()` that you may found in [ApostropheCMS Push Asset Documentation](https://apostrophecms.org/docs/tutorials/getting-started/pushing-assets.html#configuring-stylesheets). Easy right ?

# Browser

### Browser Object
How can I get this schema browser object for my `shooting-star` ?

Simply you can find it on :

```javascript
apos.shootingStar
```

### Get Star Browser Options
You can get it via browser scripting
```javascript
apos.shootingStar.star
```

### Get Multiple Star Browser Options in Single Schema
Oops ! How can I get specific Star browser options object if I have two fields in a same schema ? I made a simple for you , let say you have this fields :

```javascript
addFields : [
    {
        type : 'shooting-star',
        name : 'firstStar',
        label : 'Rate Your First Picture'
    },
    {
        type : 'shooting-star',
        name : 'secondStar',
        label : 'Rate Your Second Picture'
    }
]
```

Next, simply get the `name` property to get specific schema in browser object : 
```javascript
// First Editor
apos.shootingStar.firstStar.star

// Second Editor
apos.shootingStar.secondStar.star
```

> Easy right ? Hell yeah it is ! :laughing: