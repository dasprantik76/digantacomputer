The original 3722 × 2480 certificate JPG is bundled as `diganta-certificate-template.jpg`
and served from this website to avoid cross-origin image-loading failures.
`certificateTemplateUrl` in ../site-config.js points to this local asset.
Source: https://ik.imagekit.io/d3ycnoiwd/academy/student-certificate/diganta-certificate-template.jpg

The canvas leaves the certificate background unchanged and overlays `student.photoUrl` when present.
The printed QR code remains part of the background; it is not a student-specific verification QR.
Keep this Diganta-branded template only on the appropriate academy deployment.

Existing data: id, name/fullName, fatherName, joinDate, first enrolled course title and duration.
Passport photos selected during registration are uploaded to ImageKit and saved as `photoUrl`,
`imageKitFileId`, and `imageKitFilePath`. Other optional student fields are certificateSerial,
certificateIssueDate (YYYY-MM-DD), completionDate (YYYY-MM-DD), and grade.
Missing values remain blank; the joining date is never substituted for the issue date.
For remote image URLs, the server must allow CORS for canvas download.

Next: open the Certificate page, verify a Completed student using phone and DOB,
check text alignment, then Download PNG or Print / Save PDF (disable browser headers/footers).
Coordinates are in certificate-canvas.js using the 1920 × 1280 preview coordinate system;
the exported image is 3722 × 2480. Adjust field coordinates there if your original layout differs.
