# Setting up automatic product indexing

1.) Follow these instructions carefully to obtain a private API key:

[Google Indexing API](https://developers.google.com/search/apis/indexing-api/v3/prereqs#node.js)

2.) Then add to your .env

`indexingApiKey=<path_to_your_API_key_which_should_be_a_dot_file_in_the_root_of_your_project`

**Be careful not to commit this file up stream somewhere, add it to .gitignore**

3.) NPM install the the "autoGoogleIndex" package in swiftmo_modules
