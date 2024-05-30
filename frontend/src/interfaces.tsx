export interface Result<T> {
    inner: T,
    is_ok: boolean
  }

/******************************************************************************
Selection Interface
******************************************************************************/

export interface VPIInstanceState {
    hand : number[]
    dealt : boolean
    bet : number
    last_outcome : string
    last_win : number
    timestamp: number
    credits: number

}

export function isVPInstanceState(object : any) : object is VPIInstanceState {
    return !(object instanceof String) &&
    typeof(object) !== "string" &&
    'hand' in object &&
    'dealt' in object &&
    'bet' in object &&
    'last_outcome' in object &&
    'last_win' in object &&
    'timestamp' in object &&
    'credits' in object

}

export interface BJIInstanceState {
    hand : number[]
    dealer: number[]
    dealt : boolean
    bet : number
    outcome : string
    last_win : number
    timestamp: number
    credits: number

}

export function isBJInstanceState(object : any) : object is BJIInstanceState {
    return !(object instanceof String) &&
    typeof(object) !== "string" &&
    'hand' in object &&
    'dealer' in object &&
    'dealt' in object &&
    'bet' in object &&
    'outcome' in object &&
    'last_win' in object &&
    'timestamp' in object &&
    'credits' in object

}

/******************************************************************************
is alias of Interface
******************************************************************************/

export interface IAliasInfo{
    alias_of : String,
} 

export function isAliasInfo(object: any): object is IAliasInfo {
    return !(object instanceof String) &&
    typeof(object) !== "string" &&
    'alias_of' in object
}

export interface IUser{
    kyc_validated: boolean,
    credits : number
} 

export function isUser(object: any): object is IAliasInfo {
    return !(object instanceof String) &&
    typeof(object) !== "string" &&
    'kyc_validated' in object &&
    'credits' in object
}

export interface IAliasMnem{
    mnem : String,
} 

export function isAliasMnem(object: any): object is IAliasMnem {
    return !(object instanceof String) &&
    typeof(object) !== "string" &&
    'mnem' in object
}
