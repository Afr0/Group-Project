
/**
 * The Model is the workhorse of the MVC pattern. It is responsible for fetching
/* and caching data needed by the View, as well as reading from the cache.
 */
export default class Model {
   #cachedData;
   #cacheName;
   #hour = 60 * 60 * 1000; //Sixty seconds = 1 minute, 60 minutes = 1 hour, multiply by 1000 to get millisecs.
 
   /**Constructs a new Model instance.
    * @param {string} nameofCache Optional name of cache associated with this instance.
    */
   constructor(nameofCache) {
      if(nameofCache) {
         this.#cachedData = JSON.parse(localStorage.getItem(nameofCache));
         this.#cacheName = nameofCache;
      }
   }

   /** Gets this Model instance's cached data.
    * @returns The cached data is an object consisting 
    * of a timestamp property and a data property with 
    * the data (an array of object(s)) itself.
   */
   getCachedData() {
      //Sigh, JS doesn't support protected members, so we're left
      //with getters and setters for inherited classes >_>
      return this.#cachedData;
   }
   
   /**Fetches data from an endpoint, optionally caching it after it was fetched.
    * @param url The URL to the endpoint.
    * @param toCacheOrNotToCache To cache or not to cache, that
    * is the question. Wether 'tis nobler on the web to suffer the slings and 
    * arrows of outrageously narrow bandwidth, or to take action against a sea of
    * troubles, and by opposing, end them. 
    * @returns The data that was fetched.
    */
   async fetchData(url, toCacheOrNotToCache = true) {
      let response = await fetch(url, { method: "GET" });

      if (!response.ok) 
         throw Error(response.statusText);
 
      let data = await response.json();
      //Make a copy, because saveToCache() deletes the thumb property.
      let dataToBeCached = this.#deepCopy(data);

      if(toCacheOrNotToCache)
         this.saveToCache(dataToBeCached);
 
      return data;
   }

   /**POSTs data to an endpoint.
    * @param {string} url The URL to the endpoint.
    * @param dataToPost The data to POST.
    * @param {string} contentType The type of content to POST. Defaults to empty.
    * @param {string} encType Encoding type to use. Defaults to "multipart-formdata".
    * @param {string} authorization Authorization to use. Defaults to empty. If this
    *                               is set, and dataToPost is empty, POST will be sent
    *                               without body. Some authentication schemes such as
    *                               BasicAuthentication requires POSTing without a body.
    * @param {boolean} cacheResponse Wether or not to cache the response. Defaults to true.
    * @returns The response.
    */
   async postData(url, dataToPost, contentType = "", encType = "multipart-formdata", authorization="", 
                  cacheResponse = true) {
      let headers = {};

      if(encType)
         headers["Enc-type"] = encType;
      if(contentType)
         headers["Content-type"] = contentType;
      if(authorization)
         headers["Authorization"] = authorization;

      let body = contentType === "application/json" ? JSON.stringify(dataToPost) : dataToPost;

      let response = (authorization !== null && body === "") ?
         await fetch(url, {
            method: "POST", 
            headers : headers
         }) : 
         await fetch(url, { 
            method: "POST",
            headers : headers,
            body : body,
         });

      if (!response.ok) 
         throw Error(response.statusText);
 
      let data = await response.json();
      delete data.msg; //Don't need this.
      
      if(cacheResponse) {
         //Make a copy, because saveToCache() deletes the thumb property.
         let dataToBeCached = this.#deepCopy(data);
         this.saveToCache(dataToBeCached);
      }
 
      return data;
   }

   /**PUTs data to an endpoint.     
    * @param {string} url The URL to the endpoint.
    * @param dataToPost The data to POST.
    * @param {string} encType Encoding type to use. Defaults to "multipart-formdata".
    * @param {string} authorization Authorization to use. Defaults to empty.
    * @param {boolean} cacheResponse Wether or not to cache the response. Defaults to true.
    * @returns The response.
    * */
   async putData(url, dataToPut, encType = "multipart-formdata", authorization="", 
               cacheResponse = true) {
      let headers = {};

      if(encType)
         headers["Enc-type"] = encType;
      if(authorization)
         headers["Authorization"] = authorization;

      let response = await fetch(url, { 
         method: "PUT",
         headers : headers,
         body : dataToPut,
      });

      if (!response.ok) 
         throw Error(response.statusText);

      let data = await response.json();
      delete data.msg; //Don't need this.

      if(cacheResponse) {
         //Make a copy, because saveToCache() deletes the thumb property.
         let dataToBeCached = this.#deepCopy(data);
         this.saveToCache(dataToBeCached);
      }

      return data;
   }
   
   /**Sends a DELETE verb to an endpoint.    
    * @param {string} url The URL to the endpoint.
    * @param {string} authorization Authorization to use. Defaults to empty.
    * @param {boolean} [deleteUserCache=true] If deleting a user, should its case be deleted? Defaults to true.
    * @returns The response.
    */
   async sendDelete(url, authorization="", deleteUserCache = true) {
      let headers = {};

      if(authorization)
         headers["Authorization"] = authorization;

      let response = await fetch(url, { 
         method: "DELETE",
         headers : headers
      });

      if (!response.ok) 
         throw Error(response.statusText);

      let data = await response.json();

      if(deleteUserCache)
         localStorage.removeItem(Model.USER_CACHE_NAME);

      return data;
   }

   /**Caches data.
    * The data is cached as an object containing a timestamp and the data itself.
    * NOTE: This method used to be private but is now public because JS doesn't 
    * support protected members or methods. >_> Shouldn't be called from anything 
    * but derived classes.
    * @param data data to cache.
    */
   saveToCache(data) {
      let cacheObject = {
         timeStamp: new Date().getTime(),
         data: data
      }

      if(data.hasOwnProperty("logindata")) { //Unify the cache...
         data.record = data.logindata;
         delete data.logindata;

         //Sigh...
         data.record.id = data.record.userid;
         delete data.record.userid;
      }

      try {
         if(data.length > 0) { //User messages aren't in an array... because of course not. >_>
            if(data[0].hasOwnProperty("thumb")) {
               for(let i = 0; i < data.length; i++) {
                  let mimeType = this.#extractMimeType(data[i].thumb);

                  if(mimeType) {
                     this.#storeImgInIndexedDB(data[i].id, 
                        this.#base64toBlob(data[i].thumb, mimeType));
                     delete data[i].thumb;
                  } //In practice, this is never null, so don't waste time by worrying about contingencies.
               }
            }
         } else if(data.hasOwnProperty("record")) {
            let mimeType = this.#extractMimeType(data.record.thumb);

            if(mimeType) {
               this.#storeImgInIndexedDB(data.record.id, 
                  this.#base64toBlob(data.record.thumb, mimeType));
               delete data.record.thumb;
            } //In practice, this is never null, so don't waste time by worrying about contingencies.
         }
      
         //The local storage only supports strings, so stringify...
         localStorage.setItem(this.#cacheName, JSON.stringify(cacheObject));
      } catch(error) {
         //No need to let the exception bubble up, because all that happens 
         //if an item couldn't be stored is that it'll be fetched the next
         //time it's needed.
         console.log("Unable to save to cache: " + error);
      }
 
      //Update the private field with the newly cached data.
      this.#cachedData = cacheObject;
   }

   /**Gets the currently logged in user.
    * @returns The user if it exists (I.E is logged in), or null if it doesn't exist.
    */
   static async getUser() {
      let userModel = new Model(this.USER_CACHE_NAME);
      let user = await userModel.getCache();

      return user;
   }

   /** Logs a user out by deleting his or her cache.
    * @returns True if successful, false otherwise.
    */
   logoutUser() {
      if(localStorage.getItem(Model.USER_CACHE_NAME)) {
         console.log("Removed user!");
         localStorage.removeItem(Model.USER_CACHE_NAME);
         return true;
      } else {
         console.log("User didn't exist!");
         return false;
      }
   }
 
   /**Gets cached data based on the name that this Model was
    * initialized with.
    * @returns The cached data if it existed, or null if it didn't.
    *          If the cached data contains a thumb property, it may
    *          or may not be null, so needs to be checked.
    */
   async getCache() {
      //Fetch the cached data from localStorage each time this method is
      //called, to ensure we always have the latest data.
      this.#cachedData = JSON.parse(localStorage.getItem(this.#cacheName));
      console.log("Retrieving cache: " + this.#cacheName);
 
      if(!this.#cachedData) {
         console.log("Couldn't find cache!");
         return null;
      }
 
      let currentTime = new Date().getTime();
      let cachedTime = this.#cachedData.timeStamp;

      if(this.#cachedData.data.length > 0) {
         //It has a discount prop, so we know it's a plant.
         if(this.#cachedData.data[0].hasOwnProperty("discount")) {
            for(let i = 0; i < this.#cachedData.data.length; i++) {
               try {
                  console.log("Retrieving image with id: " + this.#cachedData.data[i].id);
                  let blob = await this.#retrieveImgFromIndexedDB(this.#cachedData.data[i].id);
                  let base64String = await this.#blobToBase64(blob);
                  this.#cachedData.data[i].thumb = base64String;
               } catch(error) {
                  console.log("getCachedData(): Couldn't retrieve image, setting thumb to null. + \r\n" +
                     error);
                  this.#cachedData.data.thumb = null;
               }
            }
         }
      } else if(this.#cachedData.data.hasOwnProperty("record")) {
         try {
            console.log("Retrieving image with id: " + this.#cachedData.data.record.id);
            let blob = await this.#retrieveImgFromIndexedDB(this.#cachedData.data.record.id);
            let base64String = await this.#blobToBase64(blob);
            this.#cachedData.data.record.thumb = base64String;
         } catch(error) {
            console.log("getCachedData(): Couldn't retrieve image, setting thumb to null. + \r\n" +
               error);
            this.#cachedData.data.record.thumb = null;
         }
      }
      
      if((this.#cacheName !== Model.USER_CACHE_NAME)) {
         if((currentTime - cachedTime) <= this.#hour) {
            console.log("Returning cached data...");
            return this.#cachedData.data;
         }
      } else {
         if((currentTime - cachedTime) <= (this.#hour * 12)) { //User tokens are valid for 12 hours
            console.log("Returning cached data for user...");
            return this.#cachedData.data;
         }
      }
      
      //Clear the cached data if it has expired.
      localStorage.removeItem(this.#cacheName);
      this.#cachedData = null;
      return null;
   }

   //The following image types are used commonly enough to be considered safe for use on web pages:
   //https://developer.mozilla.org/en-US/docs/Web/HTTP/Basics_of_HTTP/MIME_types
   //Only JPEG and PNG are supported by the API to my knowledge, but since we're generalizing this
   //we'll include the others as well.
   #MIME_PREFIXES = {
      //WARNING: DO NOT REMOVE THE LAST COMMA
      'image/apng': 'data:image/apng;base64,',
      'image/avif': 'data:image/avif;base64,',
      'image/gif': 'data:image/gif;base64,',
      'image/jpeg': 'data:image/jpeg;base64,',
      'image/png': 'data:image/png;base64,',
      'image/svg+xml': 'data:image/svg+xml;base64,',
      'image/webp': 'data:image/webp;base64,'
  };

   /**Extracts the MIME type from a base64 string.
    * @returns The MIME type if it was found, or null.
    */
   #extractMimeType(base64Str) {
      let startIndex = base64Str.indexOf("data:") + 5; //+5 to skip past 'data:'
      let endIndex = base64Str.indexOf(";base64");
  
      if (startIndex > 4 && endIndex > -1)
          return base64Str.substring(startIndex, endIndex);

      return null;
   }

   /**Converts a base64-encoded string to a Blob. 
    * @param b64Str The string to convert.
    * @param contentType The contentType, as dictated by the server. 
   */
   #base64toBlob(b64Str, contentType) {
      let byteArrays = [];
      let prefix = this.#MIME_PREFIXES[contentType] || '';

      if (b64Str.startsWith(prefix)) {
         b64Str = b64Str.substring(prefix.length);
      }

      //Decodes a b64 string to bytes: https://developer.mozilla.org/en-US/docs/Web/API/atob
      let byteChars = atob(b64Str);

      //Convert the bytes into chunks of 512. This is a performance
      //optimization...
      for (let offset = 0; offset < byteChars.length; offset += 512) {
         let slice = byteChars.slice(offset, offset + 512);
         
         let byteNumbers = new Array(slice.length);
         for (let i = 0; i < slice.length; i++) {
             byteNumbers[i] = slice.charCodeAt(i);
         }
         
         //... because we're dealing with potentially relatively
         //large amounts of data, creating a Uint8Array of an entire
         //image can be memory intensive.
         let byteArray = new Uint8Array(byteNumbers);
         byteArrays.push(byteArray);
     }
     
     //A Blob is a file-like object of immutable, raw data. Kinda like a
     //MemoryStream in C#.
     return new Blob(byteArrays, { type: contentType });
   }
   
   /**Converts a Blob to a base64-encoded string.
    * The resulting string will have the correct data
    * URI scheme.
    * @param blob The Blob to convert.
    */
   #blobToBase64(blob) {
      return new Promise((resolve, reject) => {
         let reader = new FileReader();
         reader.onloadend = () => resolve(reader.result);
         reader.onerror = function () {
            //Reject won't throw an error, but simply create a (rejected) Promise
            //containing the supplied reason.
            reject(reader.error);
         }
         //readAsDataURL automagically adds MIME type.
         reader.readAsDataURL(blob);
      });
   }  

   /**Stores an image in IndexedDB.
    * @param key The key of the image to store.
    * @param blob The blob of the image to store.
    */
   #storeImgInIndexedDB(key, blob) {
      const request = indexedDB.open(Model.IMAGE_CACHE_NAME);
      
      //This handler is called when a new version of the database
      //is created, either when one has not been created before
      //or when a new version number is submitted by calling
      //window.indexedDB.open():
      //https://developer.mozilla.org/en-US/docs/Web/API/IDBOpenDBRequest/upgradeneeded_event
      request.onupgradeneeded = function(event) {
         console.log("storeImgInIndexedDB(): Upgrade was needed - creating object store.");
         let db = event.target.result;
         db.createObjectStore(Model.IMAGE_STORE_NAME);
      };
  
      request.onsuccess = function(event) {
         let db = event.target.result;
         let transaction = db.transaction(Model.IMAGE_STORE_NAME, 'readwrite');
         let store = transaction.objectStore(Model.IMAGE_STORE_NAME);
         store.put(blob, key);
      };
      
      //Let's log the error to the console, but it's not crucial,
      //because we're going to fetch the image if it can't be found.
      request.onerror = function(event) {
         console.error('Error opening IndexedDB:', event.target.error);
      };
   }

   /**Retrieves an image from IndexedDB.
    * @param key The key of the image to retrieve.
    * @returns A Promise that contains the image if
    *          successfully retrieved, or the rejected
    *          Promise with a reason for rejection in
    *          case the image couldn't be retrieved.
    */
   #retrieveImgFromIndexedDB(key) {
      return new Promise((resolve, reject) => {
         let request = indexedDB.open(Model.IMAGE_CACHE_NAME);

         request.onsuccess = function(event) {
           let db = event.target.result;

           let transaction = db.transaction(Model.IMAGE_STORE_NAME, 'readonly');
           let store = transaction.objectStore(Model.IMAGE_STORE_NAME);
           //store.get() returns a Promise.
           let getRequest = store.get(key);

           getRequest.onsuccess = function() {
               resolve(getRequest.result);
           };

           getRequest.onerror = function() {
               reject(getRequest.error);
           };
         };

         request.onerror = function(event) {
           reject(event.target.error);
         };
      });
   }

   /**Deep copies an object/array/Date instance using recursion.
    * @param item The object to deep copy.
    * @return A deep copy of the object.
    */
   #deepCopy(item) {
      if (item === null || typeof item !== 'object')
          //Primitive value (including null and undefined): return as is
          return item;
  
      //Handle Date objects
      if (item instanceof Date)
         return new Date(item.getTime());
  
      if (Array.isArray(item)) {
         //Array: create a new array and deep copy each element
         const result = [];
         for (const element of item) {
            result.push(this.#deepCopy(element));
         }
         return result;
      }
  
      if (item instanceof Object) {
         //Object: create a new object and deep copy each property
         const result = {};
         for (const [key, value] of Object.entries(item)) {
            result[key] = this.#deepCopy(value);
         }
         return result;
      }
  
      return item;
  }

   static CATEGORY_CACHE_NAME = "plantCategoriesCache";
   static MAIN_CACHE_NAME = "plantDataCache";
   static DETAIL_CACHE_NAME = "plantDetailsCache";
   static CHECKOUT_CACHE_NAME = "checkoutCache";
   static SHOPPINGCART_CACHE_NAME = "cart"; //Name doesn't conform, but was chosen by Ingrid.
   static USER_CACHE_NAME = "user";
   static IMAGE_CACHE_NAME = "images";
   static IMAGE_STORE_NAME = "imageStore";
}