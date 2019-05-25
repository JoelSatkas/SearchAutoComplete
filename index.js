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

function startAutoComplete() {
    begin(this.value.toLowerCase());
}

function begin(searchQuery) {
    /*close any already open lists of autocompleted values*/
    closeAllLists();
    currentFocus = -1;

    //If its empty clear the json
    //This saves on network calls, increases speed of search and decreases network costs for mobile users.
    if(searchQuery === "") {
        APIJson = undefined;
        return;
    }

    if(APIJson === undefined) {
        //Get json from API
        //Pass in callback
        getJsonFromAPI(searchQuery, function () {
            handleSearch(searchQuery);
        });
    }
    else{
        //  Use the json we already have
        handleSearch(searchQuery);
    }
}

function handleSearch(searchQuery) {
    let searchResults = searchJson(searchQuery);
    handleAutocomplete(searchResults);
}

function searchJson(searchQuery) {
    let searchResults = [];

    //First found first displayed
    APIJson["results"].forEach((resultJsonInstance) => {
        if (searchResults.length < choiceParalysis) {
            switch(resultJsonInstance["_type"]) {
                case "city":
                    findSearchInResults(searchResults, resultJsonInstance, searchQuery, cityAttributes);
                    break;
                case "artist":
                    findSearchInResults(searchResults, resultJsonInstance, searchQuery, artistAttributes);
                    break;
                case "default":
                    //Can add more type here for the future.
            }
        }
    });
    //Debugging
    console.log(searchResults);
    return searchResults;
}

//Nothing fancy here, just displaying basic results.
function findSearchInResults(arrayToAddTo, resultJsonInstance, searchQuery, importantAttributes) {
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

function handleAutocomplete(searchResultArray) {
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

function APICallbackFailed(error) {
    report(error.toString());
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
