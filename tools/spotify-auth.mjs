import { createServer } from 'http';
import { createHash, randomBytes } from 'crypto';
import { spawn } from 'child_process';
import { createInterface } from 'readline/promises'
import { stdin, stdout } from 'process';
import * as url from "node:url";

const redirectURI = 'http://127.0.0.1:4383/callback';
const scopes = [
    'user-read-playback-state',
    'user-modify-playback-state',
]

function base64Url(url) {
    return Buffer.from(url).toString('base64url');
}

function openBrowser(url) {
    console.log('Open this URL in your browser: ' + url);
}

async function getClientID() {
    return process.env.SPOTIFY_CLIENT_ID;
}

function waitForCallback() {
    let resolveCallback;
    let rejectCallback;

    const callback = new Promise((resolve, reject) => {
        resolveCallback = resolve;
        rejectCallback = reject;
    });

    const server = createServer((req, res) => {
        const url = new URL(req.url ?? '/', redirectURI);

        if (url.pathname !== '/callback') {
            res.writeHead(404).end("Not Found");
            return;
        }

        res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
        res.end(`
            <!doctype html>
            <html lang="en">
              <body style="font-family: sans-serif">
                <h1>Spotify authorization received</h1>
                <p>You can close this window and return to the terminal.</p>
              </body>
            </html>
        `)

        resolveCallback(url);
    });

    server.on("error", rejectCallback);

    const listening = new Promise((resolve) => {
        server.listen(4383, "127.0.0.1", resolve);
    });

    return { server, callback, listening };
}

const clientID = await getClientID();
const verifier = base64Url(randomBytes(64));
const challenge = base64Url(
    createHash('sha256').update(verifier).digest()
);
const state = base64Url(randomBytes(24));

const authorizeURL = new URL("https://accounts.spotify.com/authorize");
authorizeURL.search = new URLSearchParams({
    client_id: clientID,
    response_type: 'code',
    redirect_uri: redirectURI,
    scope: scopes.join(" "),
    state,
    code_challenge_method: "S256",
    code_challenge: challenge,
}).toString();

const { server, callback, listening } = waitForCallback();

try {
    await listening;

    console.log("\nOpening Spotify Auth...");
    openBrowser(authorizeURL.toString());

    const timeout = new Promise((_, reject) => {
        setTimeout(
            () => reject(new Error('Spotify Auth timeout')),
            5 * 60 * 1000
        )
    })

    const callabckURL = await Promise.race([callback, timeout]);

    if (callabckURL.searchParams.get('state') !== state) {
        throw new Error("Spotify returned an invalid OAuth state.")
    }

    const spotifyError = callabckURL.searchParams.get("error");
    if (spotifyError) {
        throw new Error(`Spotify authorization failed: ${spotifyError}`);
    }

    const code = callabckURL.searchParams.get("code");
    if (!code) {
        throw new Error("Spotify did not return an authorization code.");
    }

    const tokenResponse = await fetch(
        "https://accounts.spotify.com/api/token",
        {
            method: "POST",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
            },
            body: new URLSearchParams({
                client_id: clientID,
                grant_type: "authorization_code",
                code,
                redirect_uri: redirectURI,
                code_verifier: verifier,
            }),
        },
    );

    const token = await tokenResponse.json();
    if (!tokenResponse.ok || !token.refresh_token) {
        throw new Error(
            `Token exchange failed: ${
                token.error_description ?? token.error ?? tokenResponse.status
            }`,
        );
    }

    console.log("\nAdd these values to .env:\n");
    console.log(`VITE_SPOTIFY_CLIENT_ID=${clientID}`);
    console.log(`VITE_SPOTIFY_REFRESH_TOKEN=${token.refresh_token}`);
} finally {
    server.close();
}
