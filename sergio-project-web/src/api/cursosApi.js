import api from './axios';

export const getCursos = () => api.get('/cursos');
export const getCursoById = (id) => api.get(`/cursos/${id}`);
export const createCurso = (data) => api.post('/cursos', data);
export const updateCurso = (id, data) => api.put(`/cursos/${id}`, data);
export const deleteCurso = (id) => api.delete(`/cursos/${id}`);