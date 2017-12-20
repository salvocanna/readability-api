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
            readabilityProcess(url)
                .then((result) => {
                    res.json(Object.assign(result, {
                        url,
                        domain: parsedURL.hostname,
                    }));
                })
                .catch((err) => error(res, err));
        } else {
            error(res, `Not a valid URL supplied`);
        }
    })
    .post((req, res) => {
        console.log('POST');

        if (req.body && req.body.url) {
            const url = req.body.url;
            if (url && validUrl.isUri(url)) {
                const parsedURL = urllib.parse(input);
                readabilityProcess(url)
                    .then((result) => {
                        res.json(Object.assign(result, {
                            url,
                            domain: parsedURL.hostname,
                        }));
                    })
                    .catch((err) => error(res, err));
            } else {
                error(res, `${req.body.url} is not recognised as valid URL`);
            }
        } else {
            readabilityProcess(req.body)
                .then((result) => res.json(result))
                .catch((err) => error(res, err));
        }
    });

const readabilityProcess = (input) => {
    return new Promise((resolve, reject) => {
        read(input, (err, article, meta) => {
            if (err) {
                reject(err);
                return;
            }

            const content = sanitize(article.content);
            const title = article.title;

            // Close article to clean up jsdom and prevent leaks
            article.close();

            resolve({
                title,
                content,
            });
        });
    });
};

const error = (resp, errorMessage) => {
    console.error(errorMessage);
    resp.json({ errorMessage });
};
