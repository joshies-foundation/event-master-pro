export interface LocalStack {
  apiUrl: string;
  dbUrl: string;
  runtime: string;
}

export function localStack(): LocalStack;
