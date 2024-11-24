# Schemas

## Supported Features
1. Each user has a default name “Alice,” which can be changed by appending name=YourName to the URL.

2. Clicking the "Add Note" button and selecting a spot on the board allows you to type text, which will be uploaded after pressing Enter.

3. Clicking on a note, allowing the note to be modified.

4. Clicking on a note and hitting escape, allows the note to be deleted.

5. The board automatically updates and synchronizes all notes for each user in real time.

## Sticky-note-update schema
For creating and editing Notes.
```json
```json
{
    "type": "sticky-note-update",
    "content": {
        "id": 1,
        "text": "Sticky note",
        "x": 100,
        "y": 100,
        "height": 100,
        "width": 100,
        "color": "#ff0000"
    }
}
```

## Sticky-Note-delete schema
For deleting a sticky note.
```json
{
    "type": "sticky-note-deleted",
    "content": {
        "id": 1
    }
}
```

## User schema
For connecting users and for changing the name.
```json
{
    "type": "user",
    "content": {
        "id": 1,
        "name": "Bob",
        "connected": true
    }
}
```
## User-deleted schema
For disconnecting a user.
```json
{
    "type": "user-deleted",
    "content":{
        "id": 1
    }
}
```