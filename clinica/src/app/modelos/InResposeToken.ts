export interface InResposeToken {
    token?: string;
    success?: boolean;
    message?: string;
    requires2FA?: boolean;
    userId?: number;
    usuario?: any;
}
