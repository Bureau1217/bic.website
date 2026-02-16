import type { ResponsiveImage } from '~/types/image'

/**
 * Types globaux pour les réponses de l'API CMS (Kirby via KQL).
 * Déclarés dans le scope global pour être accessibles partout sans import.
 */
declare global {

  type CMS_API_Block = {
    id: string,
    type: string,
    content: {
      text?: string,
      level?: string,
      [key: string]: unknown,
    },
  }

  /**
   * Ancien format de fichier CMS (URL brute).
   * Conservé pour rétrocompatibilité (pictos SVG, audio, etc.)
   */
  type CMS_API_File = {
    url: string,
    alt?: string | null,
    width?: number,
    height?: number,
    filename?: string,
    mime?: string,
  }

  /**
   * Nouveau format d'image responsive retourné par $file->historiaImage().
   * Alias global pour ne pas importer le type partout.
   */
  type CMS_API_ResponsiveImage = ResponsiveImage

  type CMS_API_PageItem = {
    title: string,
    slug: string,
  }

  type CMS_API_Image = {
    extension: string,
    filename: string,
    height: number,
    id: string,
    mime: string,
    niceSize: string,
    template: string,
    type: string,
    url: string,
    width: number,
  }

  type CMS_API_ImageObject = {
    alt: null,
    tiny: CMS_API_Image,
    small: CMS_API_Image,
    reg: CMS_API_Image,
    large: CMS_API_Image,
    xxl: CMS_API_Image,
  }

  type CMS_API_Response = {
    code: number,
    status: 'ok' | string,
  }

  type CMS_API_people = {
    prenom: string,
    nom: string,
    image: CMS_API_ImageObject,
    lien: [],
  }

  type CMS_API_domaines_activite = {
    domaines: { titre: string, description: string }[],
    image: string[],
    id: string,
  }

  type CMS_API_hero = {
    titre: string,
    texte: string,
  }

  type CMS_API_Article = {
    main_title: string,
    date: string,
    resume: string,
  }
}

export {}
