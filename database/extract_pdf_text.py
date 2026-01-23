import PyPDF2

pdf_path = r'c:/Nextjs/bds/database/speaker-declaration-form.pdf'

with open(pdf_path, 'rb') as f:
    reader = PyPDF2.PdfReader(f)
    text = []
    for page in reader.pages:
        text.append(page.extract_text())

full_text = '\n'.join(text)

with open('c:/Nextjs/bds/database/speaker-declaration-form.txt', 'w', encoding='utf-8') as out:
    out.write(full_text)

print('PDF text extraction complete.')
