export interface APIError {
    code: string;
    description: string;
  }
  
  export interface APIResponse<T> {
    status: string;
    message: string;
    data?: T;
    error?: APIError;
  }