declare interface iUser {
  _id: string;
  name: string;
  email: string;
  role: string;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

declare interface iFeature{
    key: string,
    name: string,
    description: string,
    createdAt: string,
    updatedAt: string,
    __v: number,
    _id: string
}