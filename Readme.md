# Investigating the state of TypeScript in 2021

Since the JS eco system moves so quick, it's always fun to see what is involved in getting a project up and running where I can do the following:

- Write application code in TypeScript
- Split it into logical modules and consume other such modules, such as React (writing .tsx React component, of course!)
- Specify linting and code formatting rules (maybe I don't agree with some of the more recent and stringent approaches or maybeI *do* but I forget to apply them without them being enforced; I do love me some consistency!)
- Write unit tests in TypeScript and have them run in real browser(s) (of course, PhantomJs died a death since I last played around with this and Chrome Headless is the new hawtness)
- Use a modern styling technology for presentation
- Have this all tied together somehow in a build system, so that I can compile EVERYTHING or just run the tests or just update the styling or configure it to watch for changes and rebuild automatically

It's been about 18 months since I last tried this and so it seems like *everything* is different! Certainly, *that* build process no longer works - Gulp has changed from version 3 to 4 and much has altered along the way, I'm enjoying the significant whitespace (ie. less curlies) of SASS and it seems like there are plenty of people who are totally opposed to semi-colons in TypeScript and I think that *that* looks cleaner (thank goodness for the linter, until I got used to it, though) - many, *many* years ago, they had benefit for "minifying" JS non-ambiguously but those old approaches are dinosaur-old, considering how much has altered in mere months (well, a couple of years)!

## So what does this code actually do?

Let's call it a "non-trivial toy project"! It is a simple app that allows you to construct a list of stocks that you're excited by, to set alerts on those stocks so that if their prices change by a given amount since the 'opening price' of the day and, if so, alerts you to this fact. It is the UI code only and relies up another service to provide the stock data that must have the following endpoints:

**/static/tickers** - returns an array or stock string IDs (aka "symbols))

**/prices/SYM1,SYM2** - takes an array of symbols and returns an array of entries where each symbol maps on to an opening price, bid and ask prices plus a "last volume" quantity

By default, this service would run locally at localhost:3000 but this could be changed in the src/config.ts file

To add stocks to the 'Stock Viewer' list, there is a dropdown of available stock symbols and an 'Add' button at the bottom of the page.

### Goals and limitations

As a toy-ish project, I applied constraints as what to what I implemented - the more complex that something is, the longer it takes to write and, unless there is a compelling case for doing so, the more faffing around you're doing for litle benefit.

#### So what *does* it do?

1. It persists selected stocks anad configured alert settings to LocalStorage, so that state is maintained between runs - in a "real" app, this would likely be held in an external service or database or whatever but this approach illustrates things nicely enough
1. The code *is* all TypeScript (including the few tests) and built using Gulp (maybe that's considered an old tech these days but I had to draw the line *somewhere* ata investigating every new possibility!) - running "gulp" builds the app, transforms the styling (like I said, I'm loving SASS!), copies the template 'start page' html into the 'dist' folder and runs the tests
1. Everything is nicely modular; both code *and* styling, which makes me happy
1. When network requests are made for stock symbol options, current price data and potential alert matches, there are clean distinctions made between loading, received and failed-to-load states, so that if anything does wrong in an external service then the UI makes this clear - this is something so often *not* done and failures are often handled very ungracefully, imo!
1. The selected stocks list can be sorted by various columns
1. I didn't use an off-the-self Flux / Redux / whatever state manager because I wanted to remind myself how easy it is / where the pain points lie - and, for a simple case, like this, it wasn't so bad!

#### What does it *not* do?

As I said, I could have gone absolutely crazy on gold-plating this, so let's talk about some things that it *doesn't do*:

1. I've not tested whether the external stocks prices could be located somewhere other than 'localhost' - I *think* that the Fetch API handles CORS well enough (so long as the external service is configured to do so) but I've had no reason to confirm this
1. When external stock symbols and prices are retrieved, a "real" app would probably reduce load by checking etag headers and maybe other cache expiration approaches but there has been no need to looking into that for my simple investigation
1. If the lists of selected stocks could potentially be huge (1000s or 10s of 1000s) then a virtualised list approach to rendering may be beneficial but that didn't seem worthwhile here
1. The list of stocks that have been selected does not automatically refresh while it's being viewed, so if the bid/ask prices change on the server then they are not reflected in the UI unless you refresh the page or press the "Reload" button - but that's what the "Alerts" functionality can do
1. If the list of available stock symbols were to change often then retrieving it only once would not be ideal but that's what I'm currently doing now - if the options have change and you want the new ones then you have to refresh the app!
1. Smilarly, if this list got huge then replacing the simple dropdown list of available options with some sort of (potentially server-based) autcomplete input box might be a good idea.
1. If the lists of stocks that would have to be retrieved could get ginormous then trying to request all of their price data in a single GET might fail (QueryString length limits) and so splitting up the request into multiple calls and then combining the results could help - that wasn't applicable here
1. It presumes that, when it shows a 'retrieved at' time that the times are all in the browser's time zone

#### Possible other improvements

1. It might be helpful to include ordering options on the 'Stock Alerts' page so that it's possible to prioritise buying or selling stocks that will provide the greatest value (taking into account the change since opening price and the available volume)
1. It might be a nice touch for both the 'Stock Viewer' and 'Stock Alerts' pages to periodically refresh themselves to show the latest data, so long as the User hasn't interacted with the page for a period of time (it would be annoying to refresh the data if they were in the process of editing it - such as setting an alert threshold, for example)

### Summary

I'm sure that there is plenty to pick at regarding why I did or didn't do particular things or take particular approaches but, on the whole, this has been fun! It is really exciting to see how quickly TypeScript moves (I still credit it for us *finally* getting nullable reference types in C#, that I've been loving!)

### Building

The repo includes a built version of the project, so you can open dist/index.html directly in the browser. However, if you want to build it from scratch then it's a standard process of opening the root of the project in the command line and running:

````
npm install
gulp
````

This will recreate the 'dist' folder and you can open the index.html file from there.
