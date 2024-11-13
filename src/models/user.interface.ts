export interface UserReq {
    name: string,
    email: string,
    password: string
}

export interface UserRes{
    id: number,
    name: string,
    email: string,
}