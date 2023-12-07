import Model from "../Model.js";
import LoginView from "../Views/LoginView.js";

/**
 * Controller for the Login view.
 * A controller acts as a bridge between the Model and the View in the MVC pattern.
 * Using a Controller ensures that a Model is never aware of the View and vice
 * versa, ensuring separation of concerns.
 */
class LoginController {
    #Model;
    #View;

    constructor(LoginModel, LoginView) {
        this.#Model = LoginModel;
        this.#View = LoginView;
    }
    
    /**Initializes this LoginController.
     * @param The url to POST to when logging in.
     */
    initialize(url) {
        let loginBtn = document.getElementById("btnLogin");
        let txtUsername = document.getElementById("txtUsername");
        let txtPassword = document.getElementById("txtPassword");

        loginBtn.addEventListener("click", () => {
            if(txtUsername.value && txtPassword.value) {
                let authStr = this.createBasicAuthString(txtUsername.value, txtPassword.value);

                this.#Model.postData(url, "", "", "", authStr).then(() => {
                    this.#View.createToast("Innloggingen var vellykket!");
                }).catch((error) => {
                    console.log(error);
                    this.#View.createToast("Brukernavnet eller passordet var feil!");
                });
            } else {
                this.#View.createToast("Du må skrive inn brukernavn og passord for å logge inn!");
            }
        });
    }

    /**Creates a basic auth string by combining the username and password.
     * @returns A string with the username and password.
     */
    createBasicAuthString(username, password) {
        let combinedStr = username + ":" + password;
        let b64Str = btoa(combinedStr);
        return "basic " + b64Str;
    }
}

const KEY = "CKXDXF73";
const LOGIN_URL = "https://helseflora.herokuapp.com/users/login?key=" + KEY;

//Ensure the Controller is initialized when the webpage has been
//loaded.
document.addEventListener("DOMContentLoaded", function() {
    let appModel = new Model(Model.USER_CACHE_NAME);
    let appView = new LoginView();
    let appController = new LoginController(appModel, appView);
    appController.initialize(LOGIN_URL);
});