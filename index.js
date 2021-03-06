const choiceParalysis = 10;
let APIJson;
const APIurl = "https://api.earlytestabc.plugify.nl/autocomplete.json";
const inputId = "searchInput";

const cityAttributes = [
    "name",
    "province"
];
const artistAttributes = [
    "main_category",
    "name"
];

let currentFocus;

/***
 * A set up that will instantiate event listeners for the input field
 */
function init() {
    document.getElementById(inputId).addEventListener("input", startAutoComplete);
    /*execute a function presses a key on the keyboard:*/
    document.getElementById(inputId).addEventListener("keydown", function(e) {
        let keyDownEvent = event || window.event,
            keyCode = (keyDownEvent.which) ? keyDownEvent.which : keyDownEvent.keyCode;
        let x = document.getElementById("autocomplete-list");
        if (x) x = x.getElementsByTagName("div");
        switch (keyCode) {
            case 40:
                //If DOWN is pressed, increase the currentFocus variable and make it visible
                currentFocus++;
                addActive(x);
                break;
            case 38:
                //If UP is pressed, decrease the currentFocus variable and make it more visible
                currentFocus--;
                addActive(x);
                break;
            case 13:
                /*If the ENTER key is pressed, prevent the form from being submitted,*/
                e.preventDefault();
                if (currentFocus > -1) {
                    /*and simulate a click on the "active" item:*/
                    if (x) x[currentFocus].click();
                }
                break;
        }
    });
}

/***
 * Handler for an input to the input field
 */
function startAutoComplete() {
    begin(this.value.toLowerCase());
}

/***
 * The beginning of the search. This was separated from the input handler so we can test the main functionality.
 * @param searchQuery - The new value inside the input field
 */
function begin(searchQuery) {
    //If its empty clear the json
    //This saves on network calls, increases speed of search and decreases network costs for mobile users.
    if(searchQuery === "") {
        APIJson = undefined;
        closeAllLists();
        return;
    }

    currentFocus = -1;

    if(APIJson === undefined) {
        //Get json from API
        getJsonFromAPI(searchQuery, function () {
            handleSearch(searchQuery);
        });
    }
    else{
        //  Use the json we already have
        handleSearch(searchQuery);
    }
}

/***
 * Once we have the json, this method will handle finding the results and displaying them
 * @param searchQuery - The search query the user entered into the input field
 */
function handleSearch(searchQuery) {
    let searchResults = searchJson(searchQuery);
    handleAutocomplete(searchResults);
}

/***
 * Finds objects that could be related to what the user is looking for
 * @param searchQuery - The search query the user entered into the input field
 * @returns {Array} - An array of objects that will be displayed as autocomplete results
 */
function searchJson(searchQuery) {
    let searchResults = [];

    //First found first displayed
    APIJson["results"].forEach((resultJsonInstance) => {
        if (searchResults.length < choiceParalysis) {
            switch(resultJsonInstance["_type"]) {
                case "city":
                    handleFindingResults(searchResults, resultJsonInstance, searchQuery, cityAttributes);
                    break;
                case "artist":
                    handleFindingResults(searchResults, resultJsonInstance, searchQuery, artistAttributes);
                    break;
                case "default":
                    //Can add more type here for the future.
            }
        }
    });
    console.log(searchResults);//Debugging
    return searchResults;
}


/***
 * This function decides if the object passed in is something the user might be looking for
 * Nothing fancy here, just displaying what ever contains the string.
 * @param arrayToAddTo - A result array that this function will add its found objects to.
 * @param resultJsonInstance - The object to consider.
 * @param searchQuery - The search query that was passed in by the user
 * @param importantAttributes - An array of important attributes of the object that we should consider.
 */
function handleFindingResults(arrayToAddTo, resultJsonInstance, searchQuery, importantAttributes) {
    let score = 0;
    importantAttributes.forEach((importantAttribute) => {
        if (resultJsonInstance[importantAttribute]) {
            if (resultJsonInstance[importantAttribute].toLowerCase().includes(searchQuery)) {
                score++;
            }
        }
    });

    if (score > 0) {
        arrayToAddTo.push(resultJsonInstance);
    }
}

/***
 * This function will take in the results and manipulate the DOM to create a drop down of the results
 * @param searchResultArray - An array of object results that will be shown in the drop down list.
 */
function handleAutocomplete(searchResultArray) {
    closeAllLists();
    let input = document.getElementById(inputId);
    let dropDownList = document.createElement("DIV");
    dropDownList.setAttribute("id", "autocomplete-list");
    dropDownList.setAttribute("class", "autocomplete-items");
    /*append the DIV element as dropDownList child of the autocomplete container:*/
    input.parentNode.appendChild(dropDownList);
    /*for each item in the array...*/
    searchResultArray.forEach((result) => {
        /*create dropDownList DIV element for each matching element:*/
        let dropDownInstance = document.createElement("DIV");
        /*make the matching letters bold:*/
        dropDownInstance.innerHTML = "<strong>" + result.name + "</strong>";
        switch (result._type) {
            case "artist":
                dropDownInstance.innerHTML += ", " + result.main_category + " in " + "<strong style='color: darkmagenta'>" + " Artists " + "</strong>";
                break;
            case "city":
                dropDownInstance.innerHTML += ", " + result.province + " in " + "<strong style='color: darkmagenta'>" + " Cities " + "</strong>";
                break;
        }
        /*insert dropDownList input field that will hold the current array item's value:*/
        dropDownInstance.innerHTML += "<input type='hidden' value='" + result.name + "'>";
        /*execute dropDownList function when someone clicks on the item value (DIV element):*/
        dropDownInstance.addEventListener("click", function() {
            /*insert the value for the autocomplete text field:*/
            input.value = this.getElementsByTagName("input")[0].value;
            /*close the list of autocompleted values,
            (or any other open lists of autocompleted values:*/
            closeAllLists();
        });
        dropDownList.appendChild(dropDownInstance);
    });
}

/***
 * Will query the API for some search results
 * @param searchQuery - The query imputed by the user
 * @param callBack - A callback function that will be called when its finished
 */
function getJsonFromAPI(searchQuery, callBack) {
    let callingUrl = APIurl + "?query=" + searchQuery;

    $.ajax({
        url: callingUrl,
        type: "GET",
        success: function (returnJson){
            report("Response from API");
            APIJson = returnJson;
            callBack();
        },
        error: APICallbackFailed
    });
}

/***
 * Function to handle the error of querying the API
 * @param error - Error object
 * @constructor
 */
function APICallbackFailed(error) {
    report(error.toString());
    //Some pop up could be good here
}

function report(message) {
    console.log(message);
}

//----- Form functions----
function addActive(x) {
    /*a function to classify an item as "active":*/
    if (!x) return false;
    /*start by removing the "active" class on all items:*/
    removeActive(x);
    if (currentFocus >= x.length) currentFocus = 0;
    if (currentFocus < 0) currentFocus = (x.length - 1);
    /*add class "autocomplete-active":*/
    x[currentFocus].classList.add("autocomplete-active");
}
function removeActive(x) {
    /*a function to remove the "active" class from all autocomplete items:*/
    for (let i = 0; i < x.length; i++) {
        x[i].classList.remove("autocomplete-active");
    }
}
function closeAllLists(element) {
    /*close all autocomplete lists in the document,
    except the one passed as an argument:*/
    let x = document.getElementsByClassName("autocomplete-items");
    let input = document.getElementById(inputId);
    for (let i = 0; i < x.length; i++) {
        if (element !== x[i] && element !== input) {
            x[i].parentNode.removeChild(x[i]);
        }
    }
}
/*execute a function when someone clicks in the document:*/
document.addEventListener("click", function (e) {
    closeAllLists(e.target);
});
