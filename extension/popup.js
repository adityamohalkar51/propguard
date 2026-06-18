// popup.js
const PROPGUARD_API = 'https://propguard-nu.vercel.app/api/sync';

document.addEventListener('DOMContentLoaded', async () => {
  const { accountId, autoSync } = await chrome.storage.local.get(['accountId', 'autoSync']);
  if (accountId) document.getElementById('accountId').value = accountId;

  const connectBtn = document.getElementById('connectBtn');
  const autoSyncBtn = document.getElementById('autoSyncBtn');
  const indicator = document.getElementById('indicator');

  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  const isFTMO = tab?.url?.includes('ftmo.com') || tab?.url?.includes('mt5webterminal') || tab?.url?.includes('metatraderweb') || tab?.url?.includes('fundednext') || tab?.url?.includes('the5ers');

  if (!isFTMO) {
    showStatus('Please open FTMO MetriX page first', 'error');
    connectBtn.disabled = true;
    return;
  }

  connectBtn.addEventListener('click', async () => {
    const accountId = document.getElementById('accountId').value.trim();
    if (!accountId) { showStatus('Enter Account ID', 'error'); return; }

    await chrome.storage.local.set({ accountId });
    indicator.className = 'sync-indicator syncing';
    connectBtn.disabled = true;
    showStatus('Fetching trades from FTMO API...', 'info');

    try {
      // Get FTMO login ID from URL
      const ftmoLogin = tab.url.match(/metrix\/(\d+)/)?.[1];
      if (!ftmoLogin) { throw new Error('Open trader.ftmo.com/metrix/YOUR_ID page'); }

      // Fetch directly from FTMO API using browser session cookies
      const results = await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        func: async (login) => {
          try {
            const r = await fetch(`https://gw2.ftmo.com/api/v1/metrix/${login}`, {
              credentials: 'include'
            });
            const data = await r.json();
            return { success: true, data };
          } catch(e) {
            return { success: false, error: e.message };
          }
        },
        args: [ftmoLogin]
      });

      const result = results[0]?.result;
      if (!result?.success) throw new Error(result?.error || 'FTMO API failed');

      const metrixData = result.data;

      // Now fetch deals
      const dealsResult = await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        func: async (login) => {
          try {
            const r = await fetch(`https://gw2.ftmo.com/api/v1/metrix/${login}/deals?limit=100`, {
              credentials: 'include'
            });
            const data = await r.json();
            return { success: true, data };
          } catch(e) {
            return { success: false, error: e.message };
          }
        },
        args: [ftmoLogin]
      });

      const dealsData = dealsResult[0]?.result;
      const deals = dealsData?.success ? dealsData.data : [];

      showStatus(`Found account data. Syncing...`, 'info');

      // Send to PropGuard
      const response = await fetch(`${PROPGUARD_API}/trades`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ accountId, trades: deals, metrix: metrixData })
      });

      const syncResult = await response.json();
      if (syncResult.success) {
        indicator.className = 'sync-indicator online';
        showStatus(`Synced successfully!`, 'synced');
        document.getElementById('tradeCount').textContent = deals?.length || 0;
        document.getElementById('lastSync').textContent = new Date().toLocaleTimeString();
        document.getElementById('stats').style.display = 'grid';
        await chrome.storage.local.set({ lastSync: new Date().toISOString(), lastTradeCount: deals?.length || 0 });
      } else {
        throw new Error(syncResult.error || 'Sync failed');
      }
    } catch (err) {
      indicator.className = 'sync-indicator offline';
      showStatus('Error: ' + err.message, 'error');
    } finally {
      connectBtn.disabled = false;
    }
  });

  // Restore stats
  const { lastSync, lastTradeCount } = await chrome.storage.local.get(['lastSync', 'lastTradeCount']);
  if (lastSync) {
    document.getElementById('lastSync').textContent = new Date(lastSync).toLocaleTimeString();
    document.getElementById('tradeCount').textContent = lastTradeCount || 0;
    document.getElementById('stats').style.display = 'grid';
  }
});

function showStatus(message, type) {
  const status = document.getElementById('status');
  status.textContent = message;
  status.className = 'status show ' + type;
}
