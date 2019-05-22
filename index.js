var APIJson;

const choiceParalysis = 10;
const divisionRule = 2;

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

function init() {
    document.getElementById(inputId).addEventListener("input", startAutoComplete);
}

function startAutoComplete() {
    let searchQuery = this.value;
    //If its empty clear the json
    if(this.value === "") {
        APIJson = undefined;
    }

    if(APIJson === undefined) {
        //Get json from API
        //Pass in callback
        APIJson = getJsonFromAPI(searchQuery, function () {
            searchJson(searchQuery);
        });
    }
    else{
        //  if no use the json
        searchJson(searchQuery);
    }
}

function searchJson(searchQuery) {
    let searchResults = [];

    //First come first server
    APIJson["results"].forEach((resultJsonInstance) => {
        switch(resultJsonInstance["_type"]) {
            case "city":
                
                break;
            case "artist":
                break;
        }
    })
}

function getJsonFromAPI(searchQuery) {
    var callingUrl = APIurl + "?query=" + searchQuery;

    $.ajax({
        url: callingUrl,
        type: "GET",
        success: APICallback,
        error: APICallbackFailed
    });
}

function APICallback(result, callBack) {
    report("Response from API");
    APIJson = result;
    callBack();
}

function APICallbackFailed(error) {
    report(error.toString());
}

function report(message) {
    console.log(message);
}
