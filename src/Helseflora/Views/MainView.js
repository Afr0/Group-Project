import View from "./View.js";
import LanguageManager from "../LanguageManager.js";

export default class MainView extends View {
    #columnClass;
    #languageManager;

    /**Constructs a new instance of MainView.
     * @param isLoggedIn Is a user currently logged in?
     */
    constructor(isLoggedIn) {
        super();

        this.#languageManager = new LanguageManager();

        this.#columnClass = document.getElementsByClassName("plantCategoriesColumn")[0];
        
        let btnNewUser = document.getElementById("btnCreateUser");
        btnNewUser.addEventListener("click", function() {
            window.location.href = "./createuser.html";
        });
        
        let btnLogin = document.getElementById("btnLogin");
        btnLogin.addEventListener("click", function() {
            window.location.href = "./login.html";
        });

        if(isLoggedIn)
            btnLogin.style.display = 'none';

        let btnSearch = document.getElementById("btnSearch");
        this.#languageManager.loadLanguage("Norwegian").then(() => {
            btnSearch.textContent = this.#languageManager.getTranslation("Norwegian", "search");
            btnNewUser.textContent = this.#languageManager.getTranslation("Norwegian", "newuser");
        });

        btnSearch.addEventListener("click", function() {
            let inputValue = document.getElementsByClassName("txtSearch")[0].value;

            //\s = whitespace.
            if (/^[a-æøåA-ÆØÅ0-9\s]+$/i.test(inputValue) && inputValue !== "") { //Sanity check with regex
                window.location.href = "./plants.html?search=" + inputValue;
            }
            else
                throw Error("Invalid input detected!"); //TODO: handle error...
        });
    }

    populatePlantCategories(rowData) {
        for(let i = 0; i < rowData.length; i++)  {
            //I'm sure there's a more elegant solution to this, but this works.
            if(rowData[i].name !== "Not categorized") {
                let row = document.createElement("div");
                row.classList.add("plantCategoriesRow");
                //We DO trust the server, but let's assume that someone could have manipulated the data
                //(Man in The Middle Attack), so use textContent instead of innerHTML.
                row.textContent = rowData[i].name;
                row.addEventListener("click", function() {
                    //Using ./ means the browser will look plants.html in the same directory.
                    window.location.href = "./plants.html?category=" + 
                    encodeURIComponent(rowData[i].id);
                });

                this.#columnClass.appendChild(row);
            }
        }

        let forumRow = document.createElement("div");
        forumRow.classList.add("plantCategoriesRow");
        let btnForum = document.createElement("button");
        btnForum.textContent = "Gå til forum";
        btnForum.classList.add("button");
        btnForum.addEventListener("click", () => {
            window.location.href = "./forum.html";
        });
        forumRow.appendChild(btnForum);
        this.#columnClass.appendChild(forumRow);

        let cartRow = document.createElement("div");
        cartRow.classList.add("plantCategoriesRow");
        let btnCart = document.createElement("button");
        btnCart.classList.add("button");
        btnCart.textContent = "Handlekurv";
        btnCart.addEventListener("click", () => {
            window.location.href = "./shoppingcart.html";
        });
        cartRow.appendChild(btnCart);
        this.#columnClass.appendChild(cartRow);
    }
 }