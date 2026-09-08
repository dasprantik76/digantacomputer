The certificate background is hosted on ImageKit and configured using
`certificateTemplateUrl` in ../site-config.js. No local template file is required.
Source: https://ik.imagekit.io/d3ycnoiwd/academy/student-certificate/diganta-certificate-template.jpg

The canvas covers the sample portrait and inserts student.photoUrl if present.
The printed QR code remains part of the background; it is not a student-specific verification QR.
Keep this Diganta-branded template only on the appropriate academy deployment.

Existing data: id, name/fullName, fatherName, joinDate, first enrolled course title and duration.
Optional student fields: certificateSerial, certificateIssueDate (YYYY-MM-DD),
completionDate (YYYY-MM-DD), grade, photoUrl. These optional fields do not yet have admin form controls.
Missing values remain blank; the joining date is never substituted for the issue date.
For remote image URLs, the server must allow CORS for canvas download.

Next: open the Certificate page, verify a Completed student using phone and DOB,
check text alignment, then Download PNG or Print / Save PDF (disable browser headers/footers).
Coordinates are in certificate-canvas.js using the 1920 × 1280 preview coordinate system;
the exported image is 3722 × 2480. Adjust field coordinates there if your original layout differs.
