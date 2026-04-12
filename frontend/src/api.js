import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8000',
  timeout: 120000, // 120s timeout — LLM + embedding can take 15-30s
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

export const signup = async (companyName, email, password) => {
  const response = await api.post('/signup', {
    company_name: companyName,
    email,
    password
  });
  return response.data;
};

export const login = async (email, password) => {
  const response = await api.post('/login', {
    email,
    password
  });
  return response.data;
};

export const analyzeResume = async (file, jobDescription, thresholds = null, jdFile = null) => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('job_description', jobDescription || '');
  if (thresholds) {
    formData.append('thresholds', JSON.stringify(thresholds));
  }
  if (jdFile) {
    formData.append('jd_file', jdFile);
  }

  const response = await api.post('/analyze', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

export const rankResumes = async (files, jobDescription, thresholds = null, jdFile = null) => {
  const formData = new FormData();
  files.forEach(file => {
    formData.append('files', file);
  });
  formData.append('job_description', jobDescription || '');
  if (thresholds) {
    formData.append('thresholds', JSON.stringify(thresholds));
  }
  if (jdFile) {
    formData.append('jd_file', jdFile);
  }

  const response = await api.post('/rank', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

export const advancedBatchMatch = async (resumes, jdFiles, thresholds = null) => {
  const formData = new FormData();
  resumes.forEach(file => {
    formData.append('resumes', file);
  });
  jdFiles.forEach(file => {
    formData.append('job_description_files', file);
  });
  if (thresholds) {
    formData.append('thresholds', JSON.stringify(thresholds));
  }

  const response = await api.post('/batch-match', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

export const downloadReport = async (file, jobDescription) => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('job_description', jobDescription);

  const response = await api.post('/report', formData, {
    responseType: 'blob',
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  
  // Create a link and trigger download
  const url = window.URL.createObjectURL(new Blob([response.data]));
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', `Report_${file.name}.pdf`);
  document.body.appendChild(link);
  link.click();
  link.remove();
};

export const getOverviewStats = async () => {
  const response = await api.get('/stats');
  return response.data;
};

export const getHistory = async ({ limit = 200, sort = 'date', order = 'desc', tier = null, status = null } = {}) => {
  const params = { limit, sort, order };
  if (tier && tier !== 'all') params.tier = tier;
  if (status && status !== 'all') params.status = status;
  const response = await api.get('/history', { params });
  return response.data;
};
