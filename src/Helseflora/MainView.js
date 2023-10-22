export default class MainView {
    #columnClass;

    constructor() {
        this.#columnClass = document.getElementsByClassName("plantCategoriesColumn")[0];
    }

    populatePlantCategories(rowData) {
        for(let i = 0; i < rowData.length; i++)  {
            let row = document.createElement("div");
            row.classList.add("plantCategoriesRow"); //Creates a div class.
            row.innerHTML = rowData[i].kategori;
            row.addEventListener("click", function() {
                window.location.href = "http://127.0.0.1:5500/Helseflora/plants.html?category=" + 
                encodeURIComponent(rowData[i].kategori.toLowerCase());
            });

            this.#columnClass.appendChild(row);
        }
    }
 }