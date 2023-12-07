import Model from "../Model.js";
import UserSettingsView from "../Views/UserSettingsView.js";

/**
 * Controller for the User Settings view.
 * A controller acts as a bridge between the Model and the View in the MVC pattern.
 * Using a Controller ensures that a Model is never aware of the View and vice
 * versa, ensuring separation of concerns.
 */
class UserSettingsController {
    #Model;
    #View;
    #User;

    constructor(UserSettingsModel, UserSettingsView) {
        this.#Model = UserSettingsModel;
        this.#View = UserSettingsView;
    }

    /**
     * Initializes this UserSettingsController.
     * @param {string} url The URL to fetch data from.
     */
    async initialize(url) {
        this.#User = await Model.getUser();
        let elements = [
            document.getElementById("txtUsername"),
            document.getElementById("txtPassword"),

            document.getElementById("txtFullname"),
            document.getElementById("txtStreet"),
            document.getElementById("txtCity"),
            document.getElementById("txtZip"),
            document.getElementById("txtCountry")
        ];

        let btnUpdate = document.getElementById("btnUpdate");
        let btnLogout = document.getElementById("btnLogout");
        let btnDelete = document.getElementById("btnDelete");

        if(this.#User) {
            let imgUser = document.getElementById("imgUser");
            imgUser.src = this.#User.record.thumb;
            
            elements[0].value = this.#User.record.username;
            elements[2].value = this.#User.record.full_name;
            elements[3].value = this.#User.record.street;
            elements[4].value = this.#User.record.city;
            elements[5].value = this.#User.record.zipcode;
            elements[6].value = this.#User.record.country;

            for(let i = 0; i < elements.length; i++) {
                //Let's show the update button when the content of anything changed.
                elements[i].addEventListener("change", () => {
                    btnUpdate.hidden = false;
                });
            }

            let userForm = document.getElementById("userForm");
            userForm.addEventListener("submit", () => {
                event.preventDefault();
            })

            btnUpdate.addEventListener("click", async () => {
                if(this.#User) {
                    let userData = new FormData(document.getElementById("userForm"));
                    await this.#Model.putData(USERSETTINGS_URL, userData, "multipart/formdata", 
                        user.record.token);
                }
            });

            btnDelete.addEventListener("click", async () => {
                if(this.#User) {
                    //No need to supply a cancel callback, since we're not doing anything with it.
                    await this.#View.createConfirmationToast("Vil du virkelig slette brukeren din?", 
                       async () => await this.#onDeleteUser());
                }
            });

            btnLogout.addEventListener("click", () => {
                if(this.#Model.logoutUser()) {
                    //Prevents the browsers default behaviour (such as opening a link), 
                    //but does not stop the event from bubbling up the DOM:
                    //https://jacobwardio.medium.com/how-to-correctly-use-preventdefault-stoppropagation-or-return-false-on-events-6c4e3f31aedb
                    event.preventDefault();
                    window.location.href = "./main.html?loggedOut=true"; //./ redirects browser to webpage in the same folder.
                } else {
                    this.#View.createToast("Det oppstod en feil, vennligst forsøk på nytt.");
                }
            });
        } else {
            this.#View.createToast("Det oppstod en feil, vennligst forsøk å logge inn på nytt.");
        }
    }

    /**Called when the user confirmed that (s)he wanted to delete profile. */
    async #onDeleteUser() {
        await this.#Model.sendDelete(USERSETTINGS_URL, this.#User.record.token);
        window.location.href = "./main.html?userDeleted=true";
    }
}

const KEY = "CKXDXF73";
const USERSETTINGS_URL = "https://helseflora.herokuapp.com/users?key=" + KEY;

//Ensure the Controller is initialized when the webpage has been
//loaded.
document.addEventListener("DOMContentLoaded", async function() {    
    //Add _ + category to have different caches for each category.
    let appModel = new Model(Model.USER_CACHE_NAME);
    let appView = new UserSettingsView();
    let appController = new UserSettingsController(appModel, appView);
    await appController.initialize(USERSETTINGS_URL);
});