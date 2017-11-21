export function extractResponse(data, type) {

    let result = [];

    if (type === "sentiment") {
        data.forEach((tweet) => {
            result.push({
                text: tweet.text,
                tweetID: tweet.id_str,
            });
        });
    } else {
        data.forEach((tweet) => {
            let tweetObj = {
                user: {
                    id: tweet.id_str,
                    name: tweet.user.name,
                    description: tweet.user.description
                },
                tweet: {
                    id_str: tweet.id_str,
                    text: tweet.text,
                    type: tweet.metadata.result_type,
                    url: function () {
                        let url = "Not Available";

                        if (tweet.user.url !== undefined && tweet.user.url !== null) {
                            url = tweet.user.url;
                        } else if (tweet.entities.urls.length !== 0) {
                            if (tweet.entities.urls[0].url !== undefined && tweet.entities.urls[0].url !== null) {
                                url = tweet.entities.urls[0].url;
                            }
                        } else if (tweet.retweeted_status !== undefined && tweet.retweeted_status !== null) {
                            if (tweet.retweeted_status.entities.urls.length !== 0) {
                                url = tweet.retweeted_status.entities.urls[0].url;
                            } else {
                                if (tweet.retweeted_status.extended_entities !== undefined && tweet.retweeted_status.extended_entities !== null) {
                                    if (tweet.retweeted_status.extended_entities.media !== undefined && tweet.retweeted_status.extended_entities.media !== null) {
                                        url = tweet.retweeted_status.extended_entities.media[0].url;
                                    }
                                }
                            }
                        } else if (tweet.user.entities.url !== undefined && tweet.user.entities.url !== null) {
                            if (tweet.user.entities.url.urls.length !== 0) {
                                url = tweet.user.entities.url.urls[0].url;
                            }
                        }
                        return url;
                    }(),
                    plotData: {
                        'Retweet Count': tweet.retweet_count,
                        'Favorite Count': tweet.favorite_count
                    }
                }
            };
            result.push(tweetObj);
        });
    }
    return result;
}