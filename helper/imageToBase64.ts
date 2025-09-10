import * as FileSystem from "expo-file-system";
import * as ImageManipulator from "expo-image-manipulator";

const MAX_SIZE_MB = 2; // compress only if bigger than 2MB

const imageToBase64 = async (imageUri: string) => {
  let base64Image = "";
  try {
    // get file info first
    const fileInfo = await FileSystem.getInfoAsync(imageUri);

    let finalUri = imageUri;

    if (
      fileInfo.exists &&
      fileInfo.size &&
      fileInfo.size > MAX_SIZE_MB * 1024 * 1024
    ) {
      // 🔹 compress + resize if bigger than 2MB
      const manipulatedImage = await ImageManipulator.manipulateAsync(
        imageUri,
        [{ resize: { width: 800 } }], // resize to reduce size
        {
          compress: 0.7, // adjust between 0 (max compression) and 1 (no compression)
          format: ImageManipulator.SaveFormat.JPEG,
        }
      );

      finalUri = manipulatedImage.uri;
    }

    // convert to base64
    base64Image = await FileSystem.readAsStringAsync(finalUri, {
      encoding: FileSystem.EncodingType.Base64,
    });

    base64Image = `data:image/jpeg;base64,${base64Image}`;
  } catch (err) {
    console.error("Error converting image to base64:", err);
  }
  return base64Image;
};

export default imageToBase64;
