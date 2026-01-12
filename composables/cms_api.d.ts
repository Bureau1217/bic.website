type CMS_API_Block = {
    id: string,
    type: string,
    content: {
        text?: string,
        level?: string,
        [key: string]: unknown,
    },
}

type CMS_API_File = {
    url: string,
    alt?: string | null,
    width?: number,
    height?: number,
    filename?: string,
    mime?: string,
}

type CMS_API_PageItem = {
    title: string,
    slug: string,
}

type CMS_API_Image = {
    "extension": string,
    "filename": string,
    "height": number,
    "id": string,
    "mime": string,
    "niceSize": "951 B",
    "template": "",
    "type": "image",
    "url": "http://localhost:8000/media/pages/home/0a94594deb-1751548581/capture-decran-2025-07-03-a-15.14.47-50x-q10.png",
    "width": 50
}

type CMS_API_ImageObject = {
    "alt": null,
    "tiny": CMS_API_Image,
    "small": CMS_API_Image,
    "reg": CMS_API_Image,
    "large": CMS_API_Image,
    "xxl": CMS_API_Image,
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
    "domaines": { "titre": string, "description": string }[],
    "image": string[],
    "id": string
}


type CMS_API_hero = {
    titre: string
    texte: string
  }


  type CMS_API_Article = {
    main_title: string
    date: string
    resume: string
  }
