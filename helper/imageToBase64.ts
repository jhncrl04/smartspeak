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
