# What is SwiftMo-Artisan?
SwiftMo-Artisan is a PWA for people selling artisan product that I am releasing
under [GNU General Public License 3 (GPL-3.0)](https://opensource.org/licenses/GPL-3.0)

See an example of the app here: [JewelKat](https://jewelkat.studio)

## Setting up SwiftMo-Artisan

1. Clone this repo on your server:

**Typically:**

```
mkdir yourAppName
cd yourAppName
git clone https://github.com/festinalente/ArtisanPWA.git
git submodule init
git submodule update
npm install
```  
*Note, if setting up a staging environment with your projects actual content,
link or copy 'static/images/', 'static/video/', and '.env' with your DB
credentials*

2. Go to [Mongo Atlas](https://cloud.mongodb.com/), sign up, set up a database for
 your app with a single empty collection called **entity**. Here you will need
 to get your password, username and URL for use further down setting these for
 use. Edit the mongoDBUrl url bellow with your server address where it says
 **server_address**, leave no spaces.

3. Go to [Stripe] https:stripe.com and set up an account, obtain your Stripe tokens.

4. Generate a salt key and iv hashes. E.g. on Linux open your terminal and type
the following command:

`openssl enc -aes-256-cbc -k MySuperSecretPassPhrase -P -md sha1`

5. Generate a session secret via open SSH (or make one up):

`openssl rand -base64 32`

6. In the route directory of your app **yourAppName** create a file called .env
  and fill out the following information you obtained in the previous steps:
```
mongopass=your_mongoDB_pass.
dbusername=your_db_username
sessionSecret=<a_hash>
mongoDBUrl=<`mongodb+srv://${dbusername}:${mongopass}@server_address/${dbname}?retryWrites=true&w=majority`>.
salt=your_salt
key=your_key
iv=your_iv
dbname=<Name_of_the_DB_you_want_the_app_to_use>
user=<Webapp_user_name>
password=<Create_a_unique_password>
email=<!to_be_implemented>
emailpass=<!to_be_implemented>
host=<!to_be_implemented>
stripeTokenPublic=<pk_test_...>
stripeTokenSecret=<sk_test_...>
baseURL=http://localhost:8080/
imageOutFormat=webp
PORT=Whichever_port_you_want_the server_to_listen_on.
```
7. Setting up Grunt to integrate your environmental variables into the front-end JavaScript where needed (stripeTokenPublic specifically), on your server:
```
sudo npm install -g grunt-cli
sudo npm install grunt
grunt insertEnvVar
```
This will compile the JavaScript destined for the frontend with your environmental variables in .env.
7. *Fire it up* In your terminal write `node startapp.js`
8. In your web browser navigate to either http://localhost:8080/app-set-up or
https://yourURL.com/app-set-up and fill out the app user name and password, save
these.
9. Log into your app at http://localhost:8080/backend or https://yourURL.com/backend
  and fill out your entity details.
10. Once the entity details are filled out at and **about** post to your blog
(the blog interface is currently a bit clunky but ensures clean data is saved).
11. Add whatever content you want to sell and support materials (blog, video).

# Personalizing the app

## Appearance and templates
General appearance can be changed by adding custom icons for the shopping cart,
business name, fonts, colors, shadows. I don't recommend altering layouts as this
might likely break the folder containing the pages, the folder system allows
for pages to be deeply nested and may easily include thousands of pages:

Pages, layout and logic can be altered in the `routers/main.js` specifically
the `testNewFolder(res, focusPageAddress, item, path)` function which maps out the
layout and indexes each page resulting in the following HTML:

```
<div class="pages itemGroup" id="deck">
 <div class="page focus 0" data-address="0" data-name="start"> </div>
 <div class="page reduce 1|0" data-address="1|0" data-name="themes"> </div>
 <div class="page reduce 1|1|0" data-address="1|1|0" data-name="Queen Anne's Lace"> </div>
 ...and so on
</div>
```

**The above HTML is rendered via an object**
```
let shop = [ {page: 'start', view: 'shopbase', data: frontPage, display: 'focus'},
             [ {page: 'themes', view: 'themes', data: themes[0].theme, display: 'reduce'},
               []
             ]
           ];
```

**In pseudo code:**
```
[ {data-address: 0},
  [ {data-address: 1|0},
    [ {data-address: 1|1|0}]
  ]
]
```

**each page is represented by an object:**
`{page: 'start', view: 'shopbase', data: frontPage, display: 'focus'}`

**Where**
* page = page name
* view = view to be rendered for each page
* data = data to be added to the rendered view
* display = whether the page is to be displayed or not.

**A page can followed be it's "child" pages in an array**
`[{page}, ['child pages']]`

The data attribute "address" is a unique identifier for each page which also maps
to it's location in the tree:

0 (parent) -> 1|0 (first child) -> 1|1|0 (first child of child)
0 (parent) -> 2|0 (second child) -> 2|1|0 (first child of second child)

## Styles
Front end styles are included in a separate repo of SCSS. These need to be altered
to suit your project and then compiled:

 `npm run scss`

or using

`./developmentStartUp.sh`.

Once Grunt is listening for changes, it will update these changes as they are made.

If you just want to compile the current scss to css:

`npm run scssCompile`

followed by

`grunt minifyCSS`

It's recommended you clone the repo [https://github.com/festinalente/ArtisanPWAstyles](ArtisanPWAstyles)
and have git track your new clone (see .gitmodules in the root of this project)

## Extending templates:

**Example, adding a color**
Add an entry to your database. For example if I wanted to add "color" to
"entity" to use in some way, I would add `entity.color: 'blue'` to the entity
document.

To then consume this information I would alter "backend/views/entity2.pug" to
consume this data with:

```
  -//provide some info to help end users enter the right information:

  +microdocs("Enter an App color").tabindex

  -//Fetch the current color if it exists:

  -let color = (entity && entity.color) ? entity.color :'enter your app color'

  -//Add a paragraph element that collects textual information (prompt, variable, default value):

  +paragraph('App color', color, 'color')
```
Some complex data types will require new templates to be built and custom storage
routes to handle these.

### TODO
Add auto sitemap and robots.txt auto generation, auto submit to index.
