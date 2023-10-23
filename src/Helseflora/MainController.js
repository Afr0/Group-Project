import MainModel from "./MainModel.js";
import MainView from "./MainView.js";

/*==============================================================================
/*A controller acts as a bridge between the Model and the View in the MVC pattern.
/*Using a Controller ensures that a Model is never aware of the View and vice
/*versa, ensuring separation of concerns.
*==============================================================================*/
class MainController {
    #Model;
    #View;

    constructor(MainModel, MainView) {
        this.#Model = MainModel;
        this.#View = MainView;
    }

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
    let appModel = new MainModel();
    let appView = new MainView();
    let appController = new MainController(appModel, appView);
    appController.initialize("https://helseflora.herokuapp.com/webshop/categories?key=CKXDXF73");
});