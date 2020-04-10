
function addMonitoredTopic(url)
{
    console.log("addMonitoredTopic " + url);
    let commentCount = getCommentCount(url);

    var storagePromise = browser.storage.local.get("monitored_topics");
    storagePromise.then( (item) => {
            var monitoredTopics = item.monitored_topics;
            if (!monitoredTopics)
            {
                console.log("First monitored topic");
                monitoredTopics = [];
            }

            if (monitoredTopics.length >= 10)
            {
                window.alert("Max 10 monitored topics allowed!");
                return;
            }
            for (var i=0; i<monitoredTopics.length; i++)
            {
                if (monitoredTopics[i].url == url)
                {
                    window.alert("Thread already monitored!");
                    return;
                }
            }

            console.log("addMonitoredTopic new topic: " + url + " : " 
                        + commentCount.title);
            monitoredTopics.push({description:commentCount.title, 
                                  url:url, 
                                  comment_count: commentCount.topLevelComments});
            browser.storage.local.set({monitored_topics: monitoredTopics});
        },
        (result) => {
            console.log("addMonitoredTopic fail: " + result);
        }
    );
}

function createMonitorNode(text, dataUrl)
{
    let monitorNode = document.createElement('a');
    monitorNode.href = "javascript: void 0;";
    monitorNode.innerHTML = DOMPurify.sanitize(text);
    monitorNode.onclick = function() {
        let event = new CustomEvent('monitortopic', { detail: {url: dataUrl} });
        this.dispatchEvent(event);
    };
    monitorNode.addEventListener('monitortopic', function (e) { addMonitoredTopic(e.detail.url); }, false);

    return monitorNode;
}

function setStatusNodeData(statusNode, commentCount)
{
    statusNode.title = "Top level comments: " + commentCount.topLevelComments + "\nMod comments: " + commentCount.topLevelCommentsMod + "\nDeleted top level comments: " + commentCount.topLevelCommentsDeleted;
    let statusNodeCleanHTML = "";
    if (commentCount.topLevelComments>0)
    {
        statusNodeCleanHTML = DOMPurify.sanitize(" (👑 " + commentCount.topLevelComments + ")");
    }
    else
    {
        statusNodeCleanHTML = DOMPurify.sanitize(" (" + commentCount.topLevelComments + ")");
    }
    statusNode.innerHTML = statusNodeCleanHTML;
    statusNode.setAttribute('style', 'font-weight:bold !important; color:green !important;');
}


function oldRedditAskHistoriansCommentFix(maxNumberOfFixes)
{
    var threadLinkDivs = document.getElementsByClassName("thing"); // "thing" is the class used to mark an item in old reddit
  
    //var urls = "";
    let numFixedUrls = 0;
  
    for (var i=0; i<threadLinkDivs.length; i++)
    {
        let dataUrlAttr = threadLinkDivs[i].attributes.getNamedItem("data-url");
        //dataUrl = threadLinkDivs[i].attributes;
        if (dataUrlAttr != null)
        {
            let dataUrl = dataUrlAttr.value;
            if (dataUrl.startsWith("/r/AskHistorians/comments/"))
            {
                //urls += dataUrl + "\n";
                let titleSpan = findChildByClass(threadLinkDivs[i], "first");
                if (titleSpan != null)
                {
                    if (findChildByClass(titleSpan, "AHCommentFix") != null)
                    {
                        continue;  // This topic has already been fixed. Continue to the next one.
                    }

                    //console.log(dataUrl);

                    // Add status node with AHCommentFix before doing
                    // async getCommentCount. Otherwise multiple calls 
                    // can update the same topic
                    let statusNode = document.createElement('a');
                    statusNode.className = "AHCommentFix";  // This class lets us know we already fixed this link
                    titleSpan.appendChild(statusNode);

                    let commentCount = getCommentCount(dataUrl)
                    setStatusNodeData(statusNode, commentCount);

                    let monitorNode = createMonitorNode(" monitor", dataUrl);
                    titleSpan.appendChild(monitorNode);

                    numFixedUrls += 1;
                }
                if (numFixedUrls >= maxNumberOfFixes)
                {
                    break;
                }
            }
        }
    }
  
    //console.log("Old Reddit number of links " + threadLinkDivs.length);
    return threadLinkDivs.length;
}


function newRedditGetCommentAnchor(node)
{
    var allChildren = getAllChildNodes(node);

    for (var i = 0; i < allChildren.length; i++)
    {
        var childNode = allChildren[i];
        //console.log("New reddit tag " + allChildren[i].tagName);
        if (childNode.tagName == "A")
        {
            var dataClickIdAttr = childNode.attributes.getNamedItem("data-click-id");
            if (dataClickIdAttr == null) continue;
            if (dataClickIdAttr.value != "comments") continue;
          
            var url = childNode.attributes.getNamedItem("href");
            //console.log("New reddit anchor " + url.value);
            return childNode;
        }
    }

    return null;
    
}

function newRedditAskHistoriansCommentFix(maxNumberOfFixes)
{
    var threadLinkDivs = document.getElementsByClassName("scrollerItem");	// "scrollerItem" is the class used to mark an item in new reddit

    let numFixedUrls = 0;

    for (var i=0; i<threadLinkDivs.length; i++)
    {
        let commentAnchor = newRedditGetCommentAnchor(threadLinkDivs[i]);
        if (commentAnchor == null) continue;

        let dataUrl = commentAnchor.attributes.getNamedItem("href").value; 
        if (dataUrl.startsWith("/r/AskHistorians/comments/"))
        {
            if (findChildByClass(commentAnchor, "AHCommentFix") != null)
            {
                //console.log("New reddit already fixed ");
                continue;  // This topic has already been fixed. Continue to the next one.
            }

            //console.log(dataUrl);

            // Add status span with AHCommentFix before doing
            // async getCommentCount. Otherwise multiple calls 
            // can update the same topic
            let statusNode = document.createElement('span');
            statusNode.className = "AHCommentFix";  // This class lets us know we already fixed this link
            commentAnchor.appendChild(statusNode);
            let commentCount = getCommentCount(dataUrl)
            setStatusNodeData(statusNode, commentCount);

            let monitorNode = createMonitorNode(" Monitor", dataUrl);
            commentAnchor.parentNode.insertBefore(monitorNode, commentAnchor.nextSibling);

            numFixedUrls += 1;
        }
        if (numFixedUrls >= maxNumberOfFixes)
        {
            break;
        }
    }

    //console.log("New Reddit number of links " + threadLinkDivs.length);
    return 0; 
}

function mobileRedditAskHistoriansCommentFix(maxNumberOfFixes)
{
    var threadLinkDivs = document.getElementsByClassName("Post");	// "Post" is the class used to mark an item in mobile reddit

    let numFixedUrls = 0;

    for (var i=0; i<threadLinkDivs.length; i++)
    {
        let commentAnchor = findChildByClass(threadLinkDivs[i], "PostFooter__comments-link");
        if (commentAnchor == null) continue;

        let dataUrl = commentAnchor.attributes.getNamedItem("href").value; 
        if (dataUrl.startsWith("/r/AskHistorians/comments/"))
        {
            if (findChildByClass(commentAnchor, "AHCommentFix") != null)
            {
                //console.log("Mobile reddit already fixed ");
                continue;  // This topic has already been fixed. Continue to the next one.
            }

            //console.log(dataUrl);

            // Add status span with AHCommentFix before doing
            // async getCommentCount. Otherwise multiple calls 
            // can update the same topic
            let statusNode = document.createElement('span');
            statusNode.className = "AHCommentFix";  // This class lets us know we already fixed this link
            commentAnchor.appendChild(statusNode);
            let commentCount = getCommentCount(dataUrl)
            setStatusNodeData(statusNode, commentCount);

            let monitorNode = createMonitorNode(" Monitor", dataUrl);
            commentAnchor.parentNode.insertBefore(monitorNode, commentAnchor.nextSibling);

            numFixedUrls += 1;
        }
        if (numFixedUrls >= maxNumberOfFixes)
        {
            break;
        }
    }

    //console.log("Mobile Reddit number of links " + threadLinkDivs.length);
    return 0; 
}

function askHistoriansCommentFix(maxNumberOfFixes)
{
    var linkCount = oldRedditAskHistoriansCommentFix(maxNumberOfFixes);
    if (linkCount == 0)
    {
        linkCount = newRedditAskHistoriansCommentFix(maxNumberOfFixes);
    }
    if (linkCount == 0)
    {
        mobileRedditAskHistoriansCommentFix(maxNumberOfFixes);
    }
      
  
}

window.onscroll = function (e)
{
    //console.log("Scrolling");
  
    // Fix one more link every scroll event. 
    // We get multiple events every time a user moves around on the page
    askHistoriansCommentFix(1);
}

// Fix the first 10 links when page loads. Then fix additional links when we scroll. 
// This avoids doing too many slow requests to the server at once.
askHistoriansCommentFix(10);
