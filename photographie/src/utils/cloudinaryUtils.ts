/**
 * Génère une URL Cloudinary avec un filigrane (watermark) appliqué.
 *
 * @param publicId - L'identifiant public de l'image sur Cloudinary.
 * @param options - Options de transformation (largeur, qualité, etc.).
 * @returns L'URL complète de l'image protégée.
 */
export const getWatermarkedImageUrl = (
  source: string,
  options: { width?: number } = {}
) => {
  if (!source) return "";

  const cloudName = "dn1vm2j1g";
  const watermarkId = "watermark_signature"; // Nouvelle signature

  // Construction des transformations
  // Quatre watermarks dans les 4 coins avec effet gravure (grayscale)
  // e_grayscale : Effet gravure en niveaux de gris
  // o_60 : Opacité à 60% pour un effet discret mais visible
  // w_250 : Largeur de 250px
  const transformations = [
    "f_auto,q_auto",
    options.width ? `w_${options.width}` : "",

    `l_${watermarkId},e_grayscale,o_60,w_850,g_south_east,x_15,y_15`, // Coin bas droit
  ]
    .filter(Boolean)
    .join(",");

  // Si c'est déjà une URL Cloudinary complète
  if (source.includes("cloudinary.com") && source.includes("/upload/")) {
    // Éviter de doubler le watermark
    if (source.includes(watermarkId)) return source;

    // Extraire le public_id de l'URL
    // Format: https://res.cloudinary.com/{cloud}/image/upload/{version}/{public_id}.{ext}
    const match = source.match(/\/upload\/(?:v\d+\/)?(.+)$/);
    if (match && match[1]) {
      const publicId = match[1];
      return `https://res.cloudinary.com/${cloudName}/image/upload/${transformations}/${publicId}`;
    }
    // Si on ne peut pas extraire le public_id, retourner l'URL originale
    return source;
  }

  // Si c'est une URL locale ou autre, ne pas toucher
  if (source.startsWith("http") || source.startsWith("/")) {
    return source;
  }

  // Sinon, c'est un public_id direct
  return `https://res.cloudinary.com/${cloudName}/image/upload/${transformations}/${source}`;
};

/**
 * Gestionnaire pour empêcher le clic droit sur les images.
 * À utiliser dans l'attribut onContextMenu des balises <img>.
 */
export const preventRightClick = (e: React.MouseEvent) => {
  e.preventDefault();
};
