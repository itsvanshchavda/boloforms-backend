import { PDFDocument, StandardFonts, rgb } from "pdf-lib";

const convertPdf = async (pdfBuffer, fields) => {
  const pdfDoc = await PDFDocument.load(pdfBuffer);
  const pages = pdfDoc.getPages();
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);

  for (const field of fields) {
    const page = pages[field.page - 1];
    if (!page) continue;

    const { width: pageWidth, height: pageHeight } = page.getSize();
    const coords = convertCoordinates(field, pageWidth, pageHeight);

    await FIELD_RENDERERS[field.type]?.(page, field, coords, pdfDoc, font);
  }

  return await pdfDoc.save();
};

const FIELD_RENDERERS = {
  text: async (page, field, coords, pdfDoc, font) => {
    if (!field.value) return;

    const borderGray100 = rgb(243 / 255, 244 / 255, 246 / 255);

    page.drawRectangle({
      ...coords,
      borderColor: borderGray100,
      borderWidth: 1,
    });

    const fontSize = Math.min(coords.height * 0.5, 12);
    page.drawText(field.value, {
      x: coords.x + 5,
      y: coords.y + coords.height / 2 - fontSize / 3,
      size: fontSize,
      font,
      color: rgb(0, 0, 0),
    });
  },

  signature: async (page, field, coords, pdfDoc) => {
    if (field.value?.startsWith("data:image")) {
      await drawImage(page, field.value, coords, pdfDoc);
    }
  },

  image: async (page, field, coords, pdfDoc) => {
    if (field.value?.startsWith("data:image")) {
      await drawImage(page, field.value, coords, pdfDoc);
    }
  },

  date: async (page, field, coords, pdfDoc, font) => {
    if (!field.value) return;

    const borderGray100 = rgb(243 / 255, 244 / 255, 246 / 255);

    page.drawRectangle({
      ...coords,
      borderColor: borderGray100,
      borderWidth: 1,
    });

    const formattedDate = new Date(field.value).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });

    const fontSize = Math.min(coords.height * 0.5, 11);
    page.drawText(formattedDate, {
      x: coords.x + 5,
      y: coords.y + coords.height / 2 - fontSize / 3,
      size: fontSize,
      borderColor: rgb(0.8, 0.5, 0.2),
      borderWidth: 1,
      font,
      color: rgb(0, 0, 0),
    });
  },

  radio: async (page, field, coords, pdfDoc, font) => {
    const optionGap = 45;
    const circleRadius = 6;

    const startX = coords.x + 10;
    const centerY = coords.y + coords.height / 2;

    field.radioOptions?.forEach((opt, index) => {
      const circleX = startX + index * optionGap;

      page.drawCircle({
        x: circleX,
        y: centerY,
        size: circleRadius,
        borderColor: rgb(0.2, 0.2, 0.2),
        borderWidth: 1,
      });

      if (opt.checked) {
        page.drawCircle({
          x: circleX,
          y: centerY,
          size: circleRadius * 0.5,
          color: rgb(0, 0.4, 1),
        });
      }

      page.drawText(opt.optionText, {
        x: circleX + 15,
        y: centerY - 4,
        size: 10,
        font,
        color: rgb(0, 0, 0),
      });
    });
  },
};

const convertCoordinates = (field, pageWidth, pageHeight) => {
  const { x, y, width, height } = field?.position || {};

  const absoluteX = x * pageWidth;
  const absoluteY = y * pageHeight;
  const absoluteWidth = width * pageWidth;
  const absoluteHeight = height * pageHeight;

  return {
    x: Math.round(absoluteX),
    y: Math.round(pageHeight - absoluteY - absoluteHeight),
    width: Math.round(absoluteWidth),
    height: Math.round(absoluteHeight),
  };
};

const drawImage = async (page, base64Image, coords, pdfDoc) => {
  const imageData = base64Image.split(",")[1];
  const imageBuffer = Buffer.from(imageData, "base64");

  const image = base64Image.includes("image/png")
    ? await pdfDoc.embedPng(imageBuffer)
    : await pdfDoc.embedJpg(imageBuffer);

  const { width: imgWidth, height: imgHeight } = image.scale(1);
  const fit = calculateAspectFit(
    imgWidth,
    imgHeight,
    coords.width,
    coords.height
  );

  page.drawImage(image, {
    x: coords.x + fit.offsetX,
    y: coords.y + fit.offsetY,
    width: fit.width,
    height: fit.height,
  });
};

const calculateAspectFit = (imageWidth, imageHeight, boxWidth, boxHeight) => {
  const imageAspect = imageWidth / imageHeight;
  const boxAspect = boxWidth / boxHeight;

  let targetWidth, targetHeight;

  if (imageAspect > boxAspect) {
    targetWidth = boxWidth;
    targetHeight = boxWidth / imageAspect;
  } else {
    targetHeight = boxHeight;
    targetWidth = boxHeight * imageAspect;
  }

  return {
    width: Math.round(targetWidth),
    height: Math.round(targetHeight),
    offsetX: Math.round((boxWidth - targetWidth) / 2),
    offsetY: Math.round((boxHeight - targetHeight) / 2),
  };
};

export default convertPdf;
