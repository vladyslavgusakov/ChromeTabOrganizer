function polling() {
  console.log("polling");
  setTimeout(polling, 1000 * 30);
}

polling();

chrome.tabs.onCreated.addListener( (tab) => {
  console.log("hi", tab.title); 
})

chrome.runtime.onMessage.addListener((func,
  sender,
  sendResponse) => {
  processContentScriptFunctions(func, sender, sendResponse);
});

// todo improve types here
async function processContentScriptFunctions(
  func: any,
  sender: chrome.runtime.MessageSender,
  sendResponse: any
) {
  console.log("processContentScriptFunctions", func);
  let msg = {
    functionName: func.functionName,
    data: "",
  };
  
  console.log("func name: ", func.functionName);

  switch (func.functionName) {
    case "exampleFetch":
      msg.data = await exampleFetch();

      console.log("Did fetch: ", msg.data);
      console.log("Tab id: ", sender.tab?.id);
      
      chrome.tabs.sendMessage(sender.tab?.id || -1, msg);
      break;
    default:
      break;
  }
}

async function exampleFetch() {
  //gen a random number between 1 and 10
  const randomNum = Math.floor(Math.random() * 10) + 1;
  return fetch(`https://jsonplaceholder.typicode.com/users/${randomNum}`).then(
    (response) => response.json()
  );
}
