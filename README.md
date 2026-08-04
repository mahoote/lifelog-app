# Dissertation Lifelog App

Mobile companion application for the MSc dissertation project **Wearable Visual Memory Support for Dementia**.

This repository contains the React Native and Expo application used alongside a Raspberry Pi based wearable capture prototype. The app receives visual data from the wearable device, stores it locally on the phone, performs image quality and similarity filtering, applies AI-assisted metadata generation, and presents the result through separate user and caregiver review interfaces.

## Project Context

Dementia can affect memory, communication, and daily functioning. Passive lifelogging has been explored as one way to provide visual cues for later memory review, but existing systems often require manual data transfer, lack first-person capture, or produce too much visual data for practical review.

This app is part of a proof-of-concept system that investigates whether camera-integrated glasses and a companion mobile application could support a simplified daily visual diary.

The wider prototype consists of:

- A Raspberry Pi Zero 2 W wearable capture device
- A camera module for first-person image and video capture
- A BMI160 IMU for activity-aware capture modes
- Local storage on the wearable device
- Wi-Fi transfer from the wearable to the phone
- This mobile app for transfer, processing, storage, and review

## Repository Purpose

This repository focuses on the **mobile companion application**.

The app is responsible for:

1. Checking connection to the Raspberry Pi wearable device
2. Fetching pending footage metadata from the wearable HTTP server
3. Downloading images and video files to private phone storage
4. Acknowledging successful downloads back to the wearable
5. Storing metadata in a local SQLite database
6. Filtering poor quality and near-duplicate images
7. Generating AI-assisted titles, descriptions, and tags
8. Displaying selected diary images to the user
9. Displaying a richer image and video gallery to a caregiver

## System Role

The app sits between the wearable capture device and the final review interfaces.

```text
Raspberry Pi wearable
        |
        | Wi-Fi HTTP transfer
        v
Companion mobile app
        |
        | local processing and storage
        v
User diary + caregiver gallery
```

The Raspberry Pi captures visual data and exposes it through a local HTTP API. The app connects to this API, downloads pending footage, processes it, and stores the result on the phone.

## Main Features

### Device Connection

The settings screen checks whether the Raspberry Pi wearable is reachable by calling the device health endpoint.

The app treats the wearable as connected when the Raspberry Pi responds successfully.

### Footage Sync

The app can fetch pending footage from the wearable device and download each file by ID.

Supported transfer actions include:

- Fetch pending capture events
- Download image and video files
- Store files in private app storage
- Acknowledge successfully downloaded files
- Report failed downloads

Downloaded footage is stored locally using Expo File System.

Images and videos are stored separately:

```text
document/
  images/
  videos/
```

### Local Database

The app uses SQLite through `expo-sqlite`.

The local database is named:

```text
lifelog.db
```

It stores capture events, footage items, local file URIs, file type and role, processing state, diary metadata, gallery day summaries, generated titles, descriptions, and tags.

Main tables:

```text
capture_event
footage_item
gallery_day
```

### Image Quality Processing

Image quality processing is performed locally on the phone using OpenCV.

Each image is converted to grayscale and analysed using:

- Blur detection using Laplacian variance
- Brightness measurement using mean pixel intensity
- Contrast measurement using standard deviation
- Perceptual hashing for near-duplicate detection

The purpose of this stage is to reduce the number of blurry, visually poor, or repeated images before presenting content to the user.

### Near-Duplicate Detection

The app generates a 64-bit perceptual hash for each image.

The hash is produced by:

1. Resizing the grayscale image
2. Reducing it to an 8 x 8 representation
3. Calculating the average pixel value
4. Encoding each pixel as brighter or darker than the average

Images with a small Hamming distance between hashes are treated as near duplicates.

### AI-Assisted Metadata

Selected images are passed to an AI metadata stage.

The AI stage is used to generate:

- A short title
- A description
- Tags

The generated metadata is intended only to support assistive review and navigation. It should not be treated as medical interpretation or clinical analysis.

The project currently uses the OpenAI API for this stage.

### User Diary

The user-facing diary presents a simplified daily review interface.

It shows selected images one at a time with:

- Date
- Title
- Description
- Tags
- Slideshow playback

This interface is intended to reduce review burden by showing a smaller set of selected diary images rather than the full captured dataset.

### Caregiver Gallery

The caregiver view provides a broader review interface.

It includes:

- Image gallery
- Video gallery
- Individual footage view
- Metadata for each item

The caregiver interface is intended to preserve richer context while keeping the user-facing diary simpler.

## Architecture

The app is organised around Expo Router screens, services, repositories, mappers, types, and Redux state.

Observed project structure:

```text
.
├── app.json
├── eas.json
├── package.json
├── src
│   ├── app
│   │   ├── _layout.tsx
│   │   ├── index.tsx
│   │   ├── caretaker
│   │   ├── debug
│   │   ├── diary
│   │   ├── footage
│   │   └── settings
│   ├── components
│   ├── config
│   ├── constants
│   ├── database.ts
│   ├── hooks
│   ├── mappers
│   ├── repositories
│   ├── services
│   │   ├── aiImageMetadataService.ts
│   │   ├── footageProcessingService.ts
│   │   ├── imageQualityService.ts
│   │   └── lifelogService.ts
│   ├── store
│   ├── types
│   └── utils
├── assets
├── global.css
├── tailwind.config.js
├── tsconfig.json
└── README.md
```

This project uses Expo development builds because native dependencies such as OpenCV are included. Expo Go is unlikely to be sufficient for the full app.

## Installation

Clone the repository:

```bash
git clone https://github.com/mahoote/lifelog-app.git
cd lifelog-app
```

Install dependencies:

```bash
npm install
```

Prepare Husky hooks:

```bash
npm run prepare
```

## Running the App

Start the Expo development server:

```bash
npm run dev
```

Start with a cleared Expo cache:

```bash
npm run dev:clear
```

## Configuration

The app requires configuration for the wearable API and AI metadata stage.

Typical configuration values include:

- Raspberry Pi API base URL
- Maximum local storage limit
- Image processing thresholds
- OpenAI API access

Check the files in:

```text
src/config
src/constants
```

Do not commit secrets or API keys to the repository.

For local development, use environment-specific configuration or a local ignored file if needed.

## Expected Wearable API

The app expects the Raspberry Pi wearable to expose a local HTTP API over Wi-Fi.

### Health Check

```http
GET /health
```

Used by the settings screen to confirm that the device is reachable.

### List Pending Footage

```http
GET /footage
```

Returns capture events and footage items that have not yet been acknowledged by the app.

### Download Footage

```http
GET /footage/:id
```

Downloads a single image or video file.

### Acknowledge Footage

```http
POST /ack
Content-Type: application/json

{
  "file_id": "..."
}
```

Marks a file as successfully downloaded on the wearable.

### Report Failed Footage

```http
POST /failed
Content-Type: application/json

{
  "file_id": "..."
}
```

Marks a file as failed when the app cannot download it correctly.

## Data Model

### Capture Event

A capture event groups one or more footage items produced during a capture cycle.

Stored fields include:

- ID
- Start time
- End time
- Motion state

### Footage Item

A footage item represents an image or video file.

Stored fields include:

- ID
- Capture event ID
- Sequence index
- Type
- Role
- Creation time
- Local file URI
- Size in bytes
- State
- Duration
- Import time
- Day key
- Favourite state
- Processing state
- Title
- Description
- Tags

### Gallery Day

A gallery day stores summary information for a specific day.

Stored fields include:

- Day key
- Image count
- Video count
- First item time
- Last item time
- Cover image URI
- Updated time

## Processing Pipeline

The app processing flow is:

```text
1. Check Raspberry Pi connection
2. Fetch pending footage metadata
3. Download each footage item
4. Store files in private phone storage
5. Insert or update local SQLite records
6. Acknowledge successful downloads
7. Analyse images with OpenCV
8. Reject blurry or low quality images
9. Remove near duplicates using perceptual hashes
10. Generate AI-assisted metadata
11. Update diary and gallery views
```

## Storage Management

The app stores downloaded visual data locally on the phone.

A storage limit is used to prevent the app from occupying excessive space. In the dissertation prototype, a 30 GB local storage limit was used.

When storage limits are reached, the app should avoid downloading additional files or remove older stored footage, depending on the active implementation.

## Research Prototype Limitations

This app is part of a controlled proof-of-concept evaluation.

Current limitations include:

- The app depends on the Raspberry Pi wearable API being available over local Wi-Fi
- AI-assisted metadata generation currently depends on an external API
- Sensitive personal images may be transmitted to a third-party service during AI processing
- Image filtering thresholds are design assumptions, not clinically validated values
- The diary image count and review flow have not been validated with people with dementia
- Real-world user trials were outside the scope of the dissertation prototype
- The system should not be used for medical decision-making

## Related Repository

This app is designed to work with the Raspberry Pi wearable capture system.

Related repository:

```text
lifelog-capture
```

The capture system is responsible for:

- Camera control
- Motion-aware capture modes
- Local storage on the wearable
- FastAPI HTTP server
- Wi-Fi transfer mode
- Download acknowledgement handling

## Development Notes

### Formatting

Run:

```bash
npm run format
```

Check formatting:

```bash
npm run format:check
```

### Linting

Run:

```bash
npm run lint
```

### Git Hooks

The project uses Husky and lint-staged.

On staged source files, lint-staged runs:

```text
eslint --fix
prettier --write
```

On Markdown, JSON, YAML, CSS, and HTML files, it runs:

```text
prettier --write
```

## Academic Context

This project was developed for:

```text
ELEC5882M MSc Individual Project
MSc Embedded Systems Engineering
University of Leeds
```

Project title:

```text
Wearable Visual Memory Support for Dementia
```

Author:

```text
Martin Hoff Teigen
```
