var APIJson;

const choiceParalysis = 10;

const APIurl = "https://api.earlytestabc.plugify.nl/autocomplete.json";
const inputId = "searchInput";

const cityAtrributes = [
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
        var keyDownEvent = event || window.event,
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
    let searchQuery = this.value.toLowerCase();
    /*close any already open lists of autocompleted values*/
    closeAllLists();
    currentFocus = -1;
    
    //If its empty clear the json
    //This saves on network calls, increases speed of search and decreases network costs for mobile users.
    if(this.value === "") {
        APIJson = undefined;
        return;
    }

    if(APIJson === undefined) {
        //Get json from API
        //Pass in callback
        getJsonFromAPI(searchQuery, function () {
            searchJson(searchQuery);
        });
    }
    else{
        //  Use the json we already have
        searchJson(searchQuery);
    }
}

function searchJson(searchQuery) {
    let searchResults = [];

    //First found first displayed
    APIJson["results"].forEach((resultJsonInstance) => {
        if (searchResults.length < choiceParalysis) {
            switch(resultJsonInstance["_type"]) {
                case "city":
                    findSearchInResults(searchResults, resultJsonInstance, searchQuery, cityAtrributes);
                    break;
                case "artist":
                    findSearchInResults(searchResults, resultJsonInstance, searchQuery, artistAttributes);
                    break;
                case "default":
                    //Can add more type here for the future.
            }
        }
    });
    console.log(searchResults);
    handleAutocomplete(searchResults);
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
    let a = document.createElement("DIV");
    a.setAttribute("id", "autocomplete-list");
    a.setAttribute("class", "autocomplete-items");
    /*append the DIV element as a child of the autocomplete container:*/
    input.parentNode.appendChild(a);
    /*for each item in the array...*/
    for (let i = 0; i < searchResultArray.length; i++) {
        /*create a DIV element for each matching element:*/
        let b = document.createElement("DIV");
        let searchString = "";
        /*make the matching letters bold:*/
        b.innerHTML = "<strong>" + searchResultArray[i].name + "</strong>";
        switch (searchResultArray[i]._type) {
            case "artist":
                b.innerHTML += ", " + searchResultArray[i].main_category + " in " + "<strong style='color: darkmagenta'>" + " Artists " + "</strong>";
                break;
            case "city":
                b.innerHTML += ", " + searchResultArray[i].province + " in " + "<strong style='color: darkmagenta'>" + " Cities " + "</strong>";;
                break;
        }
        /*insert a input field that will hold the current array item's value:*/
        b.innerHTML += "<input type='hidden' value='" + searchResultArray[i].name + "'>";
        /*execute a function when someone clicks on the item value (DIV element):*/
        b.addEventListener("click", function(e) {
            /*insert the value for the autocomplete text field:*/
            input.value = this.getElementsByTagName("input")[0].value;
            /*close the list of autocompleted values,
            (or any other open lists of autocompleted values:*/
            closeAllLists();
        });
        a.appendChild(b);
    }
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
function closeAllLists(elmnt) {
    /*close all autocomplete lists in the document,
    except the one passed as an argument:*/
    let x = document.getElementsByClassName("autocomplete-items");
    let input = document.getElementById(inputId);
    for (let i = 0; i < x.length; i++) {
        if (elmnt != x[i] && elmnt != input) {
            x[i].parentNode.removeChild(x[i]);
        }
    }
}
/*execute a function when someone clicks in the document:*/
document.addEventListener("click", function (e) {
    closeAllLists(e.target);
});
