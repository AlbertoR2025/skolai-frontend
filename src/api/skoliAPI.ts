import axios from 'axios';

const API_URL = 'http://127.0.0.1:8000';

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Profesores
export const getProfesores = () => api.get('/profesores');
export const addProfesor = (data: any) => api.post('/profesores', data);
export const updateProfesor = (id: string, data: any) => api.put(`/profesores/${id}`, data);
export const deleteProfesor = (id: string) => api.delete(`/profesores/${id}`);

// Cursos
export const getCursos = () => api.get('/cursos');
export const addCurso = (data: any) => api.post('/cursos', data);
export const deleteCurso = (id: string) => api.delete(`/cursos/${id}`);

// Comunicados
export const getComunicados = () => api.get('/comunicados');
export const addComunicado = (data: any) => api.post('/comunicados', data);
export const deleteComunicado = (id: string) => api.delete(`/comunicados/${id}`);
