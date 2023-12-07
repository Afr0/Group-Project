/**View for checkout.html. Initialized by CheckoutController. */
export default class CheckoutView {
    #selectShippingMethod
    #backBtn;

    /**Constructs a new instance of CheckoutView. */
    constructor() {
        this.#selectShippingMethod = document.getElementsByClassName("shipping-method")[0];
        this.#backBtn = document.getElementsByClassName("backButton")[0];
        this.#backBtn.addEventListener("click", function() {
            window.location.href = "./main.html"; //./ redirects browser to webpage in the same folder.
        });
    }

    addShippingMethods(data) {
        if(!data.length > 0)
            return null;

        for(let i = 0; i < data.length; i++) {
            let option = document.createElement("option");
            option.value = "shipping-method-" + i;
            option.textContent = data[i].method;
            this.#selectShippingMethod.appendChild(option);
            
            let descriptionOption = document.createElement("option");
            
            //We're using innerHTML, so sanitycheck with regex. \s = whitespace.
            if (/^[a-æøåA-ÆØÅ0-9\s-]+$/i.test(data[i].description))
                descriptionOption.innerHTML = "&nbsp;&nbsp;&nbsp;" + data[i].description;
            
            descriptionOption.disabled = true;
            this.#selectShippingMethod.appendChild(descriptionOption);
        }
    }
 }