function checkClassAttrib(element, className)
{
    if( element == null ) return false;
    
    var classList = element.classList;
    
    for (var i = 0; i < classList.length; i++) 
    {
        if (classList[i] == className)
        {
            return true;
        }
    }
    
    return false;

}


function getAllChildNodes(node, allChildNodes)
{
    allChildNodes = allChildNodes ? allChildNodes : [];  // Init list if this is the first call

    var children = node.childNodes;

    for (var i = 0; i < children.length; i++) 
    {
        if (children[i].nodeType == 1) // 1 is 'ELEMENT_NODE'
        {
            allChildNodes.push(children[i]);
            allChildNodes = getAllChildNodes(children[i], allChildNodes);
        }
    }

    return allChildNodes;
}  

function findChildById(node, childID)
{
    var allChildren = getAllChildNodes(node);

    for (var i = 0; i < allChildren.length; i++)
    {
        if (allChildren[i].id == childID)
        {
            return allChildren[i];
        }
    }

    return null;
}

function findChildByClass(node, childClass)
{
    var allChildren = getAllChildNodes(node);

    for (var i = 0; i < allChildren.length; i++)
    {
        if (checkClassAttrib(allChildren[i], childClass))
        {
            return allChildren[i];
        }
    }

    return null;
}

function getCurrentHostString()
{
    // Make sure we request json from the current host.
    // This host string include protocol (https) and 
    // subdomain (www/old) of the current session
    let index = window.location.href.search("reddit.com");
    if (index<0)    // We are not on reddit.com. Something seems wrong
    {
        return "https://www.reddit.com";
    }

    let hostString = window.location.href.substr(0, index+10);

    return hostString;
}

function getCommentCount(dataUrl)
{
    var topLevelComments = 0;
    var topLevelCommentsMod = 0;
    var topLevelCommentsDeleted = 0;
    var totalComments = 0;  // TODO
    var title = "";

    dataUrl = getCurrentHostString() + dataUrl;
    var threadJsonData = getHttpData(dataUrl + ".json")
    var threadData = JSON.parse(threadJsonData);
    comments = threadData[1].data.children;

    for (var i=0; i<comments.length; i++)
    {
        if (comments[i].data.distinguished == "moderator")
        {
            topLevelCommentsMod++;
        }
        else if(comments[i].data.body == "[removed]")
        {
            topLevelCommentsDeleted++;
        }
        else
        {
            topLevelComments++;
        }
    }

    title = threadData[0].data.children[0].data.title;

    console.log("getCommentCount " + dataUrl +  "\nNumber of comments: " + comments.length + "/" + topLevelComments + "/" + topLevelCommentsMod + "/" + topLevelCommentsDeleted);

    return {'topLevelComments' : topLevelComments, 
            'topLevelCommentsMod' : topLevelCommentsMod, 
            'topLevelCommentsDeleted' : topLevelCommentsDeleted, 
            'totalComments' : totalComments,
            'title' : title };
}

function getHttpData(dataUrl)
{
    var xmlhttp = new XMLHttpRequest();
    xmlhttp.open("GET",dataUrl,false);
    xmlhttp.send();
    if( xmlhttp.status!=200 )
    {
        console.log("Ask Historians get json - http error");
         return null;
    }

    //console.log("json: " + xmlhttp.responseText);
    return xmlhttp.responseText;
}
