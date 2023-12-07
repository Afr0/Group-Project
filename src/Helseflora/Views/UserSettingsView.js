import View from "./View.js";

/**View for checkout.html. Initialized by CheckoutController. */
export default class UserSettingsView extends View {
    #selectShippingMethod
    #backBtn;

    /**Constructs a new instance of UserSettingsView. */
    constructor() {
        super();
        
        this.#backBtn = document.getElementsByClassName("backButton")[0];
        this.#backBtn.addEventListener("click", function() {
            window.location.href = "./main.html"; //./ redirects browser to webpage in the same folder.
        });
    }
 }