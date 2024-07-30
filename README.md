# WORK IN PROGRESS NOW!

All functions/appearances are not stable now and may be changed in future.

If you want to have an early access to this extension, please

+ **Back up ALL YOUR DATA! (database, files, etc.)**
+ Install this extension, And check all settings in admin panel.
+ If problem occurs, you can submit it to github issue. However it's not guaranteed to be fixed.

# Websocket Notification

An extension provides a light weight websocket realtime implementation for [Flarum](http://flarum.org).

This extension current provides the following features:

+ Show new post/discussion on the top of discussion page
+ Auto append new post to the bottom of discussion page.
+ Show a floating window for **all** notifications supports alert.

## Usage

1. Install this extension.
2. Run `php flarum xypp-wsn:serve` in your Flarum root directory.
3. Reload the page.

> You need to make the command always running in background. Using `screen` or `nohup` is the possible solution.

## Installation

Install with composer:

```sh
composer require xypp/flarum-websocket-notification:"*"
```

## Updating

```sh
composer update xypp/flarum-websocket-notification:"*"
php flarum migrate
php flarum cache:clear
```

## Links

- [Packagist](https://packagist.org/packages/xypp/flarum-websocket-notification)
- [GitHub](https://github.com/zxy19/flarum-websocket-notification)