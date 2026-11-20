/**
 * 4orth Space — Google Sheets backend for the site's forms and dashboard.
 *
 * SETUP
 * 1. Create a Google Sheet (this will be your database).
 * 2. Extensions > Apps Script. Delete any code, paste this whole file, Save.
 * 3. Deploy > New deployment > type "Web app".
 *      - Description: 4orth API
 *      - Execute as: Me
 *      - Who has access: Anyone
 *    Deploy, authorise, and copy the Web app URL (ends with /exec).
 * 4. In index.html, find:  var SHEET={ url:"" };
 *    Put your URL there:   var SHEET={ url:"https://script.google.com/.../exec" };
 *
 * After that, every booking, Founding 40 application, enquiry and class booking
 * made on the site is appended to a tab here, and the admin dashboard's
 * "Sync sheet" button (and sign-in) pulls the live rows back in.
 */

// Collection -> sheet tab + column order. Add/reorder columns freely.
var TABS = {
  application: { tab: "Applications", cols: ["id","memberId","seat","name","email","phone","work","days","start","visitDate","visitTime","why","picsPolicy","status","received","at"] },
  booking:     { tab: "Bookings",     cols: ["ref","type","space","member","email","phone","date","value","status","received","at"] },
  enquiry:     { tab: "Enquiries",    cols: ["id","name","email","topic","message","status","received","at"] },
  "class":     { tab: "Classes",      cols: ["id","session","title","day","time","date","name","email","phone","status","received","at"] },
  member:      { tab: "Members",      cols: ["id","name","email","phone","tier","points","space","since","status","received","at"] }
};
// Which tab feeds which collection name in the dashboard read.
var COLLECTION = { application:"applications", booking:"bookings", enquiry:"enquiries", "class":"classes", member:"members" };

function sheetFor(name) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  return ss.getSheetByName(name) || ss.insertSheet(name);
}

function doPost(e) {
  try {
    var body = JSON.parse(e.postData.contents);
    var def = TABS[body.kind];
    if (!def) return json({ ok: false, error: "unknown kind: " + body.kind });
    var sh = sheetFor(def.tab);
    if (sh.getLastRow() === 0) sh.appendRow(def.cols);
    var data = body.data || {};
    sh.appendRow(def.cols.map(function (c) { return data[c] !== undefined && data[c] !== null ? data[c] : ""; }));
    return json({ ok: true });
  } catch (err) {
    return json({ ok: false, error: String(err) });
  }
}

function doGet(e) {
  var out = {};
  Object.keys(TABS).forEach(function (kind) {
    out[COLLECTION[kind]] = rows(TABS[kind].tab);
  });
  var payload = JSON.stringify(out);
  var cb = e && e.parameter && e.parameter.callback;
  if (cb) return ContentService.createTextOutput(cb + "(" + payload + ")").setMimeType(ContentService.MimeType.JAVASCRIPT);
  return ContentService.createTextOutput(payload).setMimeType(ContentService.MimeType.JSON);
}

function rows(tabName) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sh = ss.getSheetByName(tabName);
  if (!sh) return [];
  var values = sh.getDataRange().getValues();
  if (values.length < 2) return [];
  var head = values[0];
  return values.slice(1).map(function (r) {
    var o = {};
    head.forEach(function (h, i) { o[h] = r[i]; });
    return o;
  }).reverse(); // newest first
}

function json(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}
