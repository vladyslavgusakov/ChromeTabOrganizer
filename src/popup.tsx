import React, { useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import PrimaryButton from "./PrimaryButton";

const Popup = () => {
  const [count, setCount] = useState(0);
  const [currentURL, setCurrentURL] = useState<string>();

  useEffect(() => {
    chrome.action.setBadgeText({ text: count.toString() });
  }, [count]);

  useEffect(() => {
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
      setCurrentURL(tabs[0].url);
    });
  }, []);

  const changeCount = () => {
    console.log("Change count");
    setCount(count + 1);
  };

  const changeBackground = () => {
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
      const tab = tabs[0];
      if (tab.id) {
        chrome.tabs.sendMessage(
          tab.id,
          {
            color: "#555555",
          },
          (msg) => {
            console.log("result message:", msg);
          }
        );
      }
    });
  };

  const divStyle = {
    backgroundColor: "lightblue",
    padding: "20px",
    borderRadius: "10px",
  };

  return (
    <div style={divStyle}>
      <title>Tab Organizer</title>
      <PrimaryButton text="Close duplicate tabs" onClick={ (e) => { 
        console.log("Press");
        changeCount();
        chrome.runtime.sendMessage({
          functionName: "exampleFetch",
          data: {},
        });
        closeDuplicateTabs()
      }}/>
      {/* <button
        onClick={changeCount}
        style={{ marginRight: "5px" }}
      >
        Organize Tabs
      </button> */}
    </div>
  );
};

const root = createRoot(document.getElementById("root")!);

root.render(
  <React.StrictMode>
    <Popup />
  </React.StrictMode>
);

async function closeDuplicateTabs(): Promise<void> {
  // Step 1: Query all open tabs
  const allTabs = await new Promise<chrome.tabs.Tab[]>((resolve, reject) => {
    chrome.tabs.query({}, (tabs) => {
      if (chrome.runtime.lastError) {
        reject(chrome.runtime.lastError);
      } else {
        resolve(tabs);
      }
    });
  });

  // Step 2: Detect duplicates by URL
  const uniqueTabs = new Map<string, chrome.tabs.Tab>(); // URL as key and a tab as value

  for (const tab of allTabs) {
    if (tab.url) {
      if (uniqueTabs.has(tab.url)) {
        // Found a duplicate
        const originalTab = uniqueTabs.get(tab.url);
        if (originalTab) {
          // Keep the first occurrence and close subsequent duplicates
          await closeTab(tab.id);
        }
      } else {
        // Add the tab to the map if it's unique
        uniqueTabs.set(tab.url, tab);
      }
    }
  }

  console.log('Duplicate tabs closed successfully');
}

// Helper function to close a tab by its ID
async function closeTab(tabId?: number): Promise<void> {
  if (tabId === undefined) return;

  return new Promise((resolve, reject) => {
    chrome.tabs.remove(tabId, () => {
      if (chrome.runtime.lastError) {
        reject(chrome.runtime.lastError);
      } else {
        resolve();
      }
    });
  });
}

// Example function call to close duplicate tabs
// closeDuplicateTabs().catch((error) => console.error('Error closing duplicate tabs:', error));