import Model from "./Model.js";
import CheckoutView from "./CheckoutView.js";

/**
 * Controller for the Checkout view.
 * A controller acts as a bridge between the Model and the View in the MVC pattern.
 * Using a Controller ensures that a Model is never aware of the View and vice
 * versa, ensuring separation of concerns.
 */
class CheckoutController {
    #Model;
    #View;

    constructor(CheckoutModel, CheckoutView) {
        this.#Model = CheckoutModel;
        this.#View = CheckoutView;
    }

    /**
     * Initializes this CheckoutController.
     * @param {*} url The URL to fetch data from.
     */
    initialize(url) {
        let cachedData = this.#Model.getCachedData();

        if(cachedData) { //getCachedData potentially returns null SO CHECK THE ¤%/& RESULT!
            this.#View.addShippingMethods(cachedData);
        } else {
            this.#Model.fetchData(url).then(data => {
                this.#View.addShippingMethods(data);
            }).catch(error => {
                //TODO: Display error to user with a messagebox...
                console.error(error); 
            });
        }
    }
}

const CHECKOUT_URL_PARAM = "id";

//Ensure the Controller is initialized when the webpage has been
//loaded.
document.addEventListener("DOMContentLoaded", function() {
    let urlParams = new URLSearchParams(window.location.search);
    //TODO: Get plants in shopping cart from cache...
    
    let appModel = new Model(Model.CHECKOUT_CACHE_NAME);
    let appView = new CheckoutView();
    let appController = new CheckoutController(appModel, appView);
    appController.initialize("https://helseflora.herokuapp.com/logistics/shippingtypes?key=CKXDXF73");
});