chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === "initiate-capture") {
        chrome.desktopCapture.chooseDesktopMedia(["screen", "window"], sender.tab, (streamId) => {
            if (streamId) {
                chrome.tabs.sendMessage(sender.tab.id, { action: "start-recording", streamId: streamId });
            } else {
                console.log("User cancelled the screen selection dialog.");
            }
        });
    }
});
