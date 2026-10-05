# WireGuard Portal v2

[![Build Status](https://github.com/h44z/wg-portal/actions/workflows/docker-publish.yml/badge.svg?event=push)](https://github.com/h44z/wg-portal/actions/workflows/docker-publish.yml)
[![License: MIT](https://img.shields.io/badge/license-MIT-green.svg)](https://opensource.org/licenses/MIT)
![GitHub last commit](https://img.shields.io/github/last-commit/h44z/wg-portal/master)
[![Go Report Card](https://goreportcard.com/badge/github.com/h44z/wg-portal)](https://goreportcard.com/report/github.com/h44z/wg-portal)
![GitHub go.mod Go version](https://img.shields.io/github/go-mod/go-version/h44z/wg-portal)
![GitHub code size in bytes](https://img.shields.io/github/languages/code-size/h44z/wg-portal)
[![Docker Pulls](https://img.shields.io/docker/pulls/h44z/wg-portal.svg)](https://hub.docker.com/r/wgportal/wg-portal/)

## Introduction
<!-- Text from this line # is included in docs/documentation/overview.md -->
**WireGuard Portal** is a simple, web-based configuration portal for [WireGuard](https://wireguard.com) server management.
The portal uses the WireGuard [wgctrl](https://github.com/WireGuard/wgctrl-go) library to manage existing VPN
interfaces. This allows for the seamless activation or deactivation of new users without disturbing existing VPN
connections.

The configuration portal supports using a database (SQLite, MySQL, MsSQL, or Postgres), OAuth or LDAP
(Active Directory or OpenLDAP) as a user source for authentication and profile data.

## Features

* Self-hosted - the whole application is a single binary
* Responsive multi-language web UI with dark-mode written in Vue.js
* Automatically selects IP from the network pool assigned to the client
* QR-Code for convenient mobile client configuration
* Sends email to the client with QR-code and client config
* Enable / Disable clients seamlessly
* Generation of wg-quick configuration file (`wgX.conf`) if required
* User authentication (database, OAuth, or LDAP), Passkey support
* IPv6 ready
* Docker ready
* Can be used with existing WireGuard setups
* Support for multiple WireGuard interfaces
* Supports multiple WireGuard backends (wgctrl, MikroTik, or pfSense)
* Peer Expiry Feature
* Handles route and DNS settings like wg-quick does
* Exposes Prometheus metrics for monitoring and alerting
* REST API for management and client deployment
* Webhook for custom actions on peer, interface, or user updates

<!-- Text to this line # is included in docs/documentation/overview.md -->
![Screenshot](docs/assets/images/screenshot.png)

## Fork additions

This fork keeps up with [h44z/wg-portal](https://github.com/h44z/wg-portal) and adds a simplified web UI for non-admin users ("VPN devices"):

- Non-admin users only see their devices with connection status, can add a device by entering a name and can delete devices.
  Keys are generated in the browser and never shown; the private key is never sent to the server.
  Users without devices get a three step guide (install the WireGuard app for their platform, add the device, import it).
  After a device is created, the dialog shows how to import the configuration on the current platform: a QR code for phones
  and a file download on computers, the share sheet on iOS, and a file download plus the import steps on Android. It
  reports the connection as soon as the tunnel is switched on (needs peer statistics; a short
  `statistics.data_collection_interval` makes it appear faster). A device that never connected can be set up again.
  The configuration file is named `<site title, max. 10 characters>-<4 characters of the public key>.conf`, because the
  WireGuard Android app and wg-quick only accept tunnel names of up to 15 characters `[a-zA-Z0-9_=+.-]`.
- Key Generator, IP Calculator, Settings, Interfaces, Users and Audit are only available to admins. The admin UI is unchanged.

Required configuration: `core.self_provisioning_allowed: true` and `core.editable_keys: true` (default).
Without `editable_keys`, the backend would replace the browser-generated public key, so the "Add device" button is hidden.

Branding is configured without code changes: `web.site_title` (shown next to the logo for non-admin users and used as config file name prefix),
`web.site_company_name`, `web.site_logo_file` (replaces the header logo), `web.site_favicon_file` (replaces the favicon) and `web.site_css_file` (stylesheet loaded after the default styles).

`auth.auto_login_provider` redirects unauthenticated users to an OIDC/OAuth provider right away; with `auth.hide_login_form: true`
the password login form is only reachable as an emergency access via `/#/login?all`.

A scheduled workflow opens a pull request whenever the upstream `master` branch has new commits.

## Documentation

For the complete documentation visit [wgportal.org](https://wgportal.org).

## What is out of scope

* Automatic generation or application of any `iptables` or `nftables` rules.
* Support for operating systems other than linux.
* Automatic import of private keys of an existing WireGuard setup.

## Application stack

* [wgctrl-go](https://github.com/WireGuard/wgctrl-go) and [netlink](https://github.com/vishvananda/netlink) for interface handling
* [Bootstrap](https://getbootstrap.com/), for the HTML templates
* [Vue.js](https://vuejs.org/), for the frontend

## License

* MIT License. [MIT](LICENSE.txt) or <https://opensource.org/licenses/MIT>

## Contributors and Sponsors

Thanks so much for all your contributions! They’re truly appreciated and help keep WireGuard Portal moving ahead.

<a href="https://github.com/h44z/wg-portal/graphs/contributors">
  <img src="https://contrib.rocks/image?repo=h44z/wg-portal" />
</a>

Want to support the project? You can buy me a coffee or join as a contributor - every bit of support helps! 
[Become a sponsor!](https://github.com/sponsors/h44z)


> [!IMPORTANT]
> Since the project was accepted by the Docker-Sponsored Open Source Program, the Docker image location has moved to [wgportal/wg-portal](https://hub.docker.com/r/wgportal/wg-portal).
> Please update the Docker image from **h44z/wg-portal** to **wgportal/wg-portal**.
