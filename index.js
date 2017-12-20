const port = process.env.PORT || 3000;

const read = require('node-readability');
const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const validUrl = require('valid-url');
const urllib = require('url');
const htmlclean = require('htmlclean');
const sanitizeHtml = require('sanitize-html');
const sanitize = (html) => sanitizeHtml(htmlclean(html), {
    allowedTags: sanitizeHtml.defaults.allowedTags.concat([ 'img' ])
});

app.listen(port);
app.set('etag', false);
app.use(bodyParser.json());

app.route('/parser')
    .get((req, res) => {
        console.log('GET');
        const url = req.query.url;
        if (url && validUrl.isUri(url)) {
            const parsedURL = urllib.parse(url);

            read(url, (err, article, meta) => {
                if (err) {
                    res.json({ err });
                    return;
                }

                const content = sanitize(article.content);
                const title = article.title;

                // Close article to clean up jsdom and prevent leaks
                article.close();

                res.json({
                    url,
                    title,
                    content,
                    domain: parsedURL.hostname,
                    // date_published: null,
                    // lead_image_url: null,
                });
            });
        } else {
            error(res, `Not a valid URL supplied`);
        }
    })
    .post((req, res) => {
        console.log('GET');

        if (req.body && req.body.url) {
            const url = req.body.url;
            if (validUrl.isUri(url)) {
                res.json({ message: `Let's go parse ${url}` });



            } else {
                error(res, `${req.body.url} is not recognised as valid URL`);
            }
        } else {
            error(res, `Not yet implemented`);
        }

        //console.log(req.body);
        res.json({json: 'YAS'});
    });

const error = (resp, errorMessage) => {
    console.error(errorMessage);
    resp.json({ errorMessage });
};