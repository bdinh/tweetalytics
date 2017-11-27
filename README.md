# Data Explorer

###Project Description: 
Using Twitter's Rest API, I created an application that displays relevant information about 
tweets that pertain to a search term. My application was broken into three panels. The first panel
displays a bubble cloud where each bubble corresponds to a positive or negative words, in each of the queried
tweets. The positive and negative words uses [AFINN-165](http://www2.imm.dtu.dk/pubdb/views/publication_details.php?id=6010) wordlist and 
[Emoji Sentiment Ranking](http://journals.plos.org/plosone/article?id=10.1371/journal.pone.0144296) to perform the sentiment analysis. In my 
second panel, I created various bar charts that displays the tweet activity of the most popular tweets for that search term.
In my third panel, I created a carousel that displays the top tweets about that search term. 

###Technical Description:
The data used for this application comes from [Twitter's Rest API](https://developer.twitter.com/en/docs/tweets/post-and-engage/overview) 
specifically having to deal with retrieving tweet. Since the endpoints I'm interested in require OAuth,
I had to create php scripts to act as proxies in order to validate myself in querying data from their api.
The php scripts are hosted on my student web server. For all of the data visualizations, I used D3. I refrained 
from actually refactoring the D3 components as that itself is a project I am in the process of working on.

###Inspiration:
For my INFO 201 final project, my group and I created a Shiny app displaying data from Twitter's Rest API.
I thought that given the opportunity to use Twitter's Rest API again, I wanted to take advantage of the opportunity
to incorporate the skills I've learn in the past year since I've taken that class to create an application that
showcase some of the new skills that I've learned. 

 

The site can be viewed at [here](https://info343b-a17.github.io/data-explorer-bdinh/)
