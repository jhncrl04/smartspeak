import * as FileSystem from "expo-file-system";

const imageToBase64 = async (imageUri: string) => {
  let base64Image = "";

  if (/^data:image\/[a-z]+;base64,/.test(imageUri)) {
    return imageUri;
  }

  try {
    base64Image = await FileSystem.readAsStringAsync(imageUri, {
      encoding: "base64",
    });

    base64Image = `data:image/jpeg;base64,${base64Image}`;
  } catch (err) {
    console.error("Error converting image to base64:", err);
  }
  return base64Image;
};

export default imageToBase64;

/* uncomment when expo-image-manipulator is installed and created a new build with it */

// import * as FileSystem from "expo-file-system";
// import { manipulateAsync, SaveFormat } from "expo-image-manipulator";

// // Average compression settings for all image types in the app
// const COMPRESSION_SETTINGS = {
//   quality: 0.75, // 75% quality - good balance for all image types
//   maxWidth: 600,
//   maxHeight: 600,
//   format: SaveFormat.JPEG,
// } as const;

// const imageToBase64 = async (imageUri: string) => {
//   let base64Image = "";

//   // If already base64, return as is
//   if (/^data:image\/[a-z]+;base64,/.test(imageUri)) {
//     return imageUri;
//   }

//   try {
//     // Compress the image using constant settings
//     const compressedImage = await manipulateAsync(
//       imageUri,
//       [
//         {
//           resize: {
//             width: COMPRESSION_SETTINGS.maxWidth,
//             height: COMPRESSION_SETTINGS.maxHeight,
//           },
//         },
//       ],
//       {
//         compress: COMPRESSION_SETTINGS.quality,
//         format: COMPRESSION_SETTINGS.format,
//       }
//     );

//     // Convert compressed image to base64
//     base64Image = await FileSystem.readAsStringAsync(compressedImage.uri, {
//       encoding: "base64",
//     });

//     // Add data URI prefix
//     base64Image = `data:image/jpeg;base64,${base64Image}`;

//     // Log compression stats in development
//     if (__DEV__) {
//       const originalStats = await FileSystem.getInfoAsync(imageUri);
//       const compressedStats = await FileSystem.getInfoAsync(
//         compressedImage.uri
//       );

//       if (originalStats.exists && compressedStats.exists) {
//         const originalSize = originalStats.size || 0;
//         const compressedSize = compressedStats.size || 0;
//         const reduction = (
//           ((originalSize - compressedSize) / originalSize) *
//           100
//         ).toFixed(1);

//         console.log(
//           `Image compression: ${(originalSize / 1024).toFixed(1)}KB → ${(
//             compressedSize / 1024
//           ).toFixed(1)}KB (${reduction}% reduction)`
//         );
//       }
//     }
//   } catch (err) {
//     console.error("Error compressing and converting image:", err);

//     // Fallback: try to convert original without compression
//     try {
//       base64Image = await FileSystem.readAsStringAsync(imageUri, {
//         encoding: "base64",
//       });
//       base64Image = `data:image/jpeg;base64,${base64Image}`;
//       console.warn("Used original image without compression due to error");
//     } catch (fallbackErr) {
//       console.error("Fallback conversion also failed:", fallbackErr);
//       return "";
//     }
//   }

//   return base64Image;
// };

// export default imageToBase64;
