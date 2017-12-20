const port = process.env.PORT || 3000;

const readability = require('node-readability');
const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const validUrl = require('valid-url');

app.listen(port);
app.set('etag', false);
app.use(bodyParser.json());
app.route('/get')
    .get((req, res) => {
        console.log('GET');
        console.log(req.body);
        res.json({json: 'YAS'});
    })
    .post((req, res) => {
        console.log('GET');

        if (req.body && req.body.url) {
            const url = req.body.url;
            if (validUrl.isUri(url)) {
                res.json({ message: `Let's go parse ${url}` });

                readability(url, (err, article, meta) => {

                    // Main Article
                    console.log(article.content);
                    // Title
                    console.log(article.title);

                    // HTML Source Code
                    console.log(article.html);
                    // DOM
                    console.log(article.document);

                    // Response Object from Request Lib
                    console.log(meta);

                    // Close article to clean up jsdom and prevent leaks
                    article.close();
                });

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