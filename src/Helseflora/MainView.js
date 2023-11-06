export default class MainView {
    #columnClass;

    constructor() {
        this.#columnClass = document.getElementsByClassName("plantCategoriesColumn")[0];

        //Adapted from Ingrid's code.
        document.getElementsByClassName("btnSearch")[0].addEventListener("click", function() {
            let inputValue = document.getElementById("txtSearch").value;

            if (/^[a-æøåA-ÆØÅ0-9\s]+$/i.test(inputValue) && inputValue !== "") { //Sanity check
                localStorage.setItem("searchword", inputValue);
                window.location.href = "side2.html";
            }
            else
                throw Error("Invalid input detected!"); //TODO: handle error...
        });
    }

    populatePlantCategories(rowData) {
        console.log("MainView.populatePlantCategories():");
        console.log(rowData);
        for(let i = 0; i < rowData.length; i++)  {
            //I'm sure there's a more elegant solution to this, but this works.
            if(rowData[i].name !== "Not categorized") {
                let row = document.createElement("div");
                row.classList.add("plantCategoriesRow"); //Creates a div class.
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
    }
 }