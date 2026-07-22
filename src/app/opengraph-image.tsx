import { createSocialImage } from "./social-image";

export { alt, contentType, size } from "./social-image";

export default function OpenGraphImage() {
  return createSocialImage();
}
