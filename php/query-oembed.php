<?php
header('Access-Control-Allow-Origin: *');

$tweetID = $_GET['tweetID'];


$url = "https://api.twitter.com/1.1/statuses/oembed.json?id=" . $tweetID . "&maxwidth=300&hide_media=true&align=center";

$response = file_get_contents($url);

header("Content-Type: application/json");
echo $response;

