<?php
header("Access-Control-Allow-Origin: *");

// Loads TwitterOAuth library created by Abraham Williams.
require "twitteroauth/autoload.php";
use Abraham\TwitterOAuth\TwitterOAuth;

// Determines the type of query to request from Twitter's API.
$type = $_GET['queryType'];

// Twitter API Credentials.
$oAuthToken = '803772348981575681-3ux770V3Av9i6aq1mcbTLg3XvCpoZLs';
$oAuthSecret = 'ppGsYaKhcoEag3I8eOieDprvqWkJW12rfBbAkbAvDpTjt';
$consumerKey = 'HmyVMCHby0N2v82jGm5iK7f4s';
$consumerSecret = '6CvfbYjKO9xJkocr49GOlYD5XqcVwc40S4doTTk9LfQFabIdKO';

// Creates a TwitterOAuth object to verify credentials
$connection = new TwitterOAuth($consumerKey, $consumerSecret, $oAuthToken, $oAuthSecret);

// Makes appropriate Twitter API request based on a given parameter.
if ($type == "search/tweets") {
    $searchTerm = $_GET['searchTerm'];
    $resultType = $_GET['resultType'];
    $count = $_GET['count'];
    $statuses = $connection->get("search/tweets", ["q" => $searchTerm, "result_type" => $resultType, "count" => $count, "lang" => "en"]);
    print json_encode($statuses);
} else if ($type == "statuses/oembed") {
    $tweetId = $_GET['tweetId'];
    $statuses = $connection->get("statuses/oembed", ["id" => $tweetId,"maxwidth" => 250,
        "align" => "center", "hide_media" => "true"]);
    print json_encode($statuses);
}


