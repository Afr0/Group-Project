import LanguageManager from "../LanguageManager.js";

export default class View {
    /**Create a toast.
     * @param caption The caption of the toast.
     * @param timeout Optional timeout, set to 3500 by default.
     */
    createToast(caption, timeout = 2500) {
        let toast = document.createElement("div");
        toast.classList.add("toast");
        toast.textContent = caption;
        document.body.appendChild(toast);
        setTimeout(() => {
            toast.remove();
        }, timeout);
    }

    /**Create an interactive toast for confirmation.
    * @param caption The caption of the toast.
    * @param confirmCallback Function to call if user confirms.
    * @param cancelCallback Function to call if user cancels.
    */
    async createConfirmationToast(caption, confirmCallback, cancelCallback) {
        let toast = document.createElement("div");
        toast.classList.add("toast");

        let langManager = new LanguageManager();
    
        let text = document.createElement("span");
        text.textContent = caption;
        toast.appendChild(text);
    
        let btnConfirm = document.createElement("button");
        btnConfirm.classList.add("button");
        btnConfirm.textContent = "Bekreft";
        btnConfirm.onclick = async () => {
            if(confirmCallback)
                await confirmCallback();

            toast.remove();
        };
    
        let btnCancel = document.createElement("button");
        btnCancel.textContent = "Avbryt";
        btnCancel.classList.add("button");
        btnCancel.onclick = async () => {
            if(cancelCallback)
                await cancelCallback();

            toast.remove();
        };

        //Would obviously need more infrastructure for language agnosticity, but the concept works...
        //Could possibly have a global variable somewhere with the selected language...
        langManager.loadLanguage("Norwegian").then(() => {
            btnConfirm.textContent = langManager.getTranslation("Norwegian", "confirm");
            btnCancel.textContent = langManager.getTranslation("Norwegian", "cancel");
        });
    
        toast.appendChild(btnConfirm);
        toast.appendChild(btnCancel);
    
        document.body.appendChild(toast);
    }
 }