const supabaseUrl = 'https://hqomdxggwvkmaovkytld.supabase.co';
const supabasePublicStorageUrl = supabaseUrl + '/storage/v1/public/';

export const environment = {
  supabase: {
    url: supabaseUrl,
    publicStorageUrl: supabasePublicStorageUrl,
    key: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imhxb21keGdnd3ZrbWFvdmt5dGxkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MDczNDk0NDQsImV4cCI6MjAyMjkyNTQ0NH0.tMpDQroK0_zOGlfjZdxVap9Q_vnnZssaWXy06sMv8vo',
  },
  vapidPublicKey:
    'BH1snV0pt9ZbfWNxKvMjkuh1vELvWjg5VaFxw5ITY0eS1bG86ZdQp7wmlfQU8MjXmPftj7qtUBExEhHEqm2VgaM',
};
