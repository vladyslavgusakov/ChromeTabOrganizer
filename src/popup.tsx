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
      <PrimaryButton text="Organize Tabs" onClick={ (e) => { 
        console.log("Press");
        changeCount();
        chrome.runtime.sendMessage({
          functionName: "exampleFetch",
          data: {},
        });
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
