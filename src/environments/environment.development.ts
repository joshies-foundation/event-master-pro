const supabaseUrl = 'https://jdwvtjrhfsciqttiueud.supabase.co';
const supabasePublicStorageUrl = supabaseUrl + '/storage/v1/public/';

export const environment = {
  supabase: {
    url: supabaseUrl,
    publicStorageUrl: supabasePublicStorageUrl,
    key: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Impkd3Z0anJoZnNjaXF0dGl1ZXVkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzczMDc0ODUsImV4cCI6MjA1Mjg4MzQ4NX0.3LYxVw0OD0iHw9tYqtrjHTbiCnli5dg2vbOGLpKwmGc',
  },
  vapidPublicKey:
    'BH1snV0pt9ZbfWNxKvMjkuh1vELvWjg5VaFxw5ITY0eS1bG86ZdQp7wmlfQU8MjXmPftj7qtUBExEhHEqm2VgaM',
};
