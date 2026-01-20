const fs = require('fs');
const path = require('path');

function parseCsvLine(line) {
  const values = [];
  let current = '';
  let inQuotes = false;

  for (let j = 0; j < line.length; j++) {
    const char = line[j];
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      values.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  values.push(current.trim());
  return values.map((v) => v.replace(/^"|"$/g, ''));
}

function safeJoinCsv(values) {
  return values
    .map((v) => {
      if (v == null) return '';
      const str = String(v);
      if (str.includes(',') || str.includes('"') || str.includes('\n')) {
        return '"' + str.replace(/"/g, '""') + '"';
      }
      return str;
    })
    .join(',');
}

function main() {
  const srcPath = path.join(__dirname, '..', 'database', 'BDS_list_final-csv.csv');
  if (!fs.existsSync(srcPath)) {
    console.error('Source CSV not found at', srcPath);
    process.exit(1);
  }

  const text = fs.readFileSync(srcPath, 'utf8');
  const lines = text.split('\n');
  if (lines.length < 2) {
    console.error('CSV has no data rows');
    process.exit(1);
  }

  const headerLine = lines[0];
  const headers = parseCsvLine(headerLine).map((h) => h.trim());
  const emailIndex = headers.findIndex((h) => h.toLowerCase() === 'email');
  if (emailIndex === -1) {
    console.error('CSV must contain an email column');
    process.exit(1);
  }

  const usedEmails = new Set(); // store lowercase emails to ensure uniqueness
  const outLines = [headerLine.trim()];
  let modifiedCount = 0;

  for (let i = 1; i < lines.length; i++) {
    const rawLine = lines[i];
    if (!rawLine.trim()) {
      // keep empty lines as-is
      continue;
    }

    const values = parseCsvLine(rawLine);
    if (values.length !== headers.length) {
      // malformed row, keep as-is
      outLines.push(rawLine.trim());
      continue;
    }

    const original = values[emailIndex] || '';
    const base = original.trim();

    if (!base) {
      // no email, just keep row
      outLines.push(safeJoinCsv(values));
      continue;
    }

    const atIndex = base.indexOf('@');
    if (atIndex === -1) {
      // invalid email format, keep as-is
      const lower = base.toLowerCase();
      if (lower) usedEmails.add(lower);
      outLines.push(safeJoinCsv(values));
      continue;
    }

    // choose a unique candidate by adding a digit before @ when needed
    let candidate = base;
    let candidateLower = candidate.toLowerCase();
    let suffix = 2;

    while (usedEmails.has(candidateLower)) {
      candidate = base.slice(0, atIndex) + String(suffix) + base.slice(atIndex);
      candidateLower = candidate.toLowerCase();
      suffix++;
    }

    if (candidate !== base) {
      modifiedCount++;
    }

    usedEmails.add(candidateLower);
    values[emailIndex] = candidate;
    outLines.push(safeJoinCsv(values));
  }

  const outPath = path.join(__dirname, '..', 'database', 'BDS_list_final-csv_deduped_emails.csv');
  fs.writeFileSync(outPath, outLines.join('\n'), 'utf8');
  console.log(`Processed ${lines.length - 1} data rows.`);
  console.log(`Modified ${modifiedCount} duplicate emails.`);
  console.log('Written updated CSV to', outPath);
}

main();
