import { Text, View, Share, Linking } from 'react-native'
import React, { Component } from 'react'

export default class SharedFunctions {
    static compartir({ url, text, title }) {

        // const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${url}`;
        // const facebookUrl = `https://www.facebook.com/dialog/share?href=${url}&hashtag=${hashtags}`;
        // const twitterUrl = `https://twitter.com/intent/tweet?url=${url}&text=${text}&hashtags=${hashtags}`;
        // const linkedInUrl = `https://www.linkedin.com/shareArticle?mini=true&url=${url}&title=${text}`;

        // Linking.openURL(facebookUrl)
        // window.open(facebookUrl, "Shared", "height=612,width=900")
        // window.open(twitterUrl, "Shared", "height=612,width=900")
        Share.share({
            message: text + " " + url,
            url: url,
            title: "HOLA MUNDO",
        })
    }
}



// <a href="https://facebook.com/sharer/sharer.php?u={yourUrl}">
// Share on Facebook
// </a>

// <a href="https://twitter.com/intent/tweet/?text={yourText}&url={yourUrl}">
// Share on Twitter
// </a>

// <a href="https://www.tumblr.com/widgets/share/tool?posttype=link&title={yourTitle}&caption={yourUrl}&content={yourContent}&canonicalUrl={yourUrl}&shareSource=tumblr_share_button">
// Share on Tumblr
// </a>

// <a href="mailto:?subject={yourSubject}&body={yourContent}">
// Share via email
// </a>

// <a href="https://pinterest.com/pin/create/button/?url={yourUrl}&media={yourMediaUrl}&description={yourDescription}">
// Share on Pinterest
// </a>

// <a href="https://www.linkedin.com/sharing/share-offsite/?url={yourUrl}">
// Share on LinkedIn
// </a>

// <a href="https://reddit.com/submit/?url={yourUrl}&title={yourTitle}">
// Share on Reddit
// </a>

// <a href="https://www.xing.com/social/share/spi?url={yourUrl}">
// Share on Xing
// </a>

// <a href="https://api.whatsapp.com/send?text={yourText}">
// Share on Whatsapp
// </a>

// <a href="https://news.ycombinator.com/submitlink?u={yourLink}&t={yourText}">
// Share on HackerNews
// </a>