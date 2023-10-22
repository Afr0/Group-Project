 export default class MainModel {
   #cachedData;
   #hour = 60 * 60 * 1000; //Sixty seconds = 1 minute, 60 minutes = 1 hour, multiply by 1000 to get millisecs.

    constructor() {
        this.#cachedData = localStorage.getItem("plantDataCache");
    }

    fetchData() {
      //Specifying the method isn't neccessary but since we'll have an oral exam in this,
      //let us remind ourselves that we're sending a GET request to the server.
      //Apparently the browser will handle the SSL handshake for us so
      //we don't have to worry about it, we can just use fetch as normal. Nice!
      fetch("https://sukkergris.no/plantcategories/", {method: "GET"})
         .then(response => {
            if (!response.ok) 
               throw Error(response.statusText);

            return response.json(); //fetch() returns a promise (asynchronously), which when resolved will contain JSON data.
         }).then(data => { 
            this.cacheData(data);
            return data;
         });
    }

    cacheData(data) {
      let cacheObject = {
         timeStamp: new Date().getTime(),
         data: data
      }

      //The local storage only supports strings, so stringify...
      localStorage.setItem("plantDataCache", JSON.stringify(cacheObject));
    }

    //THIS FUNCTION RETURNS NULL IF THE CACHE EXPIRED,
    //SO THE RESULT ALWAYS NEEDS TO BE CHECKED!
    //TODO: Return a CacheResult class...
    getCachedData() {
      if(!this.#cachedData)
         return null;

      let cache = JSON.parse(this.#cachedData);
      let currentTime = new Date().getTime();
      let cachedTime = cache.timeStamp;

      if((currentTime - cachedTime) <= this.#hour)
         return cache.data;

      return null;
    }
 }