// Static copy for CLOUDFALL. Anything that changes often (the shop, the FAQ,
// news, events, project types, the AI cap) is read from Stern's public API at
// runtime instead, see lib/api/stern.js. Keep this file for voice, not facts.

import { WELCOME_URL } from "./api/stern.js";

export const CONFIG = {
  name: "CloudFALL",
  tagline: "Destroy the cloud by making it free",
  // fallback only; the live name comes from the API's currency payload
  currency: "Coins",
  signupUrl: WELCOME_URL,
  welcomeUrl: WELCOME_URL,
  slackUrl: "https://hackclub.enterprise.slack.com/archives/C0BMMC7486R",
  hackatimeUrl: "https://hackatime.hackclub.com/",
  programUrl: "https://stern.hackclub.com/a/cloudfall/home",
  shopUrl: "https://stern.hackclub.com/a/cloudfall/shop",
  flagUrl: "https://hackclub.com",
  // The umbrella program this YSWS runs under.
  archer: {
    name: "Archer",
    url: "https://hackclub.enterprise.slack.com/archives/C0BHZLZF8BX",
  },
};

/**
 * The ledger: things people rent by the month, and the thing you could run
 * instead. `usd` is a rough US list price, which the section says out loud;
 * the point of the number is the size of it, not the cent.
 *
 * `port` is the port the replacement actually listens on. It is the closest
 * thing self-hosting has to a street address, and it is why a row reads as a
 * real machine you could go and build tonight.
 */
export const RENTALS = [
  {
    id: "video",
    service: "Netflix",
    what: "Standard, one household",
    usd: 17.99,
    on: true,
    replacement: "Jellyfin",
    port: "8096",
    how: "Rip the discs you own, stream them to every screen in the house. Nothing leaves the building.",
  },
  {
    id: "music",
    service: "Spotify",
    what: "Premium, one person",
    usd: 11.99,
    on: true,
    replacement: "Navidrome",
    port: "4533",
    how: "Your library, your playlists, subsonic apps on every phone. The album stays yours when the deal expires.",
  },
  {
    id: "photos",
    service: "Google Photos",
    what: "2 TB, the family plan",
    usd: 9.99,
    on: true,
    replacement: "Immich",
    port: "2283",
    how: "Same auto-backup, same face search, running on a box in your room instead of a rack in Iowa.",
  },
  {
    id: "files",
    service: "Dropbox",
    what: "Plus, 2 TB",
    usd: 11.99,
    on: false,
    replacement: "Nextcloud",
    port: "443",
    how: "Files, calendar, contacts and shared links, without a company reading the folder names.",
  },
  {
    id: "video-sub",
    service: "YouTube Premium",
    what: "One account, no ads",
    usd: 13.99,
    on: false,
    replacement: "TubeArchivist",
    port: "8000",
    how: "Subscribe to channels, keep the videos, watch them again in ten years when the channel is gone.",
  },
  {
    id: "books",
    service: "Audible",
    what: "One credit a month",
    usd: 14.95,
    on: false,
    replacement: "Audiobookshelf",
    port: "13378",
    how: "Your audiobooks with your progress synced, and no licence server deciding whether you may listen.",
  },
  {
    id: "passwords",
    service: "1Password",
    what: "Individual",
    usd: 3.99,
    on: false,
    replacement: "Vaultwarden",
    port: "8080",
    how: "The same browser extensions, talking to a vault that only exists on hardware you can unplug.",
  },
  {
    id: "gym",
    service: "The gym",
    what: "The one you drive past",
    usd: 42.0,
    on: false,
    replacement: "Something you built",
    port: null,
    how: "Not every subscription is software. A written plan, a log you own and a bar in the garage counts here too.",
  },
];

/**
 * How the program runs, in order. The numbering is real: you cannot log hours
 * against a project you have not started, or spend hours you have not shipped.
 */
export const STEPS = [
  {
    n: "01",
    title: "Sign up",
    body: "Make a CloudFALL account on Stern and read the welcome page. Free, no application, about two minutes.",
  },
  {
    n: "02",
    title: "Pick the subscription you are killing",
    body: "One thing you or your family pay for every month. Media, storage, photos, notes, even the gym. Say what it is in your project description.",
  },
  {
    n: "03",
    title: "Build the replacement",
    body: "It has to run on a machine somebody owns, and someone other than you has to be able to stand it up. That means a README and a compose file, not a folder of scripts.",
  },
  {
    n: "04",
    title: "Track every hour",
    body: "Log your build time with Hackatime and link those projects when you submit. Untracked hours cannot be counted, and only your non-AI hours earn credit.",
  },
  {
    n: "05",
    title: "Ship it, then spend the hours",
    body: "Submit an open-source repo and a live link a reviewer can actually open. Approved hours are the price tag in the shop.",
  },
];

/**
 * Reusable <Rules> content. The AI cap and any extra program requirements come
 * from Stern and render above these; everything here is evergreen.
 */
export const RULES = {
  title: "What reviewers check",
  intro:
    "Six checks, every submission. Miss one and it comes back with notes; fix it and resubmit.",
  items: [
    {
      tag: "REPLACES",
      text: "It stands in for something people pay for by the month. Name the subscription in your project description.",
      mark: "Name the subscription",
    },
    {
      tag: "NEW",
      text: "Built brand-new during the program. No resubmitting a project (or the hours behind it) from another YSWS.",
    },
    {
      tag: "TRACKED",
      text: "Every hour tracked in Hackatime and linked to the project you submit. Untracked time cannot be counted.",
    },
    {
      tag: "OPEN",
      text: "A public GitHub repo under a permissive licence, with a README and images, permanently.",
    },
    {
      tag: "IT RUNS",
      text: "A live link a reviewer can open and use. Self-hosted only? Ship a compose file and a demo video instead.",
      mark: "a compose file and a demo video",
    },
    {
      tag: "YOURS",
      text: "Your own work. Not a tutorial followed step for step, not somebody else’s project with the colours changed.",
    },
  ],
};

/** The terms of the deal, for anyone who has never done a YSWS before. */
export const TERMS = [
  {
    term: "what it is",
    body:
      "An online hackathon with no venue and no single weekend. You build from wherever " +
      "you are, on your own schedule, and finish when it is finished.",
  },
  {
    term: "who it is for",
    body: "Anyone aged 13 to 18, anywhere on earth. Free to enter, and nothing to pay later.",
  },
  {
    term: "what you get",
    body:
      "Ship a project and pick real hardware off the shop list: blank discs to hold your " +
      "library, or a Plex plan to serve it. Unlimited unless a listing says otherwise.",
  },
  {
    term: "how hours count",
    body:
      "Track build time with Hackatime. Once your non-AI hours are approved they become " +
      "spendable, and that approval is the only gate.",
  },
];
