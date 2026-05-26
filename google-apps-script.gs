function doPost(e) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Bookings");

  if (!sheet) {
    sheet = SpreadsheetApp.getActiveSpreadsheet().insertSheet("Bookings");
  }

  if (sheet.getLastRow() === 0) {
    sheet.appendRow([
      "Submitted At",
      "Program",
      "Child Name",
      "Child Age",
      "Parent Name",
      "Email",
      "Phone",
      "Notes"
    ]);
  }

  var data = JSON.parse(e.postData.contents);

  sheet.appendRow([
    data.submittedAt || new Date().toISOString(),
    data.program || "",
    data.childName || "",
    data.childAge || "",
    data.parentName || "",
    data.email || "",
    data.phone || "",
    data.notes || ""
  ]);

  return ContentService
    .createTextOutput(JSON.stringify({ result: "success" }))
    .setMimeType(ContentService.MimeType.JSON);
}
