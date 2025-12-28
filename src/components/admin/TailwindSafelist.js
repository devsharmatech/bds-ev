"use client";

export default function TailwindSafelist() {
  // This hidden element declares a broad set of Tailwind classes so that
  // admin-authored HTML content using these utilities will render as expected.
  // Keep this list focused to avoid excessive CSS size.
  const safelist =
    "prose prose-sm prose-base prose-lg prose-xl max-w-none " +
    // text colors/sizes/weights
    "text-left text-center text-right text-justify " +
    "text-xs text-sm text-base text-lg text-xl text-2xl text-3xl text-4xl text-5xl " +
    "font-light font-normal font-medium font-semibold font-bold italic underline line-through " +
    // spacing
    "m-0 m-2 m-4 m-6 m-8 mt-4 mb-4 ml-4 mr-4 mx-4 my-4 p-0 p-2 p-4 p-6 p-8 pt-4 pb-4 pl-4 pr-4 px-4 py-4 " +
    // layout
    "block inline inline-block flex inline-flex grid hidden " +
    "items-start items-center items-end justify-start justify-center justify-end " +
    "gap-2 gap-3 gap-4 gap-6 gap-8 " +
    // width/height
    "w-full w-auto max-w-none max-w-screen-sm max-w-screen-md max-w-screen-lg " +
    "h-auto " +
    // backgrounds/borders/rounding/shadows
    "bg-white bg-gray-50 bg-gray-100 bg-gray-200 bg-gray-800 bg-[#03215F] bg-[#AE9B66] " +
    "text-white text-gray-800 text-gray-600 text-[#03215F] " +
    "border border-0 border-2 border-gray-200 border-gray-300 border-[#03215F] " +
    "rounded rounded-md rounded-lg rounded-xl " +
    "shadow shadow-sm shadow-md shadow-lg " +
    // lists
    "list-disc list-decimal pl-4 pl-6 " +
    // grid columns
    "grid-cols-1 grid-cols-2 grid-cols-3 grid-cols-4 md:grid-cols-2 md:grid-cols-3 md:grid-cols-4 " +
    // columns for text
    "columns-1 columns-2 md:columns-2 md:columns-3 " +
    // misc
    "leading-tight leading-snug leading-normal leading-relaxed leading-loose " +
    "tracking-tight tracking-normal tracking-wide";

  return (
    <div className="hidden">
      <div className={safelist} />
    </div>
  );
}





