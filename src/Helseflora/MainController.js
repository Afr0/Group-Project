import Model from "./Model.js";
import MainView from "./MainView.js";

/**
 * Controller for the Main view.
 * A controller acts as a bridge between the Model and the View in the MVC pattern.
 * Using a Controller ensures that a Model is never aware of the View and vice
 * versa, ensuring separation of concerns.
 */
class MainController {
    #Model;
    #View;

    constructor(MainModel, MainView) {
        this.#Model = MainModel;
        this.#View = MainView;
    }

    /**
     * Initializes this MainController.
     * @param {*} url The URL to fetch data from.
     */
    initialize(url) {
        let cachedData = this.#Model.getCachedData();

        if(cachedData) { //getCachedData potentially returns null SO CHECK THE ¤%/& RESULT!
            this.#View.populatePlantCategories(cachedData);
        } else {
            this.#Model.fetchData(url).then(data => {
                this.#View.populatePlantCategories(data);
            }).catch(error => {
                //TODO: Display error to user with a messagebox...
                console.error(error); 
            });
        }
    }
}

//Ensure the Controller is initialized when the webpage has been
//loaded.
document.addEventListener("DOMContentLoaded", function() {
    let appModel = new Model(Model.MAIN_CACHE_NAME);
    let appView = new MainView();
    let appController = new MainController(appModel, appView);
    appController.initialize("https://helseflora.herokuapp.com/webshop/categories?key=CKXDXF73");
});