
console.log("background started 1");

// var testData = [{description:"Some topic", url:"/r/AskHistorians/blah", comment_count: 0},
//                 {description:"Another question", url:"/r/AskHistorians/bloh", comment_count: 1},
//                 {description:"Third question", url:"/r/AskHistorians/bleh", comment_count: 3}
//                ];
// 
// browser.storage.local.set({monitored_topics: testData});


function onMonitoredTopicsLoad( item )
{
    var respondedCount = 0;
    console.log("onMonitoredTopicsLoad");
    var monitoredTopics = item.monitored_topics;
    console.log(monitoredTopics);

    if (!monitoredTopics) return;

    for( i=0; i<monitoredTopics.length; ++i )
    {
        console.log("Stored topic: " + monitoredTopics[i].description + " " + monitoredTopics[i].comment_count);
        let commentCount = getCommentCount(monitoredTopics[i].url);
        monitoredTopics[i].comment_count = parseInt(commentCount.topLevelComments, 10);
        if (monitoredTopics[i].comment_count>0)
        {
            respondedCount += 1;
        }
    }

    if (respondedCount > 0)
    {
        console.log("respondedCount " + respondedCount);
        browser.browserAction.setBadgeBackgroundColor({ color: [200, 200, 200, 255] });
        browser.browserAction.setBadgeText({text: respondedCount.toString()});
    }
    else
    {
        console.log("No responded topics");
        browser.browserAction.setBadgeText({text: ""});
    }

    // Save updated list
    browser.storage.local.set({monitored_topics: monitoredTopics});
}

function startMonitoredTopicsRefresh()
{
    // Load locally stored topics, continue
    var storagePromise = browser.storage.local.get("monitored_topics");
    storagePromise.then(onMonitoredTopicsLoad);
}


startMonitoredTopicsRefresh();

// Refresh all monitored topics every 6 hours
var refreshTimer = setInterval(startMonitoredTopicsRefresh, 1000*60*60*6);
