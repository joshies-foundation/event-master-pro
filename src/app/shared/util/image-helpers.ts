// Resize an image by painting it onto an HTML canvas and screenshotting the canvas
export function resizeImage(
  imageFile: File,
  width: number,
  height?: number,
): Promise<Blob> {
  return new Promise((resolve) => {
    const image = new Image();
    image.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height ?? width;
      const canvasRenderingContext = canvas.getContext('2d');
      if (canvasRenderingContext) {
        // Calculate cropping area to maintain aspect ratio
        let cropX = 0;
        let cropY = 0;
        let cropWidth = image.width;
        let cropHeight = image.height;
        const aspectRatio = image.width / image.height;
        const targetAspectRatio = canvas.width / canvas.height;

        if (aspectRatio > targetAspectRatio) {
          // Crop the width
          cropWidth = image.height * targetAspectRatio;
          cropX = (image.width - cropWidth) / 2;
        } else {
          // Crop the height
          cropHeight = image.width / targetAspectRatio;
          cropY = (image.height - cropHeight) / 2;
        }
        canvasRenderingContext.drawImage(
          image,
          cropX,
          cropY,
          cropWidth,
          cropHeight,
          0,
          0,
          width,
          height ?? width,
        );
      }
      canvas.toBlob((blob) => resolve(blob as Blob), 'image/webp');
    };

    // get original file as data url
    const fileReader = new FileReader();
    fileReader.addEventListener('load', () => {
      image.src = fileReader.result as string;
    });
    fileReader.readAsDataURL(imageFile);
  });
}
