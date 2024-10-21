import { OperationQueue } from "./operation_queue";

function polling() {
  console.log("polling")
  setTimeout(polling, 1000 * 30)
}

polling()

/// Example: ['YouTube': ]
let tabNameToTabGroupId = new Map<string, string>();
let currentActiveTab: chrome.tabs.Tab | undefined

let operationQueue = new OperationQueue()

// Lifecycle
chrome.runtime.onStartup.addListener( () => {
  console.log('Startup')
  operationQueue.enqueue(organizeAllTabs)
});

// Tabs
// chrome.tabs.onCreated.addListener( (tab) => {
//   console.log("Tab created", tab.title)

//   operationQueue.enqueue(async () => { 
//     await organizeTab(tab)
//   })
// });

chrome.tabs.onUpdated.addListener((tabId, changeInfo, changedTab) => {
  if (changeInfo.status === 'complete') {
    operationQueue.enqueue(async () => {
      await organizeTab(changedTab)
    })

    operationQueue.enqueue(async () => {
      await closeInactiveTabGroups(changedTab)
    })
  }
});

chrome.tabs.onActivated.addListener((activeInfo) => {
  operationQueue.enqueue(async () => {
    await activeTabChanged(activeInfo.tabId)
  })
})

async function activeTabChanged(tabId: number) {
  console.log('Active tab changed, querying tab by id: ', tabId)

  let tab = await chrome.tabs.get(tabId)
  console.log('Active tab changed: ' + tab.title)

  await closeInactiveTabGroups(tab)
  currentActiveTab = tab
}

async function getAllWindows(): Promise<chrome.windows.Window[]> {
  return new Promise((resolve, reject) => {
    chrome.windows.getAll({}, (windows) => {
      if (chrome.runtime.lastError) {
        reject(chrome.runtime.lastError);
      } else {
        resolve(windows);
      }
    });
  });
}

async function getTabsInWindow(windowId: number): Promise<chrome.tabs.Tab[]> {
  return new Promise((resolve, reject) => {
    chrome.tabs.query({ windowId }, (tabs) => {
      if (chrome.runtime.lastError) {
        reject(chrome.runtime.lastError);
      } else {
        resolve(tabs);
      }
    });
  });
}

async function organizeAllTabs() {
  console.log('Organizing tabs')
  let tabs = await chrome.tabs.query({})
  tabs.forEach(organizeTab)
}

async function organizeTab(tab: chrome.tabs.Tab) {
  console.log("[Begin] Organizing tab: ", tab.title ?? "<n/a>")
  if (tab.id == null) { return }
  if (tab.pinned) { return } // do not organize pinned tabs

  /// Example: 'YouTube'
  let tabGroupName = getTabGroupName(tab)

  // Try to find an existing tab group for the tab, i.e. 'https://youtube.com' => 'YouTube'
  console.log("Querying tab groups")
  let tabGroups = (await chrome.tabGroups.query({ windowId: tab.windowId })).filter( (tabGroup) => {
    return tabGroup.title == tabGroupName
  })

  let tabGroup = first(tabGroups)

  if (tabGroup != null) {
    console.log("Will move to tab group: ", tabGroup.title)
    moveToTabGroup(tab.id, tabGroup.id, tab.title, tabGroup.title)
  } else if (tabGroupName != null) {
    console.log("Will create a new tab group: ", tabGroupName)
    createTabGroupForTab(tab, tabGroupName)
  }

  console.log("[End] Finished organizing tab: ", tab.title ?? "<n/a>")
}

async function createTabGroupForTab(tab: chrome.tabs.Tab, tabGroupName: string) {
  console.log("Querying tab group for a new tab group")
  let newTabGroupId = await chrome.tabs.group({ createProperties: { windowId: tab.windowId }, tabIds: tab.id })

  console.log("Updating tab groups")

  await chrome.tabGroups.update(newTabGroupId, {
      title: tabGroupName
  });

  // tabGroupNameToTabGroupId[tabGroupName] = newTabGroupId;
}

function moveToTabGroup(tabId: number, groupId: number, tabName: string | undefined, groupName: string | undefined) {
  console.log("Grouping tabs")

  chrome.tabs.group({
    groupId: groupId, // Use the existing group ID
    tabIds: tabId     // The tab ID that you want to move to the group
  }, (newGroupId) => {
    console.log(`Tab "${tabName}" moved to group "${groupName}"`);
  });
}

function getTabGroupName(tab: chrome.tabs.Tab): string | undefined {
  let urlString = tab.url

  if (!urlString) { // New tab
    return undefined
  }

  let url = new URL(urlString)
  let hostname = url.hostname // "blog.example.com"
  let components = hostname.split(".") // ["blog", "example", "com"]

  let filteredComponents = components.filter( (component: string) => {
    return component != "www"
  })

  let name = first(filteredComponents) // prioritize subdomain name over domain

  if (name == 'newtab' || name == null) {
    return undefined
  }
  return capitalizeWords(name);
}

function first<T>(arr: T[]): T | undefined {
  return arr.length > 0 ? arr[0] : undefined;
}

function capitalize(str: string): string {
  if (str.length === 0) return str;
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

function capitalizeWords(str: string): string {
  return str
    .split(" ")
    .map(word => capitalize(word))
    .join(" ");
}

async function closeInactiveTabGroups(activeTab: chrome.tabs.Tab | undefined): Promise<void> {
  // console.log("Attempting to close inactive tab groups...")

  // if (!activeTab) {
  //   console.log("Failed to close inactive tab groups, active tab is missing")
  //   return
  // }

  // if (currentActiveTab && currentActiveTab.groupId === activeTab.groupId) {
  //   console.log("Failed to close inactive tab groups, current active tab group didn't change")
  //   return
  // }

  // const activeGroupId = activeTab.groupId

  // // Querying for non-collapsed tab groups
  // const tabGroups = await chrome.tabGroups.query({ collapsed: false })

  // console.log('Will close inactive tab groups: ' + tabGroups.length)

  // // Close inactive tab groups
  // for (const group of tabGroups) {
  //   if (group.id !== activeGroupId) {
  //     console.log("Will collapse tab groups")
  //     await chrome.tabGroups.update(group.id, { collapsed: true })
  //   }
  // }

  closeInactiveTabGroupsNew(activeTab)

  currentActiveTab = activeTab
}

async function closeInactiveTabGroupsNew(activeTab: chrome.tabs.Tab | undefined): Promise<void> {
  console.log("Attempting to close inactive tab groups...")

  if (!activeTab) {
    console.log("Failed to close inactive tab groups, active tab is missing")
    return
  }

  if (currentActiveTab && currentActiveTab.groupId === activeTab.groupId) {
    console.log("Failed to close inactive tab groups, current active tab group didn't change")
    return
  }

  const activeGroupId = activeTab.groupId;
  const tabGroups = await chrome.tabGroups.query({ collapsed: false });
  await delay(100);

  console.log('Will close inactive tab groups: ' + tabGroups.length);

  // Loop through each tab group and collapse it with a delay
  for (const group of tabGroups) {
    if (group.id !== activeGroupId) {
      console.log("Will collapse tab group with id:", group.id);
      await chrome.tabGroups.update(group.id, { collapsed: true });
      // Add a delay of 100ms between each collapse
      // await delay(300);
    }
  }
}

// async function collapseTabGroupsInBatches(groups: chrome.tabGroups.TabGroup[], activeGroupId: number, batchSize: number = 5): Promise<void> {
//   // Filter groups that aren't active
//   const groupsToCollapse = groups.filter(group => group.id !== activeGroupId);

//   for (let i = 0; i < groupsToCollapse.length; i += batchSize) {
//     // Select a batch of groups
//     const currentBatch = groupsToCollapse.slice(i, i + batchSize);

//     // Create and run all promises in the current batch
//     await Promise.all(
//       currentBatch.map(group => {
//         console.log("Collapsing tab group with id:", group.id);
//         return chrome.tabGroups.update(group.id, { collapsed: true });
//       })
//     );
//   }
// }

function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}