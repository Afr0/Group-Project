import Model from "../Model.js";
import CategoryView from "../Views/CategoryView.js";

/*==============================================================================
/*A controller acts as a bridge between the Model and the View in the MVC pattern.
/*Using a Controller ensures that a Model is never aware of the View and vice
/*versa, ensuring separation of concerns.
*==============================================================================*/
class SearchController {
    #Model;
    #View;

    constructor(SearchModel, SearchView) {
        this.#Model = SearchModel;
        this.#View = SearchView;
    }

    async initialize(url) {
        let cachedData = await this.#Model.getCache();
        let user = await Model.getUser();

        if(user) {
            let imgUser = document.getElementById("imgUser");
            imgUser.src = user.record.thumb;
            imgUser.addEventListener("click", () => {
                window.location.href = "./usersettings.html";
            });
        }

        if(cachedData) { //getCachedData potentially returns null SO CHECK THE ¤%/& RESULT!
            console.log("Using cached data...");
            console.log(cachedData);
            this.#View.populatePlantDataRows(cachedData);
        } else {
            this.#Model.fetchData(url).then(data => {
                this.#View.populatePlantDataRows(data);
            }).catch(error => {
                //TODO: Display error to user with a messagebox...
                console.error("Error while fetching data: " + error); 
            });
        }
    }
}

const KEY = "CKXDXF73";
const SEARCH_URL = "https://helseflora.herokuapp.com/webshop/plants/?search=";
const SEARCH_CACHE_NAME = "searchDataCache"; //Data last retrieved by server.
const SEARCH_URL_PARAM = "search";

//Ensure the Controller is initialized when the webpage has been
//loaded.
document.addEventListener("DOMContentLoaded", async function() {
    let urlParams = new URLSearchParams(window.location.search);
    let search = urlParams.get(SEARCH_URL_PARAM);
    
    if(search) {
        //Add _ + search to differentiate caching for each plant that was fetched...
        let appModel = new Model(SEARCH_CACHE_NAME + "_" + search);
        let searchView = new CategoryView();
        let searchController = new SearchController(appModel, searchView);
        await searchController.initialize(SEARCH_URL + 
            search + "&key=" + KEY);
    }
});