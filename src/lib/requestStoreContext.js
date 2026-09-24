const { AsyncLocalStorage } = require('async_hooks');

const storeContext = new AsyncLocalStorage();

function runWithSessionStore(sessionId, callback) {
  if (!sessionId) {
    throw new Error('Session ID required');
  }

  return storeContext.run(sessionId, callback);
}

function getCurrentSessionId() {
  return storeContext.getStore();
}

module.exports = {
  runWithSessionStore,
  getCurrentSessionId,
};