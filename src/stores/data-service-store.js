const Reflux = require('reflux');

/**
 * A store to hook into the app registry to get a data service and
 * provide it to the dynamic stores for each document.
 *
 * We do this not to force a store for each document to be registered
 * in the app registry itself.
 */
const DataServiceStore = Reflux.createStore({

  /**
   * Activate hook.
   *
   * @param {AppRegistry} appRegistry - The app registry.
   */
  onActivated(appRegistry) {
    appRegistry.on('data-service-connected', (err, dataService) => {
      if (!err) {
        this.trigger(dataService);
      }
    });
  }
});

module.exports = DataServiceStore;
