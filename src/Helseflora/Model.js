
/**
 * The Model is the workhorse of the MVC pattern. It is responsible for fetching
/* and caching data needed by the View, as well as reading from the cache.
 */
export default class Model {
   #cachedData;
   #cacheName;
   #hour = 60 * 60 * 1000; //Sixty seconds = 1 minute, 60 minutes = 1 hour, multiply by 1000 to get millisecs.
 
   constructor(nameofCache) {
      this.#cachedData = JSON.parse(localStorage.getItem(nameofCache));
      this.#cacheName = nameofCache;
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
      localStorage.setItem(this.#cacheName, JSON.stringify(cacheObject));
 
      //Update the private field with the newly cached data.
      this.#cachedData = JSON.stringify(cacheObject);
   }
 
   //THIS FUNCTION RETURNS NULL IF THE CACHE EXPIRED,
   //SO THE RESULT ALWAYS NEEDS TO BE CHECKED!
   //TODO: Return a CacheResult class...
   getCachedData() {
      //Fetch the cached data from localStorage each time this method is
      //called, to ensure we always have the latest data.
      this.#cachedData = localStorage.getItem(this.#cacheName);
 
      if(!this.#cachedData)
         return null;
 
      let cache = JSON.parse(this.#cachedData);
      let currentTime = new Date().getTime();
      let cachedTime = cache.timeStamp;
 
      if((currentTime - cachedTime) <= this.#hour)
         return cache.data;
 
      //Clear the cached data if it has expired.
      localStorage.removeItem(this.#cacheName);
      this.#cachedData = null;
      return null;
   }

   #updateCache(cacheName, keyToUpdate, dataToUpdate) {
      let cachedData = localStorage.getItem(cacheName);

      if(cachedData) {
         let cache = JSON.parse(cachedData);
         cache.data[keyToUpdate] = dataToUpdate;

         localStorage.setItem(cacheName, JSON.stringify(cache));

         return true;
      }

      return false;
   }

   /**
   * Gets the growth zone of a plant based on an ID.
   * */
   async getGrowthZone(id) {
      //Note: Because this method is likely ever going to be called by DetailController,
      //      it might, in a different setting, architecturally warrant having a separate
      //      DetailModel class. However, since this is a fairly small project with the 
      //      architecture fairly well defined by the server API and project description,
      //      it'll remain in here.
      try {
         let zoneData = await this.fetchData("https://helseflora.herokuapp.com/botany/plantzones?key=CKXDXF73");
         let zoneDescription = zoneData[id]?.description || null;

         if(zoneDescription)
            this.#updateCache(this.#cacheName, "zone_description", zoneDescription);

         return zoneDescription;
      } catch(error) {
         console.error(error);
         return null;
      }
   }

   static CATEGORY_CACHE_NAME = "plantCategoriesCache";
   static MAIN_CACHE_NAME = "plantDataCache";
   static DETAIL_CACHE_NAME = "plantDetailsCache";
   static CHECKOUT_CACHE_NAME = "checkoutCache";
}