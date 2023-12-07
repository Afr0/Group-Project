import View from "./View.js";

export default class DetailView extends View {
    #columnClass;
    #plantTitle;
    #imageContainer;
    #backBtn;
    #cartBtn;
    #addToCartCallback;

    /**Comstructs a new instance of DetailView.
     * @param addToCartCallback The callback that will be called when a plant is added to the cart.
     */
    constructor(addToCartCallback) {
        super();

        this.#plantTitle = document.createElement("h2");
        this.#plantTitle.classList.add("row");
        
        this.#imageContainer = document.createElement("div");
        this.#imageContainer.classList.add("image-container");

        this.#columnClass = document.getElementsByClassName("column")[0];

        this.#backBtn = document.getElementsByClassName("backButton")[0];
        this.#backBtn.addEventListener("click", function() {
            window.location.href = "./main.html"; //./ redirects browser to webpage in the same folder.
        });

        this.#cartBtn = document.getElementById("btnCart");
        this.#cartBtn.addEventListener("click", function() {
            window.location.href = "./shoppingcart.html";
        });

        if(addToCartCallback)
            this.#addToCartCallback = addToCartCallback;
        else
            throw(new Error("Tried to construct DetailView instance with a null callback!"));
    }

    /**Creates a button for adding comments and sets its 'click' eventhandler to 
     * call the specified callback.
     * @param commentCallback The callback to add to the button's 'click' eventhandler.
     * @param plantID ID of plant currently being displayed. 
     */
    createCommentRow(commentCallback, plantID) {
        let commentRow = document.createElement("div");
        let txtComment = document.createElement("textarea");
        let btnAddComment = document.createElement("button");
        let starContainer = document.createElement("div");

        commentRow.classList.add("row");
        starContainer.classList.add("star-rating");

        for (let i = 1; i <= 5; i++) {
            //A <span> element which is used to color a part of a text: 
            //https://www.w3schools.com/tags/tag_span.asp
            let star = document.createElement("span");
            star.classList.add("star");
            star.textContent = "☆";
            star.dataset.ratingValue = i;
    
            star.addEventListener("click", function() {
                updateStarRating(starContainer, i);
            });
    
            starContainer.appendChild(star);
        }

        /**Updates the rendering of the stars based on the provided rating.
         * @param container The container for the stars.
         * @param rating The rating.
        */
        function updateStarRating(container, rating) {
            //Let's define a closure here for encapsulation - this function is
            //only relevant to the outer scope.
            //A closure is a function that has access to its own scope, 
            //the scope of the outer function, and the global scope.
            //In other words, it's a function - with the difference being that JS
            //can define functions within functions, unlike for instance C#.
            const stars = container.getElementsByClassName("star");
            for (let i = 0; i < stars.length; i++) {
                stars[i].textContent = i < rating ? "★" : "☆"; //Update star based on rating
            }
        }
                
        txtComment.placeholder = "Skriv en kommentar.";
        commentRow.appendChild(txtComment);

        this.#columnClass.appendChild(commentRow);

        btnAddComment.classList.add("button");
        btnAddComment.textContent = "Legg til kommentar";
        btnAddComment.addEventListener("click", () => 
        {
            let rating = 0;
            let stars = starContainer.getElementsByClassName("star");

            for(let star of stars) {
                if(star.textContent === "★") {
                    //Base 10
                    rating = parseInt(star.dataset.ratingValue, 10);
                }
                else
                    break; //Leave when we found an unfilled star.
            }

            commentCallback(txtComment.value, rating, plantID);
            txtComment.placeholder = "Skriv en kommentar.";
            txtComment.textContent = "";

            let btnShowComments = document.createElement("button");
            btnShowComments.textContent = "Vis kommentar(er)";
            btnShowComments.classList.add("button");
            btnShowComments.addEventListener("click", () => {
                window.location.href = "./comments.html?id=" + plantID;
            });

            btnAddComment.hidden = true;
            txtComment.hidden = true;
            commentRow.appendChild(btnShowComments);
        });

        commentRow.appendChild(starContainer);
        commentRow.appendChild(btnAddComment);
    }

    /**Configures the image and title based on data received from the server.
     * @param data The data received from the server.
     */
    setupImgAndTitle(data) {
        let firstResult = data[0];

        //TODO: Figure out how to secure this...
        this.#imageContainer.innerHTML = "<img class='leftAlignedImage' src='" + firstResult.image + "'>";
        this.#imageContainer.style.width = "100%";
        this.#imageContainer.style.height = "auto";
                        
        this.#plantTitle.textContent += firstResult.name;
        this.#plantTitle.classList.add("label");
        this.#imageContainer.appendChild(this.#plantTitle);

        this.#columnClass.appendChild(this.#imageContainer);
    }

    /**Populates the plant data rows based on the data received from the server. 
     * @param rowData The data received from the server.
    */
    populatePlantDataRows(rowData) {
        let firstResult = rowData[0];

        let dagGrad = (firstResult.min_temp_day > 1) ? " grader" : " grad"; //Sigh...
        let nattGrad = (firstResult.min_temp_night > 1) ? " grader" : " grad"; //Sigh...

        let categoryRow = document.createElement("div");
        categoryRow.classList.add("row");
        categoryRow.textContent = "Kategori: " + firstResult.category_name;
        this.#columnClass.appendChild(categoryRow);

        let descriptionRow = document.createElement("div");
        descriptionRow.classList.add("row");
        descriptionRow.textContent += firstResult.description;
        this.#columnClass.appendChild(descriptionRow);

        /**Breaks a string in two and adds a linebreak. This closure came about as a result of
         * running out of CSS methods to break the zone description.
         * @param stringToBreak The string to break.
         * @returns An array of [TextNode, a br-element, TextNode].
         */
        function breakTheString(stringToBreak) {
            //The strings aren't *that* long, one break halfway should get us there.
            let halfwayPoint = Math.floor(stringToBreak.length / 2);
            let spaceIndex = stringToBreak.indexOf(" ", halfwayPoint);

            if(spaceIndex === -1)
                spaceIndex = stringToBreak.lastIndexOf(" ", halfwayPoint);

            if(spaceIndex === -1)
                spaceIndex = halfwayPoint;

            let firstHalf = stringToBreak.substring(0, spaceIndex);
            let secondHalf = stringToBreak.substring(spaceIndex + 1);
        
            //Boulevard of broken dreams (read: strings)
            return [
                document.createTextNode(firstHalf),
                document.createElement("br"),
                document.createTextNode(secondHalf)
            ];
        }

        let extendedInfoRow = document.createElement("div");
        extendedInfoRow.classList.add("row");
        extendedInfoRow.appendChild(document.createTextNode("Rating: " + firstResult.rating + " av 5."));
        extendedInfoRow.appendChild(document.createElement("br"));
        extendedInfoRow.appendChild(document.createTextNode("Normal høyde: " + firstResult.height));
        extendedInfoRow.appendChild(document.createElement("br"));

        console.log(firstResult.zone_description);
        let zoneDescription = breakTheString("Vekstsone: " + firstResult.zone_description);
        for(let i = 0; i < zoneDescription.length; i++)
            extendedInfoRow.appendChild(zoneDescription[i]);

        extendedInfoRow.appendChild(document.createElement("br"));

        //Sigh, had to go all ternary on this sh*t because server doesn't have a predictable response.
        let fertilizerMixText = "Anbefalt gjødselmiks: " + 
            (firstResult.nitrogen !== undefined ? (firstResult.nitrogen + "% nitrogen, ") : "") + 
            (firstResult.potassium !== undefined ? (firstResult.potassium + "% kalium og ") : "") + 
            (firstResult.phosphor !== undefined ?  (firstResult.phosphor + "% fosfor. ") : "") + 
            "Bør ikke plantes hvis temperaturen om dagen er under " + 
            firstResult.min_temp_day + dagGrad + ", eller temperaturen om natten er under " + 
            firstResult.min_temp_night + nattGrad + ".";
        //Because JS is a loosely (REALLY loosely) typed language we can do this :P
        fertilizerMixText = breakTheString(fertilizerMixText);
        for(let i = 0; i < fertilizerMixText.length; i++)
            extendedInfoRow.appendChild(fertilizerMixText[i]);

        this.#columnClass.appendChild(extendedInfoRow);

        let shippingRow = document.createElement("div");
        shippingRow.classList.add("row");
        if(firstResult.stock > 0) {
        shippingRow.textContent += "Antall på lager: " + firstResult.stock;
        } else {
            let expectedShippedDate = new Date(firstResult.expected_shipped);
            let formattedDate = expectedShippedDate.toLocaleDateString("nb-NO", {
                year : "numeric",
                month : "long",
                day : "numeric"
            });

            shippingRow.textContent += "Ingen planter på lager for øyeblikket, estimert leveringstid: " + 
                formattedDate;
        }
        
        let buyBtn = document.createElement("button");
        buyBtn.classList.add("button");
        buyBtn.textContent = "Kjøp";
        shippingRow.appendChild(buyBtn);

        //Lexical scoping: the arrow function inherits "this" from
        //the parent scope at the time they're defined. Regular functions
        //have their own "this" context.
        buyBtn.addEventListener("click", () => {
            this.#addToCartCallback(firstResult);
            this.createToast("Lagt til i handlekurven!");
        });

        this.#columnClass.appendChild(shippingRow);

        let priceRow = document.createElement("div");
        let btnCart = document.getElementById("btnCart");
        extendedInfoRow.setAttribute("style", "white-space: pre;");
        priceRow.classList.add("row");
        priceRow.textContent += "kr " + firstResult.price + ",- per stk.";
        if(firstResult.discount > 0) {
            let discountText = document.createTextNode("\r\nTilbud: " + firstResult.discount + "%");
            let boldElement = document.createElement("b");
            boldElement.appendChild(discountText);
            priceRow.appendChild(boldElement);
        }
        priceRow.appendChild(this.#cartBtn);

        this.#columnClass.appendChild(priceRow);
    }
 }