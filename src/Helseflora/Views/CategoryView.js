import View from "./View.js";

export default class CategoryView extends View {
    #columnClass;
    #backBtn;

    constructor() {
        super();

        this.#columnClass = document.getElementsByClassName("column")[0];
        this.#backBtn = document.getElementsByClassName("backButton")[0];
        this.#backBtn.addEventListener("click", function() {
            window.location.href = "./main.html"; //./ redirects browser to webpage in the same folder.
        });
    }

    populatePlantDataRows(rowData) {
        if(rowData.length > 0) {
            let categoryTitle = document.createElement("h2");
            categoryTitle.classList.add("row");
            categoryTitle.textContent = rowData[0].category_name;
            this.#columnClass.appendChild(categoryTitle);

            for(let i = 0; i < rowData.length; i++) {
                let plantRow = document.createElement("div");
                //TODO: Figure out how to make this safe...
                plantRow.innerHTML = "<img class='leftAlignedImage' src='" + rowData[i].thumb + "'>";
                plantRow.classList.add("row");

                //Shore up safety by using textContent instead of innerHTML.
                let nameDiv = document.createElement("b");
                nameDiv.textContent += rowData[i].name;
                plantRow.appendChild(nameDiv);
                plantRow.appendChild(document.createElement("br"));

                let textDiv = document.createElement("div");
                textDiv.textContent = rowData[i].description;
                textDiv.appendChild(document.createElement("br"));
                textDiv.appendChild(document.createTextNode("kr " + rowData[i].price + ",-"));
                
                if(rowData[i].discount > 0) {
                    textDiv.appendChild(document.createElement("br"));
                    
                    let boldElement = document.createElement("b");
                    boldElement.textContent = "Tilbud: ";
                    textDiv.appendChild(boldElement);
                    textDiv.appendChild(document.createTextNode(rowData[i].discount + "%"));
                }

                plantRow.appendChild(textDiv);
                this.#columnClass.appendChild(plantRow);
                plantRow.addEventListener("click", function() {
                    //The encodeURIComponent() function encodes a URI by replacing each instance of 
                    //certain characters by one, two, three, or four escape sequences representing 
                    //the UTF-8 encoding of the character (will only be four escape sequences for 
                    //characters composed of two surrogate characters). 
                    window.location.href = "./plantdetails.html?id=" + 
                    encodeURIComponent(rowData[i].id);
                });
            }
        } else {
            let categoryTitle = document.createElement("h2");
            categoryTitle.classList.add("row");
            categoryTitle.textContent= "Søket ditt returnerte ingen planter.";
            this.#columnClass.appendChild(categoryTitle);
        }
    }
 }