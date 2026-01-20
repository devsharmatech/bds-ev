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
  return values.map(v => v.replace(/^"|"$/g, ''));
}

function main() {
  const csvPath = path.join(__dirname, '..', 'database', 'BDS_list19_with_phone.csv');
  if (!fs.existsSync(csvPath)) {
    console.error('CSV file not found at', csvPath);
    process.exit(1);
  }

  const text = fs.readFileSync(csvPath, 'utf8');
  const lines = text.split('\n').filter(line => line.trim());
  if (lines.length < 2) {
    console.error('CSV has no data rows');
    process.exit(1);
  }

  const headerLine = lines[0];
  const headers = parseCsvLine(headerLine).map(h => h.trim());

  const emailIndex = headers.findIndex(h => h.toLowerCase() === 'email');
  const codeIndex = headers.findIndex(h => h.toLowerCase() === 'membership_code');

  if (emailIndex === -1 || codeIndex === -1) {
    console.error('CSV must contain email and membership_code columns');
    process.exit(1);
  }

  const rows = [];
  const emailCounts = new Map();
  const codeCounts = new Map();

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i];
    const values = parseCsvLine(line);
    if (values.length !== headers.length) {
      // skip malformed lines
      continue;
    }
    const email = (values[emailIndex] || '').trim().toLowerCase();
    const code = (values[codeIndex] || '').trim();

    const row = { index: i + 1, values, email, code };
    rows.push(row);

    if (email) {
      emailCounts.set(email, (emailCounts.get(email) || 0) + 1);
    }
    if (code) {
      codeCounts.set(code, (codeCounts.get(code) || 0) + 1);
    }
  }

  // collect duplicates
  const duplicateRows = [];
  for (const row of rows) {
    const reasons = [];
    if (row.email && emailCounts.get(row.email) > 1) {
      reasons.push('duplicate_email');
    }
    if (row.code && codeCounts.get(row.code) > 1) {
      reasons.push('duplicate_membership_code');
    }
    if (reasons.length > 0) {
      duplicateRows.push({ ...row, reasons });
    }
  }

  const outPath = path.join(__dirname, '..', 'database', 'BDS_list19_duplicates.csv');
  const extraHeader = 'duplicate_reasons';
  const outHeader = headerLine.trim() + ',' + extraHeader;

  const outLines = [outHeader];
  for (const row of duplicateRows) {
    // re-quote any fields containing commas
    const safeValues = row.values.map(v => {
      if (v.includes(',') || v.includes('"')) {
        return '"' + v.replace(/"/g, '""') + '"';
      }
      return v;
    });
    const reasonStr = row.reasons.join('|');
    safeValues.push('"' + reasonStr + '"');
    outLines.push(safeValues.join(','));
  }

  fs.writeFileSync(outPath, outLines.join('\n'), 'utf8');
  console.log(`Found ${duplicateRows.length} duplicate rows. Written to`, outPath);
}

main();
