<?php
	//set your type as doctype as json
	header("Content-Type:application/json");

	//create curl function to do a simple proxy for yahoo search	
	function getContextResource($url){
		$ch = curl_init();
		curl_setopt($ch, CURLOPT_URL, $url);
		curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
		$result = curl_exec($ch);
		curl_close($ch);
		return $result;
	} 
   
	//pull your posted content from Post
	$myContent=$_POST['content'];
	
	//create url to curl, add in your appid, output, content to check and then urlencode and utf8encode your content	
	$contextUrl = 'http://search.yahooapis.com/ContentAnalysisService/V1/termExtraction?appid='.$_POST['appid'].'&output=json&context='.urlencode(utf8_encode($myContent));
	
	//create curl call from our url
	$feed = getContextResource($contextUrl);
	
	//Send back JSON as recieved
	echo $feed;
?>