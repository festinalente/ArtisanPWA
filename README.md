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
git clone https://github.com/festinalente/SwiftMo-Artisan.git
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
7. *Fire it up!* In your terminal write `node startapp.js`
8. In your web browser navigate to either http://localhost:8080/app-set-up or
https://yourURL.com/app-set-up and fill out the app user name and password, save
these.
9. Log into your app at http://localhost:8080/backend or https://yourURL.com/backend
  and fill out your entity details.
10. Once the entity details are filled out at and **about** post to your blog
(the blog interface is currently a bit clunky but ensures clean data is saved).
11. Add whatever content you want to sell and support materials (blog, video).

## Appearance and templating
General appearance can be changed by adding custom icons for the shopping cart,
business name, fonts, colors, shadows. I don't recommend altering layouts as this
might likely break the folder containing the pages, the folder system allows
for pages to be deeply nested and may easily include thousands of pages:

```
<div class="pages itemGroup" id="deck">
 <div class="page focus 0" data-address="0" data-name="start"> </div>
 <div class="page reduce 1|0" data-address="1|0" data-name="themes"> </div>
 <div class="page reduce 1|1|0" data-address="1|1|0" data-name="Queen Anne's Lace"> </div>
</div>
```
By default, the rendered front-end CSS isn't included, to get the CSS you will need
to add your own changes and compile the SCSS into CSS using the `npm run scss`
command, or using `./developmentStartUp.sh`. Once Grunt is
listening for changes, it will update these changes as they are made.

## Pages and shop layout
Pages, layout and logic can be altered in the `routers/main.js` specifically
the `testNewFolder(res, focusPageAddress, item, path)` function which maps out the
layout and indexes each page.

### TODO
Add auto sitemap and robots.txt generation.
