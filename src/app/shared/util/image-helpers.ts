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
        canvasRenderingContext.drawImage(image, 0, 0, width, height ?? width);
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
