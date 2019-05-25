/*
    Note: we are only going to use unit tests for the logic and the inputs reaction here.
    The API can be tested from here if this was going to be an integration test.
 */
describe("The unit test suite for the project", function() {
    beforeAll(function(done) {
        APIJson = undefined;
        $(done);
    });

    describe("The getJsonFromAPI function", function() {
        let testFunction = getJsonFromAPI;
        it("Can pull the API and get a JSON", function(done) {
            APIJson = undefined;
            expect(APIJson).toBe(undefined);
            let searchParam = "amst";
            let callback = function() {
                expect(APIJson).toBeDefined();
                done();
            };
            testFunction(searchParam, callback);
        });
    });

    describe("The searchJson function", function() {
        let APISearchQuery = "amst";
        let searchQuery;
        let searchResults;
        let testFunction = searchJson;

        beforeEach(function(done) {
            window.getJsonFromAPI(APISearchQuery, function(){
                done();
            });
        });

        it("calls the sub-function 'handleFindingResults'", function() {
            spyOn(window, "handleFindingResults");
            searchQuery = APISearchQuery;
            testFunction(searchQuery);
            expect(window.handleFindingResults).toHaveBeenCalled();
        });

        it("finds some results", function() {
            searchQuery = APISearchQuery;
            searchResults = testFunction(searchQuery);
            expect(searchResults.length).toBeGreaterThan(0);
        });

        /*
            NOTE: Since I didnt make the search algorithm very complicated, I didnt include any tests
            but I would expect there to be tests that make sure it finds the correct values in a given circumstance
            if the searching algorithm would need to be more complicated.
         */
    });

    describe("The begin function", function() {
        let APISearchQuery = "amst";
        let testFunction = begin;

        beforeEach(function(done) {
            window.getJsonFromAPI(APISearchQuery, function(){
                done();
            });
        });

        it("with JSON present, calls the appropriate functions", function() {
            //Sends its query to handleSearch
            spyOn(window, "handleSearch");

            testFunction(APISearchQuery);
            expect(window.handleSearch).toHaveBeenCalled();
        });

        it("Clears the list when empty query", function() {
            //Closes the list when a new value is entered
            spyOn(window, "closeAllLists");
            testFunction(APISearchQuery);
            expect(window.closeAllLists).toHaveBeenCalled();
        });

        it("with JSON present, the handler is called all the way through", function() {
            spyOn(window, "searchJson");
            spyOn(window, "handleAutocomplete");

            testFunction(APISearchQuery);
            expect(window.searchJson).toHaveBeenCalled();
            expect(window.handleAutocomplete).toHaveBeenCalled();
        });

        it("with JSON missing, calls to get json from API", function() {
            APIJson = undefined;
            spyOn(window, "getJsonFromAPI");

            testFunction(APISearchQuery);
            expect(window.getJsonFromAPI).toHaveBeenCalled();
        });

        it("with JSON missing, calls the handler after receiving json", function(done) {
            APIJson = undefined;
            spyOn(window, "handleSearch");

            testFunction(APISearchQuery);
            setTimeout(function () {
                expect(window.handleSearch).toHaveBeenCalled();
                done();
            }, 100)
        });
    });

    //TODO
    describe("The input creates a drop down when passed objects", function() {
        it("div is created when results are inserted", function() {
            expect(true).toBe(true);
        });
    });

    //TODO
    describe("Key events navigate the selection in the input", function() {
        it("key events change css", function() {
            expect(true).toBe(true);
        });
    });
});
