
// chache list of monitored topics here so we don't need to 
// fetch it again for removing.
var monitoredTopicsCache = [];

function removeMonitoredTopic(url, id)
{
    for( i=0; i<monitoredTopicsCache.length; ++i )
    {
        if (monitoredTopicsCache[i].url == url)
        {
            console.log("Removing monitored item " + url);
            monitoredTopicsCache.splice(i,1);
            browser.storage.local.set({monitored_topics: monitoredTopicsCache});
        }
    }
// It does not look like we need to remove the element from the popup webpage
// It will get refreshed on click
//     var nodeToBeRemoved = document.getElementById("monitored_item_num_" + id);
//     nodeToBeRemoved.parentNode.removeChild(nodeToBeRemoved);
}


function onPopupStoredDataGot( item )
{
    var respondedPostsTableNode = document.getElementById("responded_posts");
    var waitingPostsTableNode = document.getElementById("waiting_posts");
    console.log("onPopupStoredDataGot");
    var monitoredTopics = item.monitored_topics;
    monitoredTopicsCache = monitoredTopics;
    console.log(monitoredTopics);

    if (!monitoredTopics) return;

    for( i=0; i<monitoredTopics.length; ++i )
    {
        console.log("Stored topic: " + monitoredTopics[i].description + " " + monitoredTopics[i].comment_count);
        let monitoredItemNode = document.createElement('tr');
        monitoredItemNode.className = "monitored_item";
        monitoredItemNode.id = "monitored_item_num_" + i;   // Unique id so we can find it when removing

        let countNode = document.createElement('td');
        let countNodeCleanHTML = DOMPurify.sanitize("" + monitoredTopics[i].comment_count);
        countNode.innerHTML = countNodeCleanHTML;

        let urlNode = document.createElement('td');
        let urlNodeCleanHTML = DOMPurify.sanitize(
            "<a href='https://www.reddit.com" 
            + monitoredTopics[i].url + "' target='_blank' >"
            + monitoredTopics[i].description + "</a>");
        urlNode.innerHTML = urlNodeCleanHTML;

        let removeNode = document.createElement('td');
        let removeNodeCleanHTML = DOMPurify.sanitize("<a href=''>Remove</a>");
        removeNode.innerHTML = removeNodeCleanHTML;
        let url = monitoredTopics[i].url;
        let index = i;
        removeNode.onclick = function() {
            removeMonitoredTopic(url, index);
        };


        monitoredItemNode.appendChild(countNode);
        monitoredItemNode.appendChild(urlNode);
        monitoredItemNode.appendChild(removeNode);

        if (monitoredTopics[i].comment_count > 0)
        {
            respondedPostsTableNode.appendChild(monitoredItemNode);
        }
        else
        {
            waitingPostsTableNode.appendChild(monitoredItemNode);
        }
    }
}

var storagePromise = browser.storage.local.get("monitored_topics");
storagePromise.then(onPopupStoredDataGot);

