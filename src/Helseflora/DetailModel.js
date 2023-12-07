import Model from "./Model.js";

/** DetailModel inherits Model. It adds a couple of
 *  methods specific to the DetailView.
 */
export default class DetailModel extends Model {
    constructor(nameOfCache) {
        super(nameOfCache);
    }

    /**Adds a plant to the cart.
    * @param cacheName The name of the cache to update.
    * @param plantToAdd The plant to add to the cart.
    */
    static addPlantToCart(cacheName, plantToAdd) {
        let cachedData = JSON.parse(localStorage.getItem(cacheName));
        if(cachedData) {
            cachedData.data.push(plantToAdd);
            localStorage.setItem(cacheName, JSON.stringify(cachedData));
        } else {
            let newCache = {
                timeStamp: new Date().getTime(),
                data: [plantToAdd]
            };

            localStorage.setItem(cacheName, JSON.stringify(newCache));
        }
    }

    /**
     * Gets the growth zone of a plant based on an ID.
     * @param plantData The plantData to update with the growth zome description.
     * @param id The id of the plant's growth zone.
     * */
    async getGrowthZone(plantData, id) {
        if(this.getCachedData() && this.getCachedData().data[0] && 
           this.getCachedData().data[0].zone_description !== undefined) {
            //Each plant has its own cache so should be index 0.
            console.log("getGrowthZone(): returned cached zone description.");
            return this.getCachedData().data[0].zone_description;
        } else {
            console.log("getGrowthZone(): fetching data.");
            try {
                let zoneData = await this.fetchData("https://helseflora.herokuapp.com/botany/plantzones?key=CKXDXF73");
                let zoneDescription = zoneData[id]?.description || null;

                if(zoneDescription) {
                    plantData[0].zone_description = zoneDescription;
                    this.saveToCache(plantData);
                }

                return zoneDescription;
            } catch(error) {
                console.error(error);
                return null;
            }
        }
    }
}