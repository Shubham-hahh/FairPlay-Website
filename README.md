# FairPlay MVP, New Repository

This is the **new repository** for the MVP of FairPlay's website.

➡️ The repository for the **currently running website** ([fairplay.video](https://fairplay.video)) can be found here: [FairPlay-Website\_DEMO](https://github.com/FairPlayTeam/FairPlay-Website_DEMO)


## 🛠 Tech Stack

* **Rust**
* **Dioxus**


## 🤝 Contribute

Want to participate? Join our development community on Discord:
👉 [discord.gg/fairplayteam](https://discord.gg/fairplayteam)


## Developer TODO List, Prioritized by Importance

### 1. Core Infrastructure & Media Handling

* **Video Storage Management**

  * [ ] Design and implement a scalable storage system for video files.
  * [ ] Support large file uploads (chunked uploads + retry logic).

* **FFmpeg + HLS Encoding Pipeline**

  * [ ] Integrate FFmpeg to transcode uploaded videos into HLS (HTTP Live Streaming).
  * [ ] Generate multiple quality levels (240p, 480p, 720p, 1080p).
  * [ ] Store HLS segments and playlists.

* **MinIO Integration**

  * [ ] Use MinIO (S3-compatible) for storing video files and HLS chunks.
  * [ ] Ensure redundancy and access control (private/public buckets).


### 2. User & Access Management

* **Authentication & Connection System**

  * [ ] Implement secure user login and registration (email/password, OAuth).
  * [ ] Manage sessions or JWT tokens for API access.

* **Private Video Access Control**

  * [ ] Ensure private videos are only accessible by their owner.
  * [ ] Prevent unauthorized access via signed URLs or token-based validation.


### 3. Admin & Moderation Tools

* **Admin & Moderator Dashboard**

  * [ ] Manage videos (view, delete, mark as inappropriate).
  * [ ] Ban users.
  * [ ] View reports and logs.


### 4. Video Platform Features

* **Video Feed (Home / Explore)**

  * [ ] Show a dynamic feed of videos based on user preferences.
  * [ ] Allow sorting & filtering by category, tags, or creator.

* **Offline Videos**

  * [ ] Allow users to download videos for offline access (if allowed by creator).

* **Private Videos**

  * [ ] Enable creators to mark videos as private.
  * [ ] Support custom licenses on videos.

* **YouTube Video Import**

  * [ ] Connect user accounts via OAuth.
  * [ ] Allow importing videos directly from YouTube channels.



### 5. User Interaction & Engagement

* **⭐ Rating System**

  * [ ] Replace like/dislike with a 1–5 star rating system.

* **Subscribe Button + Notifications**

  * [ ] Add subscription options:

    * All notifications
    * Important only
    * Don’t notify me
    * Unsubscribe



### 6. Creator Support & Monetization

* **Support the Creator Button**

  * [ ] Allow users to support creators by:

    * Watching rewarded ads
    * Making a small donation (Stripe, PayPal, etc.)

* **Donate to the Creator Button**

  * [ ] Add a dedicated button for one-time or recurring donations.


# Dependencies

This project depends on rust and dioxus.

Follow instructions at https://rustup.rs to install rustup (the rust toolchain manager)

Then run: `rustup install default` to install a rust toolchain

Finally run `cargo install dioxus-cli` to get the dioxus cli

# Development

The workspace contains a member crate for each of the web, desktop and mobile platforms, a `ui` crate for shared components and a `api` crate for shared backend logic:

```
/
├─ web/
│  ├─ ... # Web specific UI/logic
├─ desktop/
│  ├─ ... # Desktop specific UI/logic
├─ mobile/
│  ├─ ... # Mobile specific UI/logic
├─ api/
│  ├─ ... # All shared server logic
├─ ui/
│  ├─ ... # Component shared between multiple platforms
```

## Platform crates

Each platform crate contains the entry point for the platform, and any assets, components and dependencies that are specific to that platform. For example, the desktop crate in the workspace looks something like this:

```
desktop/ # The desktop crate contains all platform specific UI, logic and dependencies for the desktop app
├─ assets/ # Assets used by the desktop app - Any platform specific assets should go in this folder
├─ src/
│  ├─ main.rs # The entrypoint for the desktop app. It also defines the routes for the desktop platform
│  ├─ views/ # The views each route will render in the desktop version of the app
│  │  ├─ mod.rs # Defines the module for the views route and re-exports the components for each route
│  │  ├─ blog.rs # The component that will render at the /blog/:id route
│  │  ├─ home.rs # The component that will render at the / route
├─ Cargo.toml # The desktop crate's Cargo.toml - This should include all desktop specific dependencies
```

When you start developing with the workspace setup each of the platform crates will look almost identical. The UI starts out exactly the same on all platforms. However, as you continue developing your application, this setup makes it easy to let the views for each platform change independently.

## Shared UI crate

The workspace contains a `ui` crate with components that are shared between multiple platforms. You should put any UI elements you want to use in multiple platforms in this crate. You can also put some shared client side logic in this crate, but be careful to not pull in platform specific dependencies. The `ui` crate starts out something like this:

```
ui/
├─ src/
│  ├─ lib.rs # The entrypoint for the ui crate
│  ├─ hero.rs # The Hero component that will be used in every platform
│  ├─ echo.rs # The shared echo component that communicates with the server
│  ├─ navbar.rs # The Navbar component that will be used in the layout of every platform's router
```

## Shared backend logic

The workspace contains a `api` crate with shared backend logic. This crate defines all of the shared server functions for all platforms. Server functions are async functions that expose a public API on the server. They can be called like a normal async function from the client. When you run `dx serve`, all of the server functions will be collected in the server build and hosted on a public API for the client to call. The `api` crate starts out something like this:

```
api/
├─ src/
│  ├─ lib.rs # Exports a server function that echos the input string
```

### Serving Your App

Navigate to the platform crate of your choice:
```bash
cd web
```

and serve:

```bash
dx serve
```
