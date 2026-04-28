Ran command: `find . -name "abap.jpeg"`
Ran command: `sqlite3 data.db "SELECT id, title, cover_image_url FROM courses WHERE title LIKE '%ABAP%';"`
Ran command: `sqlite3 data.db "UPDATE courses SET cover_image_url = '/images/abap.jpeg' WHERE id = 4;"`

The `abap.jpeg` image has been successfully set as the cover image for the "SAP ABAP Fundamentals and Core Programming Concepts" course! It will now appear on the course card when browsing the platform.