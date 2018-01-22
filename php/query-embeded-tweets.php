<?php

$tweetId = $_GET['tweetId'];
$tweetUrl = $_GET['tweetUrl'];

require "twitteroauth/autoload.php";
use Abraham\TwitterOAuth\TwitterOAuth;

$connection = new TwitterOAuth($consumerKey, $consumerSecret, $oAuthToken, $oAuthSecret);
$statuses = $connection->get("statuses/oembed", ["id" => $tweetId, "url" => $tweetUrl,"maxwidth" => 250,
    "align" => "center", "hide_media" => "true"]);

print json_encode($statuses);