import Model from "../Model.js";
import CreateUserView from "../Views/CreateUserView.js";

/**
 * Controller for the CreateUser view.
 * A controller acts as a bridge between the Model and the View in the MVC pattern.
 * Using a Controller ensures that a Model is never aware of the View and vice
 * versa, ensuring separation of concerns.
 */
class CreateUserController {
    #Model;
    #View;
    #userImg;

    constructor(CreateUserModel, CreateUserView) {
        this.#Model = CreateUserModel;
        this.#View = CreateUserView;

        let userForm = document.getElementById("userForm");

        userForm.addEventListener("submit", async () => {
            //Prevents the browsers default behaviour (such as opening a link), 
            //but does not stop the event from bubbling up the DOM:
            //https://jacobwardio.medium.com/how-to-correctly-use-preventdefault-stoppropagation-or-return-false-on-events-6c4e3f31aedb
            event.preventDefault();
            let formData = new FormData(userForm);

            if(this.#userImg) {
                console.log(this.#userImg);
                formData.append("img_file", this.#userImg);
            }

            //TODO: Sanity check this - the priority is not great, because the server likely sanity
            //checks whatever it receives.
            this.#Model.postData(CREATEUSER_URL,
                formData, "", "", "", false).then(response => {
                    window.location.href="./main.html?userCreated=true";
                }).catch((error) => {
                    this.#View.createToast("Kunne ikke opprette bruker. Vennligst forsøk på nytt!");
                    console.log(error);
                });
        });

        document.getElementById("btnSelectFile").addEventListener("click", function () {
            document.getElementById("image").click();
        });

        document.getElementById("btnUploadImage").addEventListener("click", async () => {
            let imageFile = imageInput.files[0];
            const maxSizeInBytes = 1 * 1024 * 1024; //1 meg

            if (imageFile) {
              if(imageFile.size <= maxSizeInBytes) {
                this.#userImg = imageFile; //Server expects the image as binary data.
                document.getElementById("userImg").src = await this.readImage(this.#userImg);
              } else {
                this.#View.createToast("Bildefilen du valgte var for stor. Vennligst velg en annen fil.");
              }
            } else {
              //TODO: Inform user...
              this.#View.createToast("Ingen bildefil valgt.");
            }
          });
    }

    /**Reads an image from disk and returns it as a base64-encoded string.
     * @param fileBlob The blob to read, as returned from an HTML file input
     *                 element.
    */
    async readImage(fileBlob) {
        return new Promise((resolve, reject) => {
            let img = new Image();
            //Resized the image to 80px by 80px to try to circumvent 500 error on server,
            //but might as well keep this code to give an accurate representation of final
            //image as received by server.
            img.onload = () => {
                let canvas = document.createElement('canvas');
                let ctx = canvas.getContext('2d');
    
                canvas.width = 80;
                canvas.height = 80;
    
                ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
                
                resolve(canvas.toDataURL("image/jpeg", 0.5));
            };
    
            img.onerror = reject;
    
            //Read the file as a data URL and set it as the source of the image element
            let reader = new FileReader();
            reader.onload = (e) => img.src = e.target.result;
            reader.readAsDataURL(fileBlob);
        });
    }
}

const KEY = "CKXDXF73";
const CREATEUSER_URL = "https://helseflora.herokuapp.com/users?key=" + KEY;

//Ensure the Controller is initialized when the webpage has been
//loaded.
document.addEventListener("DOMContentLoaded", function() {
    let appModel = new Model(Model.USER_CACHE_NAME);
    let appView = new CreateUserView();
    let appController = new CreateUserController(appModel, appView);
});