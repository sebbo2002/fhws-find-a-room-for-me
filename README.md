# find-a-room-for.me Backend

[![License](https://img.shields.io/badge/license-MIT-blue.svg?style=flat-square)](LICENSE)

### Installation

#### Directly

You'll need [node.js](https://nodejs.org/en/) to run this.

```bash
git clone https://github.com/sebbo2002/fhws-find-a-room-for-me.git
cd ./fhws-find-a-room-for-me
npm install
```


#### Docker

You can also use the docker container to run the server:

```bash
docker pull sebbo2002/fhws-find-a-room-for-me
```


### Configuration

<table>
    <tr>
        <th scope="row">PORT</td>
        <td>Port the server should bind on, defaults to 8080</td>
    </tr>
    <tr>
        <th scope="row">DB</td>
        <td>Database URI, for example "mysql://127.0.0.1:3306/find-me-a-room"</td>
    </tr>
    <tr>
        <th scope="row">FCM_SERVER_KEY</td>
        <td>Firebase Cloud Messaging Server Key</td>
    </tr>
    <tr>
        <th scope="row">RAVEN_DSN</td>
        <td>Raven DSN for Sentry Error Logging</td>
    </tr>
</table>


### API

#### POST /sessions
- creates a new session
- sent after accepting the Terms and Conditions

###### Request
```json
{
    "systemVersion": "7.1",
    "deviceName": "Google Pixel",
    "pushToken": "85a78e47-4f4a-47d2-9461-9fa309c96387"
}
```

###### Response
```json
{
    "id": "f1cd2db4-d530-4d12-b084-0b4f33ec83fb",
    "secret": "cLpxwCcMwLfZkrbmbbHibTp9",
    "systemVersion": "7.1",
    "deviceName": "Google Pixel",
    "pushToken": "85a78e47-4f4a-47d2-9461-9fa309c96387"
}
```

#### PATCH /sessions/{id}
- updates the current session
- sent to update push token or OS-Version if neccesary

###### Request
```json
{
    "osVersion": "7.1",
    "pushToken": "85a78e47-4f4a-47d2-9461-9fa309c96387"
}
```

###### Response
Server will respond with the full model (withou secret of course).

#### GET /states
- get all states possible for checkin
- requested on app startup
- allowed without session to make things in parallel
- should be cached

###### Response
```json
[
  {
    "id": 1,
    "emoji": "⛔️",
    "title": "Privat",
    "descriptionHeadline": "Was bedeutet „Privat"?",
    "description": "Wenn du „Privat" auswählst, bekommen alle Kommilitonen den Raum als belegt angezeigt.",
    "commentRequired": false
  },
  {
    "id": 2,
    "emoji": "🔇",
    "title": "Bitte leise sein",
    "descriptionHeadline": "„Leise"?",
    "description": "Wenn du „Leise" auswählst, bekommen alle Kommilitonen den Raum als belegt angezeigt. Sie dürfen allerdings mit zu Dir kommen, wenn sie leise sind.",
    "commentRequired": false
  },
  {
    "id": 3,
    "emoji": "🤓",
    "title": "Privat-Tutorium",
    "descriptionHeadline": "Wann wähle ich „Tutorium"?",
    "description": "Indem du „Tutorium" auswählst kannst du Kommilitonen darauf aufmerksam machen, dass hier ein privates Tutorium stattfindet.",
    "commentRequired": true
  }
]
```

#### GET /location
- get all available locations
- requested on app startup
- should be cached

###### Response
```json
[
  {
    "id": "04ab13b4-70b9-431b-af43-2c283472ec42",
    "name": {
      "short": "Münz",
      "long": "Münzstraße / Sanderring"
    },
    "geoLocation": {
      "lat": 49.7871884,
      "lng": 9.9303223
    }
  }
]
```

#### GET /location/{locationId}/rooms
- get all rooms sorted by ranking score and personal favs
- room includes next events in this room

###### Response
```json
[
  {
    "id": "41c67364-e189-49d2-b16a-a2ce9b8e7ff8",
    "name": "H.1.11",
    "inventory": {
      "projectors": 2,
      "speakerDeskDisplay": 2,
      "speakerFloorDisplays": 1,
      "seats": 39,
      "whiteboards": 1,
      "sound": null
    },
    "score": 834,
    "isFav": null,
    "color": "green",
    "text": "frei",
    "checkinAllowed": true,
    "freeTill": null,
    "occupiedTill": null,
    "thenOccupiedTill": null,
    "thenFreeTill": null
  }
]
```

#### GET /room/{id}/occupations
- listet die nächsten Veranstaltungen / Buchungen in diesem Raum

```json
[
  {
    "id": "d27d3968-4d20-405a-9f36-86c0df2bf0b5",
    "emoji": "🗣",
    "title": "Ü Mathematik II",
    "description": "ZEIT- & RAUMÄNDERUNG - auch für Mathematik II Gruppe WINF2",
    "course": "BEC",
    "lecturer": "Prof. Dr. Keller",
    "from": "2017-06-28T13:15:00.000Z",
    "till": "2017-06-28T14:45:00.000Z"
  }
]
```

#### PATCH /room/{id}
- benötigt um Räume als Favorit zu markieren

###### Request _(Fav)_
```json
{
    "isFav": true
}
```

###### Request _(Unfav)_
```json
{
    "isFav": false
}
```

###### Response
`204 No Content`

#### POST /checkins

###### Request
```json
{
    "roomId": "a3fa9610-4d20-405a-9f36-86c0df2bf3c8",
    "stateId": 2,
    "description": null
}
```

###### Response
```json
{
    "id": "df7c1265-f288-4735-8d42-558cdf9ced91",
    "roomId": "a3fa9610-4d20-405a-9f36-86c0df2bf3c8",
    "stateId": 2,
    "description": null,
    "from": "2017-06-28T13:15:00.000Z",
    "maxTill": "2017-06-28T15:30:00.000Z",
    "verifiedTill": "2017-06-28T14:00:00.000Z"
}
```

#### GET /checkins

###### Response
```json
[
  {
    "id": "df7c1265-f288-4735-8d42-558cdf9ced91",
    "roomId": "41c67364-e189-49d2-b16a-a2ce9b8e7ff8",
    "description": null,
    "from": "2017-07-10T15:15:17.000Z",
    "maxTill": "2017-07-10T17:15:17.000Z",
    "verifiedTill": "2017-07-10T16:00:17.000Z"
  }
]
```

#### PATCH /checkins/{id}

###### Request
```json
{
    "roomId": "41c67364-e189-49d2-b16a-a2ce9b8e7ff8",
    "stateId": 2,
    "description": "Hi na…"
}
```

###### Response
```json
{
    "id": "df7c1265-f288-4735-8d42-558cdf9ced91",
    "roomId": "41c67364-e189-49d2-b16a-a2ce9b8e7ff8",
    "description": "Hi na…",
    "stateId": 2,
    "from": "2017-07-10T15:15:17.000Z",
    "maxTill": "2017-07-10T17:15:17.000Z",
    "verifiedTill": "2017-07-10T16:00:17.000Z"
}
```

#### DELETE /checkins/{id}

###### Response
`204 No Content`
