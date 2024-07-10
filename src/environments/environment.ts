const supabaseUrl = 'https://bbptbpmmfformxfzkdgl.supabase.co';
const supabasePublicStorageUrl = supabaseUrl + '/storage/v1/public/';

export const environment = {
  supabase: {
    url: supabaseUrl,
    publicStorageUrl: supabasePublicStorageUrl,
    key: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJicHRicG1tZmZvcm14ZnprZGdsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjA1NjkyOTIsImV4cCI6MjAzNjE0NTI5Mn0.Sg9N3RiwNARaxO9xt6RDY7Ksug_sEkYcIOcBKhJnAZU',
  },
  vapidPublicKey:
    'BH1snV0pt9ZbfWNxKvMjkuh1vELvWjg5VaFxw5ITY0eS1bG86ZdQp7wmlfQU8MjXmPftj7qtUBExEhHEqm2VgaM',
};
