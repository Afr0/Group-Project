import Model from "../Model.js";
import CategoryView from "../Views/CategoryView.js";

/**
 * Controller for the Category view.
 * A controller acts as a bridge between the Model and the View in the MVC pattern.
 * Using a Controller ensures that a Model is never aware of the View and vice
 * versa, ensuring separation of concerns.
 */
class CategoryController {
    #Model;
    #View;

    constructor(CategoryModel, CategoryView) {
        this.#Model = CategoryModel;
        this.#View = CategoryView;
    }

    /**
     * Initializes this CategoryController.
     * @param {*} url The URL to fetch data from.
     */
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
            //"The process by which the browser works out how much space to allocate to web data storage 
            //and what to delete when that limit is reached is not simple, and differs between browsers,"
            //according to: https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API
            //So let's make g*dd*mn sure that we're fetching images from the server if they're not 
            //retrievable.
            if(cachedData[0].thumb === null) {
                cachedData = await this.#Model.fetchData(url, false);
            }

            this.#View.populatePlantDataRows(cachedData);
        } else {
            this.#Model.fetchData(url).then(data => {
                this.#View.populatePlantDataRows(data);
            }).catch(error => {
                //TODO: Display error to user with a messagebox...
                console.error(error); 
            });
        }
    }
}

const KEY = "CKXDXF73";
const CATEGORY_URL = "https://helseflora.herokuapp.com/webshop/plants/?category=";
const CATEGORY_URL_PARAM = "category";

//Ensure the Controller is initialized when the webpage has been
//loaded.
document.addEventListener("DOMContentLoaded", async function() {
    let urlParams = new URLSearchParams(window.location.search);
    let category = urlParams.get(CATEGORY_URL_PARAM);
    
    if(category) {
        //Add _ + category to have different caches for each category.
        let appModel = new Model(Model.CATEGORY_CACHE_NAME + "_" + category);
        let appView = new CategoryView();
        let appController = new CategoryController(appModel, appView);
        await appController.initialize(CATEGORY_URL + category + "&key=" + KEY);
    }
});