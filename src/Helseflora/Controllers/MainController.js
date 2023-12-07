import Model from "../Model.js";
import MainView from "../Views/MainView.js";

/**
 * Controller for the Main view.
 * A controller acts as a bridge between the Model and the View in the MVC pattern.
 * Using a Controller ensures that a Model is never aware of the View and vice
 * versa, ensuring separation of concerns.
 */
class MainController {
    #Model;
    #View;

    constructor(mainModel, mainView, user) {
        this.#Model = mainModel;
        this.#View = mainView;
    }

    /**
     * Initializes this MainController.
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

        if(cachedData) { //getCache potentially returns null SO CHECK THE ¤%/& RESULT!
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

const KEY = "CKXDXF73";
const MAIN_URL = "https://helseflora.herokuapp.com/webshop/categories?key=" + KEY;

//Ensure the Controller is initialized when the webpage has been
//loaded.
document.addEventListener("DOMContentLoaded", async function() {
    let urlParams = new URLSearchParams(window.location.search);
    let user = await Model.getUser();

    let appModel = new Model(Model.MAIN_CACHE_NAME);
    let appView = new MainView((user) ? true : false);

    if(urlParams.get("userCreated") === "true")
        appView.createToast("Ny bruker opprettet!");
    if(urlParams.get("userDeleted") === "true")
        appView.createToast("Brukeren ble slettet!");
    if(urlParams.get("loggedOut") === "true")
        appView.createToast("Du ble logget av!");

    let appController = new MainController(appModel, appView);
    await appController.initialize(MAIN_URL);
});