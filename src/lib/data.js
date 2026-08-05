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
 * Nothing here is selected by default; see Ledger.svelte.
 *
 * `port` is the port the replacement actually listens on. It is the closest
 * thing self-hosting has to a street address, and it is why a row reads as a
 * real machine you could go and build tonight.
 */
export const RENTALS = [
  {
    id: "video",
    brand: "netflix",
    swapBrand: "jellyfin",
    service: "Netflix",
    what: "Standard, one household",
    usd: 17.99,
    replacement: "Jellyfin",
    port: "8096",
    how: "Rip the discs you own, stream them to every screen in the house. Nothing leaves the building.",
  },
  {
    id: "music",
    brand: "spotify",
    swapBrand: null,
    service: "Spotify",
    what: "Premium, one person",
    usd: 11.99,
    replacement: "Navidrome",
    port: "4533",
    how: "Your library, your playlists, subsonic apps on every phone. The album stays yours when the deal expires.",
  },
  {
    id: "photos",
    brand: "googlephotos",
    swapBrand: "immich",
    service: "Google Photos",
    what: "2 TB, the family plan",
    usd: 9.99,
    replacement: "Immich",
    port: "2283",
    how: "Same auto-backup, same face search, running on a box in your room instead of a rack in Iowa.",
  },
  {
    id: "backup",
    brand: "icloud",
    swapBrand: "syncthing",
    service: "iCloud+",
    what: "2 TB, the family plan",
    usd: 9.99,
    replacement: "Syncthing",
    port: "8384",
    how: "Every photo and backup your phone makes, landing on a drive in your house, with no account standing in the middle of it.",
  },
  {
    id: "tv",
    brand: "max",
    swapBrand: "jellyfin",
    service: "Max",
    what: "Ad-free, one household",
    usd: 16.99,
    replacement: "Jellyfin",
    port: "8096",
    how: "The same box you built for the last one. A second streaming service is just another shelf on it.",
  },
  {
    id: "games",
    brand: null,
    glyph: "cube",
    swapBrand: null,
    service: "Minecraft Realms",
    what: "Realms Plus, ten players",
    usd: 7.99,
    replacement: "Paper server",
    port: "25565",
    how: "Your world on your own box, with whatever mods you want, staying up after you stop paying anyone.",
  },
  {
    id: "notes",
    brand: "notion",
    swapBrand: "joplin",
    service: "Notion",
    what: "Plus, one person",
    usd: 12.0,
    replacement: "Joplin Server",
    port: "22300",
    how: "Notes that sync between your laptop and your phone and stay readable as plain files if the company ever folds.",
  },
  {
    id: "files",
    brand: "dropbox",
    swapBrand: "nextcloud",
    service: "Dropbox",
    what: "Plus, 2 TB",
    usd: 11.99,
    replacement: "Nextcloud",
    port: "443",
    how: "Files, calendar, contacts and shared links, without a company reading the folder names.",
  },
  {
    id: "video-sub",
    brand: "youtube",
    swapBrand: null,
    service: "YouTube Premium",
    what: "One account, no ads",
    usd: 13.99,
    replacement: "TubeArchivist",
    port: "8000",
    how: "Subscribe to channels, keep the videos, watch them again in ten years when the channel is gone.",
  },
  {
    id: "books",
    brand: "audible",
    swapBrand: null,
    service: "Audible",
    what: "One credit a month",
    usd: 14.95,
    replacement: "Audiobookshelf",
    port: "13378",
    how: "Your audiobooks with your progress synced, and no licence server deciding whether you may listen.",
  },
  {
    id: "passwords",
    brand: "onepassword",
    swapBrand: null,
    service: "1Password",
    what: "Individual",
    usd: 3.99,
    replacement: "Vaultwarden",
    port: "8080",
    how: "The same browser extensions, talking to a vault that only exists on hardware you can unplug.",
  },
  {
    id: "gym",
    brand: null,
    glyph: "dumbbell",
    swapBrand: null,
    service: "The gym",
    what: "The one you drive past",
    usd: 42.0,
    replacement: "Something you built",
    port: null,
    how: "Not every subscription is software. A written plan, a log you own and a bar in the garage counts here too.",
  },
];

/**
 * The whole program is three moves. Making an account and tracking hours are
 * real requirements but they are paperwork, and paperwork goes in the footnote
 * underneath rather than in the list, where it competed with the actual deal.
 * Keep every body under about twelve words.
 */
export const MOVES = [
  {
    n: "1",
    art: "bubble",
    title: "Pick",
    body: "Anything with a monthly bill. Netflix, Realms, iCloud, the gym.",
  },
  {
    n: "2",
    art: "box",
    title: "Rebuild",
    body: "Same job, your hardware, open source. One file starts it.",
  },
  {
    n: "3",
    art: "disc",
    title: "Keep",
    body: "The hours you logged buy the gear to keep it running.",
  },
];

/** The mechanics, compressed into the strip that closes the section. */
export const FINE_PRINT = [
  "free to enter",
  "ages 13 to 18",
  "sign up on stern",
  "hours tracked in hackatime",
  "non-AI hours only",
];

/**
 * Who runs this. Most people arriving from a link have never heard of Hack
 * Club, and the age rule is the one piece of eligibility that stops people
 * halfway through, so it is stated here rather than buried in the FAQ.
 */
export const HACK_CLUB = {
  headline: "Where teens make cool stuff.",
  body:
    "Hack Club is the world's largest nonprofit movement of teenagers making cool " +
    "projects. Clubs in a thousand schools, hackathons on trains and in ferry " +
    "terminals, and dozens of You Ship We Ship programs like this one, all of it run " +
    "by and for teenagers.",
  eligibility:
    "CloudFALL is open to anyone aged 13 to 18, anywhere on earth. Sign up in your own " +
    "name with your own account, and the hours you log have to be hours you worked.",
  facts: ["13 to 18", "any country", "free, always", "no application"],
};

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
      text: "A live link a reviewer can open and use. Self-hosted only? Ship a repo and docker container.",
      mark: "a repo and docker container",
    },
    {
      tag: "YOURS",
      text: "Your own work. Not a tutorial followed step for step, not somebody else’s project with the colours changed.",
    },
  ],
};

/**
 * Self-hosting help. Most people signing up have never run a server, and the
 * honest blocker is not the code, it is not knowing that an old laptop and one
 * file is genuinely the whole setup. Every line here is something the Slack
 * will walk you through.
 */
export const HELP = [
  {
    tag: "the box",
    title: "You already own the hardware",
    body: "A laptop with a cracked screen, a Raspberry Pi, the desktop in the basement. If it turns on and stays on, it can serve your house.",
  },
  {
    tag: "the setup",
    title: "One file starts the whole thing",
    body: "Almost everything worth running ships a Docker Compose file. Paste it in, run one command, and the service is up. Ask in Slack and someone will read yours line by line.",
  },
  {
    tag: "the network",
    title: "Reach it from anywhere, safely",
    body: "You do not need a static IP or a port forward. A mesh VPN like Tailscale puts your phone and your server on the same private network in about five minutes.",
  },
  {
    tag: "the backup",
    title: "Owning it means keeping it",
    body: "Two copies, one of them somewhere else. That is what the blank discs in the shop are for, and it is the part people skip until they lose something.",
  },
];

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
