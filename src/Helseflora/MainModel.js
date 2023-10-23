 export default class MainModel {
   #cachedData;
   #hour = 60 * 60 * 1000; //Sixty seconds = 1 minute, 60 minutes = 1 hour, multiply by 1000 to get millisecs.

    constructor() {
        this.#cachedData = localStorage.getItem("plantDataCache");
    }

    async fetchData(url) {
      //Specifying the method isn't neccessary but since we'll have an oral exam in this,
      //let us remind ourselves that we're sending a GET request to the server.
      //Apparently the browser will handle the SSL handshake for us so
      //we don't have to worry about it, we can just use fetch as normal. Nice!
      let response = await fetch(url, { method: "GET" });
      if (!response.ok) 
         throw Error(response.statusText);

      let data = await response.json();
      this.cacheData(data);

      return data;
    }

    cacheData(data) {
      let cacheObject = {
         timeStamp: new Date().getTime(),
         data: data
      }

      //The local storage only supports strings, so stringify...
      localStorage.setItem("plantDataCache", JSON.stringify(cacheObject));

      //Update the private field with the newly cached data.
      this.#cachedData = JSON.stringify(cacheObject);
    }

    //THIS FUNCTION RETURNS NULL IF THE CACHE EXPIRED,
    //SO THE RESULT ALWAYS NEEDS TO BE CHECKED!
    //TODO: Return a CacheResult class...
    getCachedData() {
      //Fetch the cached data from localStorage each time this method is
      //called, to ensure we always have the latest data.
      this.#cachedData = localStorage.getItem("plantDataCache");

      if(!this.#cachedData)
         return null;

      let cache = JSON.parse(this.#cachedData);
      let currentTime = new Date().getTime();
      let cachedTime = cache.timeStamp;

      if((currentTime - cachedTime) <= this.#hour)
         return cache.data;

      //Clear the cached data if it has expired.
      this.#cachedData = null;
      return null;
    }
 }