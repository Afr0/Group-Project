export default class MainView {
    #columnClass;

    constructor() {
        this.#columnClass = document.getElementsByClassName("plantCategoriesColumn")[0];

        //Adapted from Ingrid's code.
        document.getElementById("btnSearch").addEventListener("click", function() {
            localStorage.setItem("searchword", document.getElementById("txtSearch").value);
            window.location.href = "side2.html";
        });
    }

    populatePlantCategories(rowData) {
        console.log("MainView.populatePlantCategories():");
        console.log(rowData);
        for(let i = 0; i < rowData.length; i++)  {
            if(rowData[i].name !== "Not categorized") {
                //I'm sure there's a more elegant solution to this, but this works.
                let row = document.createElement("div");
                row.classList.add("plantCategoriesRow"); //Creates a div class.
                row.innerHTML = rowData[i].name;
                row.addEventListener("click", function() {
                    window.location.href = "http://127.0.0.1:5500/Helseflora/plants.html?category=" + 
                    encodeURIComponent(rowData[i].name.toLowerCase());
                });

                this.#columnClass.appendChild(row);
            }
        }
    }
 }