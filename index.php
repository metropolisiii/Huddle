<?php
ini_set("display_errors","1");
include_once "lib/oauth-php/library/OAuthStore.php";
include_once "lib/oauth-php/library/OAuthRequester.php";

$client = 'd2b14cd3-93d2-40cd-a569-610f5987c971'; // this is your consumer key
$secret = '6f2642c5-0fca-41f8-b75e-5a937e0247af'; // this is your secret key

$url = "http://itweb-dev.cablelabs.com/huddle/index.php"; // this is the URL of the request
$authorize_url=$url."/oauth/authorize";
$token_url=$url."/oauth/token";
$method = "GET"; // you can also use POST instead
$redirect_uri='http://itweb-dev.cablelabs.com/huddle/index.php';

if(!isset($_REQUEST['code']) && !isset($_REQUEST['access_token']))
{
	header( "Location: https://graph.api.smartthings.com/oauth/authorize?response_type=code&client_id=$client&redirect_uri=".$url."&scope=app" ) ;
}
else if(isset($_REQUEST['code']))
{
	$code = $_REQUEST['code'];
	$page = "https://graph.api.smartthings.com/oauth/token?grant_type=authorization_code&client_id=".$client."&client_secret=".$secret."&redirect_uri=".$url."&code=".$code."&scope=app";

	$ch = curl_init();

	curl_setopt($ch, CURLOPT_URL, $page );
	curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1 );
	curl_setopt($ch, CURLOPT_POST, 0 );
	curl_setopt($ch, CURLOPT_HTTPHEADER, array('Content-Type: application/json'));

	$response = json_decode(curl_exec($ch),true);

	curl_close($ch);

	if(isset($response['access_token']))
	{
		//Redirect to self with access token for step 3 for ease of bookmarking
		header( "Location: ?access_token=".$response['access_token'] ) ;
	}


}

else if(isset($_REQUEST['access_token']))
{
$url = "https://graph.api.smartthings.com/api/smartapps/endpoints/$client?access_token=".$_REQUEST['access_token'];
$json = implode('', file($url));
 
$theEndpoints = json_decode($json,true);
$motions = array();

foreach($theEndpoints as $k => $v)
{
 
//GET SWITCHES
$motionUrl = "https://graph.api.smartthings.com".$v['url']."/motions";
$access_key = $_REQUEST['access_token'];
 
$ch = curl_init($motionUrl);
curl_setopt( $ch, CURLOPT_HTTPHEADER, array( 'Authorization: Bearer ' . $access_key ) );
curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1 );
curl_setopt($ch, CURLOPT_POST, 0 );
 
$resp = curl_exec($ch);
curl_close($ch);

$respData=json_decode($resp,true);

foreach($respData as $value){
	$motions[]=$value;
}

}
print(json_encode($motions));
}
?>