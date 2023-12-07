import DetailModel from "../DetailModel.js";
import DetailView from "../Views/DetailView.js";
import Model from "../Model.js";

/**
 * Controller for the Detail view.
 * A controller acts as a bridge between the Model and the View in the MVC pattern.
 * Using a Controller ensures that a Model is never aware of the View and vice
 * versa, ensuring separation of concerns.
 */
class DetailController {
    #Model;
    #View;

    constructor(DetailModel, DetailView) {
        this.#Model = DetailModel;
        this.#View = DetailView;
    }

    /**
     * Initializes this DetailController.
     * @param {*} url The URL to fetch data from.
     */
    async initialize(url) {
        try
        {
            let cachedData = await this.#Model.getCache();
            let plantData;
            let user = await Model.getUser();

            if(user) {
                let imgUser = document.getElementById("imgUser");
                imgUser.src = user.record.thumb;
                imgUser.addEventListener("click", () => {
                    window.location.href = "./usersettings.html";
                });
            }

            if(cachedData) {
                console.log("DetailController.initialize(): using cached data.");
                plantData = cachedData;

                //"The process by which the browser works out how much space to allocate to web data storage 
                //and what to delete when that limit is reached is not simple, and differs between browsers,"
                //according to: https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API
                //So let's make g*dd*mn sure that we're fetching images from the server if they're not 
                //retrievable.
                if(cachedData[0].thumb === null)
                    plantData = await this.#Model.fetchData(url, false);
            } else {
                console.log("DetailController.initialize(): fetching data.");
                plantData = await this.#Model.fetchData(url);
            }

            let zoneDescription;

            if(plantData && plantData.length > 0) {
                zoneDescription = await this.#Model.getGrowthZone(plantData, plantData[0].zone_id);
                plantData[0].zone_description = zoneDescription;

                this.#View.setupImgAndTitle(plantData);
                this.#View.populatePlantDataRows(plantData);
                
                if(user)
                    this.#setupCommentCallback(plantData[0].id);
            }
        } catch(error) {
            this.#View.createToast("En feil oppstod: " + error + " , vennligst forsøk på nytt.");
            console.error(error);
        }
    }

    /**
    * Sets up the comment callback in the view. 
    * Binds the postComment method of this controller to ensure 
    * the correct context (this) is used when the method is invoked.
    * @param plantID The ID of the plant that is being displayed.
    */
    #setupCommentCallback(plantID) {
        this.#View.createCommentRow(this.postComment.bind(this), plantID);
    }

    /**POSTs a comment to the server.
     * @param comment The comment to POST.
     * @param Rating The rating of the plant.
     */
    postComment(comment, rating, plantID) {
        let user;
        Model.getUser().then((response) => {
            user = response;

            this.#Model.postData(COMMENTS_URL, 
                {"comment_text" : comment, "rating" : rating, "plant_id" : plantID},
                "application/json", "", user.record.token, false);
            this.#View.createToast("La til kommentar!");
        });
    }
}

//This would possibly be safer to store in a file, somewhere, but we still have to store it in memory,
//so ehhh... 
const KEY = "CKXDXF73";
const COMMENTS_URL = "https://helseflora.herokuapp.com/webshop/comments?key=" + KEY;
const PLANTS_URL = "https://helseflora.herokuapp.com/webshop/plants?id=";
const DETAIL_URL_PARAM = "id";

/**Callback for adding a plant to the cart cache.
 * @param plant The plant to add.
 */
function addPlantToCartCache(plant) {
    DetailModel.addPlantToCart(Model.SHOPPINGCART_CACHE_NAME, plant);
}

//Ensure the Controller is initialized when the webpage has been
//loaded.
document.addEventListener("DOMContentLoaded", async function() {
    let urlParams = new URLSearchParams(window.location.search);
    let plantID = urlParams.get(DETAIL_URL_PARAM);

    if(!plantID)
        plantID = 39; //Smørflue - in case someone happened upon this page without an ID.
    
    //Add _ + category to have different caches for each plant.
    let appModel = new DetailModel(Model.DETAIL_CACHE_NAME + "_" + plantID);
    let appView = new DetailView(addPlantToCartCache);
    let appController = new DetailController(appModel, appView);
    await appController.initialize(PLANTS_URL + plantID + "&key=" + KEY);
});