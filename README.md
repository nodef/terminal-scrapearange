# terminal-scrapearange

[![NPM](https://nodei.co/npm/terminal-scrapearange.png)](https://nodei.co/npm/terminal-scrapearange/)

[Terminal] interface implementation for [ranged] [web scraping].

```javascript
const scrapeArange = require('terminal-scrapearange');
// scrapeArange.logSill(<message>): for less important logs (verbose)
// scrapeArange.logVerb(<message>): for important logs (verbose)
// scrapeArange.logErr(<message>): for error logs (verbose)
// scrapeArange.request(<options>): make http/https request (follows redirect)
// scrapeArange.main(<options>): terminal interface

scrapeArange.logSill('> GET somewebsite.org')
// > GET somewebsite.org (in grey, if verbose enabled)
scrapeArange.logVerb('Scraping post 12...')
// > Scraping post 12... (in bright yellow, if verbose enabled)
scrapeArange.logErr('ERR: 12 failed')
// > ERR: 12 failed (in bright red, if verbose enabled)
scrapeArange.request({
  protocol: 'https:',
  hostname: 'somewebsite.org',
  port: 443,
  path: '/',
  method: 'GET'
}).then((html) => console.log(html));
// <html><head><title>somewebsite</title>...
if(require.main===module) scrapeArange.main({
  output: null,     // target writestream, like fs.createWriteStream('output.txt')
  retries: 4,       // times to retry failed requests
  connections: 4,   // maximum number of parallel connections
  timegap: 250,     // minimum time gap between requests in milliseconds (doubles if a request fails)
  verbose: false,   // get detailed output?
  method: () => {}, // method that scrapes html and returns JSON object
});
// { /* object returned from method() */ }
// { /* another object returned from method() */ }
// ... (redirected to output file if specified with -o|--output)
// STDERR: [ /* array of failed ids, if any */ ]
```


[Terminal]: https://en.wikipedia.org/wiki/Terminal_emulator
[ranged]: https://docs.scipy.org/doc/numpy-1.13.0/reference/generated/numpy.arange.html
[web scraping]: https://en.wikipedia.org/wiki/Web_scraping

![](https://ga-beacon.deno.dev/G-RC63DPBH3P:SH3Eq-NoQ9mwgYeHWxu7cw/github.com/nodef/terminal-scrapearange)
