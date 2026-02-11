/**
 * Client-side utility for uploading files directly to Supabase Storage
 * via signed URLs. Bypasses the Next.js API route to avoid Vercel
 * timeout and body-size limits.
 *
 * Usage:
 *   import { uploadFile, uploadFiles } from "@/lib/uploadClient";
 *   const { publicUrl, path } = await uploadFile(file, "gallery", "albums/123");
 */

/**
 * Upload a single file to Supabase Storage via signed URL.
 *
 * @param {File} file - The File object to upload
 * @param {string} bucket - Supabase storage bucket name
 * @param {string} folder - Folder path inside the bucket (e.g. "verification/userId")
 * @param {(progress: number) => void} [onProgress] - Optional progress callback (0-100)
 * @returns {Promise<{ publicUrl: string, path: string }>}
 */
export async function uploadFile(file, bucket, folder, onProgress) {
  if (!file || !(file instanceof File) || file.size === 0) {
    throw new Error("No valid file provided");
  }

  // 1) Get a signed upload URL from our lightweight API
  const res = await fetch("/api/upload/signed-url", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      bucket,
      folder,
      fileName: file.name,
      contentType: file.type,
    }),
  });

  const data = await res.json();

  if (!data.success || !data.signedUrl) {
    throw new Error(data.message || "Failed to get upload URL");
  }

  // 2) Upload the file directly to Supabase Storage using the signed URL
  //    Use XMLHttpRequest for progress tracking when needed
  if (onProgress) {
    await uploadWithProgress(data.signedUrl, file, onProgress);
  } else {
    const uploadRes = await fetch(data.signedUrl, {
      method: "PUT",
      headers: {
        "Content-Type": file.type || "application/octet-stream",
      },
      body: file,
    });

    if (!uploadRes.ok) {
      const errText = await uploadRes.text().catch(() => "Upload failed");
      throw new Error(`Direct upload failed: ${errText}`);
    }
  }

  return {
    publicUrl: data.publicUrl,
    path: data.path,
  };
}

/**
 * Upload multiple files in parallel.
 *
 * @param {Array<{ file: File, bucket: string, folder: string }>} items
 * @returns {Promise<Array<{ publicUrl: string, path: string }>>}
 */
export async function uploadFiles(items) {
  return Promise.all(
    items.map(({ file, bucket, folder }) => uploadFile(file, bucket, folder))
  );
}

/**
 * Upload with XMLHttpRequest for progress tracking.
 */
function uploadWithProgress(signedUrl, file, onProgress) {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("PUT", signedUrl);
    xhr.setRequestHeader("Content-Type", file.type || "application/octet-stream");

    xhr.upload.addEventListener("progress", (e) => {
      if (e.lengthComputable) {
        const pct = Math.round((e.loaded / e.total) * 100);
        onProgress(pct);
      }
    });

    xhr.addEventListener("load", () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        resolve();
      } else {
        reject(new Error(`Upload failed with status ${xhr.status}`));
      }
    });

    xhr.addEventListener("error", () => reject(new Error("Upload network error")));
    xhr.addEventListener("abort", () => reject(new Error("Upload aborted")));

    xhr.send(file);
  });
}
