const BASE_URL = '/api';

const getHeaders = (isFormData = false) => {
  const token = localStorage.getItem('token');
  const headers = {};
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  if (!isFormData) {
    headers['Content-Type'] = 'application/json';
  }

  return headers;
};

const handleResponse = async (response) => {
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const errorMsg = data.error || data.message || `Error ${response.status}: ${response.statusText}`;
    throw new Error(errorMsg);
  }
  return data;
};

export const api = {
  // Auth API
  async signin(credentials) {
    const res = await fetch(`${BASE_URL}/auth/signin`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials)
    });
    return handleResponse(res);
  },

  async signup(userData) {
    const res = await fetch(`${BASE_URL}/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData)
    });
    return handleResponse(res);
  },

  async getMe() {
    const res = await fetch(`${BASE_URL}/auth/me`, {
      method: 'GET',
      headers: getHeaders()
    });
    return handleResponse(res);
  },

  // Batches API
  async getBatches() {
    const res = await fetch(`${BASE_URL}/batches`, {
      method: 'GET',
      headers: getHeaders()
    });
    return handleResponse(res);
  },

  async createBatch(batchData) {
    const res = await fetch(`${BASE_URL}/batches`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(batchData)
    });
    return handleResponse(res);
  },

  async deleteBatch(id) {
    const res = await fetch(`${BASE_URL}/batches/${id}`, {
      method: 'DELETE',
      headers: getHeaders()
    });
    return handleResponse(res);
  },

  // Students API
  async getStudents(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const url = `${BASE_URL}/students${queryString ? `?${queryString}` : ''}`;
    const res = await fetch(url, {
      method: 'GET',
      headers: getHeaders()
    });
    return handleResponse(res);
  },

  async createStudent(studentData) {
    const res = await fetch(`${BASE_URL}/students`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(studentData)
    });
    return handleResponse(res);
  },

  async updateStudent(id, studentData) {
    const res = await fetch(`${BASE_URL}/students/${id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(studentData)
    });
    return handleResponse(res);
  },

  async deleteStudent(id) {
    const res = await fetch(`${BASE_URL}/students/${id}`, {
      method: 'DELETE',
      headers: getHeaders()
    });
    return handleResponse(res);
  },

  // Semester Fees API
  async setSemesterFeeForBatch(setupData) {
    const res = await fetch(`${BASE_URL}/semester-fees/batch-setup`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(setupData)
    });
    return handleResponse(res);
  },

  async updateStudentSemesterFee(feeData) {
    const res = await fetch(`${BASE_URL}/semester-fees/student`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(feeData)
    });
    return handleResponse(res);
  },

  async getSemesterFeeLedger(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const url = `${BASE_URL}/semester-fees/ledger${queryString ? `?${queryString}` : ''}`;
    const res = await fetch(url, {
      method: 'GET',
      headers: getHeaders()
    });
    return handleResponse(res);
  },

  // Fee Slips API
  async getFinanceSummary() {
    const res = await fetch(`${BASE_URL}/fee-slips/summary`, {
      method: 'GET',
      headers: getHeaders()
    });
    return handleResponse(res);
  },

  async getFeeSlips(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const url = `${BASE_URL}/fee-slips${queryString ? `?${queryString}` : ''}`;
    const res = await fetch(url, {
      method: 'GET',
      headers: getHeaders()
    });
    return handleResponse(res);
  },

  async getFeeSlipById(id) {
    const res = await fetch(`${BASE_URL}/fee-slips/${id}`, {
      method: 'GET',
      headers: getHeaders()
    });
    return handleResponse(res);
  },

  async createFeeSlip(formData) {
    const res = await fetch(`${BASE_URL}/fee-slips`, {
      method: 'POST',
      headers: getHeaders(true),
      body: formData
    });
    return handleResponse(res);
  },

  async updateFeeSlip(id, formData) {
    const res = await fetch(`${BASE_URL}/fee-slips/${id}`, {
      method: 'PUT',
      headers: getHeaders(true),
      body: formData
    });
    return handleResponse(res);
  },

  async deleteFeeSlip(id) {
    const res = await fetch(`${BASE_URL}/fee-slips/${id}`, {
      method: 'DELETE',
      headers: getHeaders()
    });
    return handleResponse(res);
  }
};
