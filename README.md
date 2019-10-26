# SearchAutoComplete

![alt text](demo.PNG "Demo")

A small example page of an autocomplete search function that will suggest searches based on what the user types.
Done in plain HTML and JavaScript.

Uses a simple node server to server the content.

This feature will query the API on the first key event in the input and store all the results for subsequent
letters that will be typed.
 
This way we dont need to be making network calls on every keypress and mobile data users will have a smoother and cheaper
experience using the site.  


###### Run
1. In command line, `node server.js`
2. goto `http://localhost:8000`

###### Test
`http://localhost:8000/spec/test-runner.spec.html`
