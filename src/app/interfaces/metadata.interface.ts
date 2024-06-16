export interface IMetadata {
    id: number;
    title: string;
    publicationDate: string;
    publicationTime: string;
    imageUrl: string;
    feeds: string;
    authors: string;
    active: string;
  }
  
  export interface ICreateMetadata {
    url: string;
    features: {
      metadata: Partial<IMetadata>;
    };
  }